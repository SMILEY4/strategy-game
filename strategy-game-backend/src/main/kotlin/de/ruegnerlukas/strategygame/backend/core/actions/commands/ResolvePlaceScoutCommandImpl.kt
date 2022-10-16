package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.actions.commands.PlaceScoutValidations.validateCommand
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
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.validation.ValidationContext
import de.ruegnerlukas.strategygame.backend.shared.validation.validations

class ResolvePlaceScoutCommandImpl(
    private val gameConfig: GameConfig
) : ResolvePlaceScoutCommand, Logging {

    private val metricId = metricCoreAction(ResolvePlaceScoutCommand::class)

    override suspend fun perform(
        command: CommandEntity<PlaceScoutCommandDataEntity>,
        game: GameExtendedEntity
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        return Monitoring.coTime(metricId) {
            log().info("Resolving 'place-scout'-command for game ${game.game.key} and country ${command.countryId}")
            either {
                val targetTile = findTile(command.data.q, command.data.r, game).bind()
                validateCommand(gameConfig, command.countryId, targetTile, game).ifInvalid<Unit> { reasons ->
                    return@either reasons.map { CommandResolutionError(command, it) }
                }
                addScout(targetTile, command.countryId, command.turn)
                emptyList()
            }
        }
    }


    private fun findTile(q: Int, r: Int, state: GameExtendedEntity): Either<ResolveCommandsActionError, TileEntity> {
        val targetTile = state.tiles.find { it.position.q == q && it.position.r == r }
        return targetTile?.right() ?: ResolveCommandsAction.TileNotFoundError.left()
    }


    private fun addScout(tile: TileEntity, countryId: String, turn: Int) {
        tile.content.add(ScoutTileContent(countryId, turn))
    }

}


private object PlaceScoutValidations {

    fun validateCommand(gameConfig: GameConfig, countryId: String, targetTile: TileEntity, game: GameExtendedEntity): ValidationContext {
        return validations(false) {
            validTileVisibility(countryId, targetTile)
            validTileSpace(countryId, targetTile)
            validScoutAmount(gameConfig, countryId, game.tiles)
        }
    }


    fun ValidationContext.validTileVisibility(countryId: String, tile: TileEntity) {
        validate("SCOUT.TILE_VISIBILITY") {
            tile.discoveredByCountries.contains(countryId)
        }
    }

    fun ValidationContext.validTileSpace(countryId: String, tile: TileEntity) {
        validate("SCOUT.TILE_SPACE") {
            tile.content
                .filter { it.type == ScoutTileContent.TYPE }
                .map { it as ScoutTileContent }
                .none { it.countryId == countryId }
        }
    }

    fun ValidationContext.validScoutAmount(gameConfig: GameConfig, countryId: String, tiles: List<TileEntity>) {
        validate("SCOUT.AMOUNT") {
            tiles
                .asSequence()
                .mapNotNull { tile -> tile.content.find { it.type == ScoutTileContent.TYPE }?.let { it as ScoutTileContent } }
                .filter { scout -> scout.countryId == countryId }
                .count() < gameConfig.scoutsMaxAmount
        }
    }

}