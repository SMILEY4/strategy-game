package de.ruegnerlukas.strategygame.backend.gameengine.core

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.AddProductionQueueEntryOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.BuildingProductionQueueEntryData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.CreateCityOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.PlaceMarkerOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.PlaceScoutOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.RemoveProductionQueueEntryOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.SettlerProductionQueueEntryData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerGlobalUpdate
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveAddProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveCreateCity
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolvePlaceMarker
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolvePlaceScout
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveRemoveProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.GameStep
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.GameStep.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.GameStep.GameStepError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PlayerViewCreator
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueAddBuildingEntryCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueAddSettlerEntryCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueRemoveEntryCommandData

class GameStepImpl(
    private val gameExtendedQuery: GameExtendedQuery,
    private val gameExtendedUpdate: GameExtendedUpdate,
    private val eventSystem: EventSystem,
    private val playerViewCreator: PlayerViewCreator
) : GameStep {

    private val metricId = metricCoreAction(GameStep::class)

    override suspend fun perform(
        gameId: String,
        commands: List<Command<*>>,
        userIds: List<String>
    ): Either<GameStepError, Map<String, GameExtendedDTO>> {
        return Monitoring.coTime(metricId) {
            either {
                val game = getGameState(gameId).bind()
                handleCommands(game, commands)
                handleGlobalUpdate(game)
                saveGameState(game)
                userIds.associateWith { userId ->
                    playerViewCreator.build(userId, game)
                }
            }
        }
    }


    /**
     * Find and return the [GameExtended] or [GameNotFoundError] if the game does not exist
     */
    private suspend fun getGameState(gameId: String): Either<GameNotFoundError, GameExtended> {
        return gameExtendedQuery.execute(gameId).mapLeft { GameNotFoundError }
    }


    /**
     * Update the game state in the database
     */
    private suspend fun saveGameState(game: GameExtended) {
        gameExtendedUpdate.execute(game)
    }


    @Suppress("UNCHECKED_CAST")
    private suspend fun handleCommands(game: GameExtended, commands: List<Command<*>>) {
        commands.forEach { command ->
            when (command.data) {
                is CreateCityCommandData -> {
                    val typedCommand = command as Command<CreateCityCommandData>
                    eventSystem.publish(
                        TriggerResolveCreateCity,
                        CreateCityOperationData(
                            game = game,
                            country = getCountryByUser(game, typedCommand.userId),
                            targetName = typedCommand.data.name,
                            targetTile = getTile(game, typedCommand.data.q, typedCommand.data.r),
                            withNewProvince = typedCommand.data.withNewProvince,
                        )
                    )
                }
                is PlaceMarkerCommandData -> {
                    val typedCommand = command as Command<PlaceMarkerCommandData>
                    eventSystem.publish(
                        TriggerResolvePlaceMarker,
                        PlaceMarkerOperationData(
                            game = game,
                            country = getCountryByUser(game, typedCommand.userId),
                            targetTile = getTile(game, typedCommand.data.q, typedCommand.data.r),
                        )
                    )
                }
                is PlaceScoutCommandData -> {
                    val typedCommand = command as Command<PlaceScoutCommandData>
                    eventSystem.publish(
                        TriggerResolvePlaceScout,
                        PlaceScoutOperationData(
                            game = game,
                            country = getCountryByUser(game, typedCommand.userId),
                            targetTile = getTile(game, typedCommand.data.q, typedCommand.data.r),
                        )
                    )
                }
                is ProductionQueueAddBuildingEntryCommandData -> {
                    val typedCommand = command as Command<ProductionQueueAddBuildingEntryCommandData>
                    eventSystem.publish(
                        TriggerResolveAddProductionQueueEntry,
                        AddProductionQueueEntryOperationData(
                            game = game,
                            country = getCountryByUser(game, typedCommand.userId),
                            city = getCity(game, typedCommand.data.cityId),
                            entry = BuildingProductionQueueEntryData(
                                buildingType = typedCommand.data.buildingType
                            )
                        )
                    )
                }
                is ProductionQueueAddSettlerEntryCommandData -> {
                    val typedCommand = command as Command<ProductionQueueAddSettlerEntryCommandData>
                    eventSystem.publish(
                        TriggerResolveAddProductionQueueEntry,
                        AddProductionQueueEntryOperationData(
                            game = game,
                            country = getCountryByUser(game, typedCommand.userId),
                            city = getCity(game, typedCommand.data.cityId),
                            entry = SettlerProductionQueueEntryData()
                        )
                    )
                }
                is ProductionQueueRemoveEntryCommandData -> {
                    val typedCommand = command as Command<ProductionQueueRemoveEntryCommandData>
                    eventSystem.publish(
                        TriggerResolveRemoveProductionQueueEntry,
                        RemoveProductionQueueEntryOperationData(
                            game = game,
                            country = getCountryByUser(game, typedCommand.userId),
                            province = getProvince(game, typedCommand.data.cityId),
                            city = getCity(game, typedCommand.data.cityId),
                            entryId = typedCommand.data.queueEntryId
                        )
                    )
                }
            }
        }
    }

    private suspend fun handleGlobalUpdate(game: GameExtended) {
        eventSystem.publish(TriggerGlobalUpdate, game)
    }

    private fun getCountryByUser(game: GameExtended, userId: String): Country {
        return game.countries.find { it.userId == userId } ?: throw Exception("Could not find country with user-id $userId")
    }

    private fun getTile(game: GameExtended, q: Int, r: Int): Tile {
        return game.tiles.get(q, r) ?: throw Exception("Could not find tile at $q,$r")
    }

    private fun getProvince(game: GameExtended, cityId: String): Province {
        return game.provinces.find { it.cityIds.contains(cityId) } ?: throw Exception("Could not find province for city with id $cityId")
    }

    private fun getCity(game: GameExtended, cityId: String): City {
        return game.cities.find { it.cityId == cityId } ?: throw Exception("Could not find city with id $cityId")
    }

}