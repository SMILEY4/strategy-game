package io.github.smiley4.strategygame.backend.engine.module.core

import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.models.Command
import io.github.smiley4.strategygame.backend.common.models.CreateCityCommandData
import io.github.smiley4.strategygame.backend.common.models.DeleteMarkerCommandData
import io.github.smiley4.strategygame.backend.common.models.PlaceMarkerCommandData
import io.github.smiley4.strategygame.backend.common.models.PlaceScoutCommandData
import io.github.smiley4.strategygame.backend.common.models.ProductionQueueAddBuildingEntryCommandData
import io.github.smiley4.strategygame.backend.common.models.ProductionQueueAddSettlerEntryCommandData
import io.github.smiley4.strategygame.backend.common.models.ProductionQueueRemoveEntryCommandData
import io.github.smiley4.strategygame.backend.common.models.UpgradeSettlementTierCommandData
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.EntityNotFoundError
import io.github.smiley4.strategygame.backend.engine.core.gamestep.AddProductionQueueEntryOperationData
import io.github.smiley4.strategygame.backend.engine.core.gamestep.BuildingProductionQueueEntryData
import io.github.smiley4.strategygame.backend.engine.core.gamestep.CreateCityOperationData
import io.github.smiley4.strategygame.backend.engine.core.gamestep.DeleteMarkerOperationData
import io.github.smiley4.strategygame.backend.engine.core.gamestep.PlaceMarkerOperationData
import io.github.smiley4.strategygame.backend.engine.core.gamestep.PlaceScoutOperationData
import io.github.smiley4.strategygame.backend.engine.core.gamestep.RemoveProductionQueueEntryOperationData
import io.github.smiley4.strategygame.backend.engine.core.gamestep.SettlerProductionQueueEntryData
import io.github.smiley4.strategygame.backend.engine.core.gamestep.TriggerGlobalUpdate
import io.github.smiley4.strategygame.backend.engine.core.gamestep.TriggerResolveAddProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.TriggerResolveCreateCity
import io.github.smiley4.strategygame.backend.engine.core.gamestep.TriggerResolveDeleteMarker
import io.github.smiley4.strategygame.backend.engine.core.gamestep.TriggerResolvePlaceMarker
import io.github.smiley4.strategygame.backend.engine.core.gamestep.TriggerResolvePlaceScout
import io.github.smiley4.strategygame.backend.engine.core.gamestep.TriggerResolveRemoveProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.TriggerResolveUpgradeSettlementTier
import io.github.smiley4.strategygame.backend.engine.core.gamestep.UpgradeSettlementTierOperationData
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.models.nextTier
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep
import io.github.smiley4.strategygame.backend.engine.ports.provided.POVBuilder
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExtendedQuery
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExtendedUpdate


class GameStepImpl(
    private val gameExtendedQuery: GameExtendedQuery,
    private val gameExtendedUpdate: GameExtendedUpdate,
    private val eventSystem: EventSystem,
    private val playerViewCreator: POVBuilder
) : GameStep, Logging {

    private val metricId = MetricId.action(GameStep::class)

    override suspend fun perform(gameId: String, commands: Collection<Command<*>>, userIds: Collection<String>): Map<String, JsonType> {
        return time(metricId) {
            val game = getGameState(gameId)
            handleCommands(game, commands)
            handleGlobalUpdate(game)
            prepareNextTurn(game)
            saveGameState(game)
            userIds.associateWith { userId ->
                playerViewCreator.build(userId, game)
            }
        }
    }


    /**
     * Find and return the [GameExtended] or [GameNotFoundError] if the game does not exist
     */
    private suspend fun getGameState(gameId: String): GameExtended {
        try {
            return gameExtendedQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameStep.GameNotFoundError()
        }
    }


    private fun prepareNextTurn(game: GameExtended) {
        game.meta.turn += 1
    }


    /**
     * Update the game state in the database
     */
    private suspend fun saveGameState(game: GameExtended) {
        gameExtendedUpdate.execute(game)
    }


    private suspend fun handleCommands(game: GameExtended, commands: Collection<Command<*>>) {
        commands.forEach { command ->
            try {
                handleCommand(command, game)
            } catch (e: Exception) {
                log().warn("Unhandled command due to exception", e)
            }
        }
    }

    @Suppress("UNCHECKED_CAST")
    private suspend fun handleCommand(command: Command<*>, game: GameExtended) {
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

    private suspend fun handleGlobalUpdate(game: GameExtended) {
        eventSystem.publish(TriggerGlobalUpdate, game)
    }

}