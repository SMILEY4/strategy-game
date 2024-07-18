//package io.github.smiley4.strategygame.backend.engine.moduleold
//
//import io.github.smiley4.strategygame.backend.common.events.EventSystem
//import io.github.smiley4.strategygame.backend.common.logging.Logging
//import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
//import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
//import io.github.smiley4.strategygame.backend.commondata.Command
//import io.github.smiley4.strategygame.backend.commondata.CreateCityCommandData
//import io.github.smiley4.strategygame.backend.commondata.DeleteMarkerCommandData
//import io.github.smiley4.strategygame.backend.commondata.GameExtended
//import io.github.smiley4.strategygame.backend.commondata.PlaceMarkerCommandData
//import io.github.smiley4.strategygame.backend.commondata.PlaceScoutCommandData
//import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddBuildingEntryCommandData
//import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddSettlerEntryCommandData
//import io.github.smiley4.strategygame.backend.commondata.ProductionQueueRemoveEntryCommandData
//import io.github.smiley4.strategygame.backend.commondata.UpgradeSettlementTierCommandData
//import io.github.smiley4.strategygame.backend.commondata.nextTier
//import io.github.smiley4.strategygame.backend.engine.edge.GameStep
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.AddProductionQueueEntryOperationData
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.BuildingProductionQueueEntryData
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.CreateCityOperationData
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.DeleteMarkerOperationData
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.PlaceMarkerOperationData
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.PlaceScoutOperationData
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.RemoveProductionQueueEntryOperationData
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.SettlerProductionQueueEntryData
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.TriggerGlobalUpdate
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.TriggerResolveAddProductionQueueEntry
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.TriggerResolveCreateCity
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.TriggerResolveDeleteMarker
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.TriggerResolvePlaceMarker
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.TriggerResolvePlaceScout
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.TriggerResolveRemoveProductionQueueEntry
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.TriggerResolveUpgradeSettlementTier
//import io.github.smiley4.strategygame.backend.engine.moduleold.gamestep.UpgradeSettlementTierOperationData
//
//
//class GameStepImpl(
//    private val eventSystem: EventSystem,
//) : GameStep, Logging {
//
//    private val metricId = MetricId.action(GameStep::class)
//
//    override suspend fun perform(game: GameExtended, commands: Collection<Command<*>>) {
//        return time(metricId) {
//            handleCommands(game, commands)
//            handleGlobalUpdate(game)
//            prepareNextTurn(game)
//        }
//    }
//
//
//
//    private fun prepareNextTurn(game: GameExtended) {
//        game.meta.turn += 1
//    }
//
//
//
//    private suspend fun handleCommands(game: GameExtended, commands: Collection<Command<*>>) {
//        commands.forEach { command ->
//            try {
//                handleCommand(command, game)
//            } catch (e: Exception) {
//                log().warn("Unhandled command due to exception", e)
//            }
//        }
//    }
//
//    @Suppress("UNCHECKED_CAST")
//    private suspend fun handleCommand(command: Command<*>, game: GameExtended) {
//        when (command.data) {
//            is CreateCityCommandData -> {
//                val typedCommand = command as Command<CreateCityCommandData>
//                eventSystem.publish(
//                    TriggerResolveCreateCity,
//                    CreateCityOperationData(
//                        game = game,
//                        country = game.findCountryByUser(typedCommand.userId),
//                        targetName = typedCommand.data.name,
//                        targetTile = game.findTile(typedCommand.data.q, typedCommand.data.r),
//                        withNewProvince = typedCommand.data.withNewProvince,
//                    )
//                )
//            }
//            is UpgradeSettlementTierCommandData -> {
//                val typedCommand = command as Command<UpgradeSettlementTierCommandData>
//                val city = game.findCity(typedCommand.data.cityId)
//                eventSystem.publish(
//                    TriggerResolveUpgradeSettlementTier,
//                    UpgradeSettlementTierOperationData(
//                        game = game,
//                        city = city,
//                        targetTier = city.tier.nextTier() ?: city.tier
//                    )
//                )
//            }
//            is PlaceMarkerCommandData -> {
//                val typedCommand = command as Command<PlaceMarkerCommandData>
//                eventSystem.publish(
//                    TriggerResolvePlaceMarker,
//                    PlaceMarkerOperationData(
//                        game = game,
//                        country = game.findCountryByUser(typedCommand.userId),
//                        targetTile = game.findTile(typedCommand.data.q, typedCommand.data.r),
//                        label = typedCommand.data.label
//                    )
//                )
//            }
//            is DeleteMarkerCommandData -> {
//                val typedCommand = command as Command<DeleteMarkerCommandData>
//                eventSystem.publish(
//                    TriggerResolveDeleteMarker,
//                    DeleteMarkerOperationData(
//                        game = game,
//                        country = game.findCountryByUser(typedCommand.userId),
//                        targetTile = game.findTile(typedCommand.data.q, typedCommand.data.r),
//                    )
//                )
//            }
//            is PlaceScoutCommandData -> {
//                val typedCommand = command as Command<PlaceScoutCommandData>
//                eventSystem.publish(
//                    TriggerResolvePlaceScout,
//                    PlaceScoutOperationData(
//                        game = game,
//                        country = game.findCountryByUser(typedCommand.userId),
//                        targetTile = game.findTile(typedCommand.data.q, typedCommand.data.r),
//                    )
//                )
//            }
//            is ProductionQueueAddBuildingEntryCommandData -> {
//                val typedCommand = command as Command<ProductionQueueAddBuildingEntryCommandData>
//                eventSystem.publish(
//                    TriggerResolveAddProductionQueueEntry,
//                    AddProductionQueueEntryOperationData(
//                        game = game,
//                        country = game.findCountryByUser(typedCommand.userId),
//                        city = game.findCity(typedCommand.data.cityId),
//                        entry = BuildingProductionQueueEntryData(
//                            buildingType = typedCommand.data.buildingType
//                        )
//                    )
//                )
//            }
//            is ProductionQueueAddSettlerEntryCommandData -> {
//                val typedCommand = command as Command<ProductionQueueAddSettlerEntryCommandData>
//                eventSystem.publish(
//                    TriggerResolveAddProductionQueueEntry,
//                    AddProductionQueueEntryOperationData(
//                        game = game,
//                        country = game.findCountryByUser(typedCommand.userId),
//                        city = game.findCity(typedCommand.data.cityId),
//                        entry = SettlerProductionQueueEntryData()
//                    )
//                )
//            }
//            is ProductionQueueRemoveEntryCommandData -> {
//                val typedCommand = command as Command<ProductionQueueRemoveEntryCommandData>
//                eventSystem.publish(
//                    TriggerResolveRemoveProductionQueueEntry,
//                    RemoveProductionQueueEntryOperationData(
//                        game = game,
//                        country = game.findCountryByUser(typedCommand.userId),
//                        province = game.findProvinceByCity(typedCommand.data.cityId),
//                        city = game.findCity(typedCommand.data.cityId),
//                        entryId = typedCommand.data.queueEntryId
//                    )
//                )
//            }
//        }
//    }
//
//    private suspend fun handleGlobalUpdate(game: GameExtended) {
//        eventSystem.publish(TriggerGlobalUpdate, game)
//    }
//
//}