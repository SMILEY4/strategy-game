package de.ruegnerlukas.strategygame.backend.gameengine.core.commandresolution

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.PlaceScoutAction
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.common.utils.ValidationContext
import de.ruegnerlukas.strategygame.backend.common.utils.validations
import de.ruegnerlukas.strategygame.backend.gameengine.core.commandresolution.ResolvePlaceScoutCommandImpl.Companion.PlaceScoutValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.ResolvePlaceScoutCommand

class ResolvePlaceScoutCommandImpl(
    private val gameConfig: GameConfig,
    private val placeScoutAction: PlaceScoutAction
) : ResolvePlaceScoutCommand, Logging {

    private val metricId = metricCoreAction(ResolvePlaceScoutCommand::class)

    override suspend fun perform(
        command: Command<PlaceScoutCommandData>,
        game: GameExtended
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        return Monitoring.coTime(metricId) {
            log().info("Resolving '${command.data.displayName()}'-command for game ${game.game.gameId} and country ${command.countryId}")
            either {
                val targetTile = findTile(command.data.q, command.data.r, game).bind()
                validateCommand(gameConfig, command.countryId, targetTile, game).ifInvalid<Unit> { reasons ->
                    return@either reasons.map { CommandResolutionError(command, it) }
                }
                placeScoutAction.performPlaceScout(game, command)
                emptyList()
            }
        }
    }

    private fun findTile(q: Int, r: Int, state: GameExtended): Either<ResolveCommandsActionError, Tile> {
        val targetTile = state.tiles.find { it.position.q == q && it.position.r == r }
        return targetTile?.right() ?: ResolveCommandsAction.TileNotFoundError.left()
    }

    companion object {
        private object PlaceScoutValidations {

            fun validateCommand(gameConfig: GameConfig, countryId: String, targetTile: Tile, game: GameExtended): ValidationContext {
                return validations(false) {
                    validTileVisibility(countryId, targetTile)
                    validTileSpace(countryId, targetTile)
                    validScoutAmount(gameConfig, countryId, game.tiles)
                }
            }

            fun ValidationContext.validTileVisibility(countryId: String, tile: Tile) {
                validate("SCOUT.TILE_VISIBILITY") {
                    tile.discoveredByCountries.contains(countryId)
                }
            }

            fun ValidationContext.validTileSpace(countryId: String, tile: Tile) {
                validate("SCOUT.TILE_SPACE") {
                    tile.content
                        .filterIsInstance<ScoutTileContent>()
                        .none { it.countryId == countryId }
                }
            }

            fun ValidationContext.validScoutAmount(gameConfig: GameConfig, countryId: String, tiles: Collection<Tile>) {
                validate("SCOUT.AMOUNT") {
                    tiles
                        .asSequence()
                        .mapNotNull { tile -> tile.content.find { it is ScoutTileContent }?.let { it as ScoutTileContent } }
                        .filter { scout -> scout.countryId == countryId }
                        .count() < gameConfig.scoutsMaxAmount
                }
            }

        }
    }

}