package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.EventTriggerDefinition
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended


object TriggerGlobalUpdate : EventTriggerDefinition<GameExtended>()

object TriggerResolveCreateCity : EventTriggerDefinition<CreateCityOperationData>()
object TriggerResolvePlaceMarker : EventTriggerDefinition<PlaceMarkerOperationData>()
object TriggerResolveDeleteMarker : EventTriggerDefinition<DeleteMarkerOperationData>()
object TriggerResolvePlaceScout : EventTriggerDefinition<PlaceScoutOperationData>()
object TriggerResolveAddProductionQueueEntry : EventTriggerDefinition<AddProductionQueueEntryOperationData>()
object TriggerResolveRemoveProductionQueueEntry : EventTriggerDefinition<RemoveProductionQueueEntryOperationData>()
object TriggerResolveUpgradeSettlementTier : EventTriggerDefinition<UpgradeSettlementTierOperationData>()

object TriggerCreateBuilding : EventTriggerDefinition<CreateBuildingData>()