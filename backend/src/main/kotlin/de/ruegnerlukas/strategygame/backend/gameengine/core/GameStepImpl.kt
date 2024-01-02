package de.ruegnerlukas.strategygame.backend.gameengine.core

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.AddProductionQueueEntryOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.BuildingProductionQueueEntryData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.CreateCityOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.DeleteMarkerOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.PlaceMarkerOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.PlaceScoutOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.RemoveProductionQueueEntryOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.SettlerProductionQueueEntryData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerGlobalUpdate
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveAddProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveCreateCity
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveDeleteMarker
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolvePlaceMarker
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolvePlaceScout
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveRemoveProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveUpgradeSettlementTier
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.UpgradeSettlementTierOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.nextTier
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.GameStep
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.GameStep.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.GameStep.GameStepError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.POVBuilder
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.DeleteMarkerCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueAddBuildingEntryCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueAddSettlerEntryCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueRemoveEntryCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.UpgradeSettlementTierCommandData

class GameStepImpl(
    private val gameExtendedQuery: GameExtendedQuery,
    private val gameExtendedUpdate: GameExtendedUpdate,
    private val eventSystem: EventSystem,
    private val playerViewCreator: POVBuilder
) : GameStep {

    private val metricId = MetricId.action(GameStep::class)

    override suspend fun perform(
        gameId: String,
        commands: Collection<Command<*>>,
        userIds: Collection<String>
    ): Either<GameStepError, Map<String, JsonType>> {
        return time(metricId) {
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
    private suspend fun handleCommands(game: GameExtended, commands: Collection<Command<*>>) {
        commands.forEach { command ->
            when (command.data) {
                is CreateCityCommandData -> {
                    val typedCommand = command as Command<CreateCityCommandData>
                    eventSystem.publish(
                        TriggerResolveCreateCity,
                        CreateCityOperationData(
                            game = game,
                            country = game.findCountryByUser(typedCommand.userId),
                            targetName = typedCommand.data.name,
                            targetTile = game.findTile(typedCommand.data.q, typedCommand.data.r),
                            withNewProvince = typedCommand.data.withNewProvince,
                        )
                    )
                }
                is UpgradeSettlementTierCommandData -> {
                    val typedCommand = command as Command<UpgradeSettlementTierCommandData>
                    val city = game.findCity(typedCommand.data.cityId)
                    eventSystem.publish(
                        TriggerResolveUpgradeSettlementTier,
                        UpgradeSettlementTierOperationData(
                            game = game,
                            city = city,
                            targetTier = city.tier.nextTier() ?: city.tier
                        )
                    )
                }
                is PlaceMarkerCommandData -> {
                    val typedCommand = command as Command<PlaceMarkerCommandData>
                    eventSystem.publish(
                        TriggerResolvePlaceMarker,
                        PlaceMarkerOperationData(
                            game = game,
                            country = game.findCountryByUser(typedCommand.userId),
                            targetTile = game.findTile(typedCommand.data.q, typedCommand.data.r),
                            label = typedCommand.data.label
                        )
                    )
                }
                is DeleteMarkerCommandData -> {
                    val typedCommand = command as Command<DeleteMarkerCommandData>
                    eventSystem.publish(
                        TriggerResolveDeleteMarker,
                        DeleteMarkerOperationData(
                            game = game,
                            country = game.findCountryByUser(typedCommand.userId),
                            targetTile = game.findTile(typedCommand.data.q, typedCommand.data.r),
                        )
                    )
                }
                is PlaceScoutCommandData -> {
                    val typedCommand = command as Command<PlaceScoutCommandData>
                    eventSystem.publish(
                        TriggerResolvePlaceScout,
                        PlaceScoutOperationData(
                            game = game,
                            country = game.findCountryByUser(typedCommand.userId),
                            targetTile = game.findTile(typedCommand.data.q, typedCommand.data.r),
                        )
                    )
                }
                is ProductionQueueAddBuildingEntryCommandData -> {
                    val typedCommand = command as Command<ProductionQueueAddBuildingEntryCommandData>
                    eventSystem.publish(
                        TriggerResolveAddProductionQueueEntry,
                        AddProductionQueueEntryOperationData(
                            game = game,
                            country = game.findCountryByUser(typedCommand.userId),
                            city = game.findCity(typedCommand.data.cityId),
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
                            country = game.findCountryByUser(typedCommand.userId),
                            city = game.findCity(typedCommand.data.cityId),
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
                            country = game.findCountryByUser(typedCommand.userId),
                            province = game.findProvinceByCity(typedCommand.data.cityId),
                            city = game.findCity(typedCommand.data.cityId),
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

}