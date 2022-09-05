package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceScoutCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceScoutCommand
import de.ruegnerlukas.strategygame.backend.shared.Logging

class ResolvePlaceScoutCommandImpl(
    private val gameConfig: GameConfig
) : ResolvePlaceScoutCommand, Logging {

    override suspend fun perform(
        command: CommandEntity<PlaceScoutCommandDataEntity>,
        game: GameExtendedEntity
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        log().info("Resolving 'place-scout'-command for game ${game.game.key} and country ${command.countryId}")
        return either {
            val targetTile = findTile(command.data.q, command.data.r, game).bind()
            val validationErrors = validateCommand(command.countryId, targetTile, game)
            if (validationErrors.isEmpty()) {
                addScout(targetTile, command.countryId, command.turn)
                emptyList()
            } else {
                validationErrors.map { CommandResolutionError(command, it) }
            }
        }
    }


    private fun findTile(q: Int, r: Int, state: GameExtendedEntity): Either<ResolveCommandsActionError, TileEntity> {
        val targetTile = state.tiles.find { it.position.q == q && it.position.r == r }
        return targetTile?.right() ?: ResolveCommandsAction.TileNotFoundError.left()
    }


    private fun validateCommand(countryId: String, targetTile: TileEntity, game: GameExtendedEntity): List<String> {
        return mutableListOf<String>().apply {
            addAll(validateFreeTile(countryId, targetTile))
            addAll(validateDiscoveredTile(countryId, targetTile))
            addAll(validateScoutCount(countryId, game.tiles))
        }
    }

    private fun validateDiscoveredTile(countryId: String, tile: TileEntity): List<String> {
        return if (tile.discoveredByCountries.contains(countryId)) {
            emptyList()
        } else {
            listOf("Cannot place scout on unknown tile")
        }
    }

    private fun validateFreeTile(countryId: String, tile: TileEntity): List<String> {
        val alreadyHasScout = tile.content
            .filter { it.type == ScoutTileContent.TYPE }
            .map { it as ScoutTileContent }
            .any { it.countryId == countryId }
        if (alreadyHasScout) {
            return listOf("already another scout at position")
        } else {
            return emptyList()
        }
    }

    private fun validateScoutCount(countryId: String, tiles: List<TileEntity>): List<String> {
        val scoutCount = tiles
            .asSequence()
            .mapNotNull { tile -> tile.content.find { it.type == ScoutTileContent.TYPE }?.let { it as ScoutTileContent } }
            .filter { scout -> scout.countryId == countryId }
            .count()
        return if (scoutCount >= gameConfig.scoutsMaxAmount) {
            listOf("Max amount of scouts reached")
        } else {
            emptyList()
        }
    }


    private fun addScout(tile: TileEntity, countryId: String, turn: Int) {
        tile.content.add(ScoutTileContent(countryId, turn))
    }

}