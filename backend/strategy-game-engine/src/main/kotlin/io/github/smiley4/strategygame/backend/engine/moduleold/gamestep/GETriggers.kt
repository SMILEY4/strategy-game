package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.EventTriggerDefinition
import io.github.smiley4.strategygame.backend.commondata.GameExtended


object TriggerGlobalUpdate : EventTriggerDefinition<GameExtended>()

object TriggerResolveCreateCity : EventTriggerDefinition<CreateCityOperationData>()
object TriggerResolvePlaceMarker : EventTriggerDefinition<PlaceMarkerOperationData>()
object TriggerResolveDeleteMarker : EventTriggerDefinition<DeleteMarkerOperationData>()
object TriggerResolvePlaceScout : EventTriggerDefinition<PlaceScoutOperationData>()
object TriggerResolveAddProductionQueueEntry : EventTriggerDefinition<AddProductionQueueEntryOperationData>()
object TriggerResolveRemoveProductionQueueEntry : EventTriggerDefinition<RemoveProductionQueueEntryOperationData>()
object TriggerResolveUpgradeSettlementTier : EventTriggerDefinition<UpgradeSettlementTierOperationData>()

object TriggerCreateBuilding : EventTriggerDefinition<CreateBuildingData>()