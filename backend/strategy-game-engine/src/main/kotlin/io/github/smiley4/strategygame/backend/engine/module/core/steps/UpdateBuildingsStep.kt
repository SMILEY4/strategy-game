package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.notContainedIn
import io.github.smiley4.strategygame.backend.commondata.Building
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileResourceType
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.commondata.requiresTile
import io.github.smiley4.strategygame.backend.engine.edge.SettlementUtilities
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.events.ProducedBuildingEvent
import io.github.smiley4.strategygame.backend.engine.module.core.events.UpdateWorldEvent

internal abstract class UpdateBuildingsStep(private val settlementUtilities: SettlementUtilities) {

    class OnCreation(settlementUtilities: SettlementUtilities) : UpdateBuildingsStep(settlementUtilities),
        GameEventNode<ProducedBuildingEvent>, Logging {
        override fun handle(event: ProducedBuildingEvent, publisher: GameEventPublisher) {
            log().info("Updating building.")
            prepareBuilding(event.building)
            update(event.game, event.settlement, event.building)
        }
    }

    class OnUpdate(settlementUtilities: SettlementUtilities) : UpdateBuildingsStep(settlementUtilities), GameEventNode<UpdateWorldEvent>,
        Logging {
        override fun handle(event: UpdateWorldEvent, publisher: GameEventPublisher) {
            log().info("Updating buildings.")
            event.game.settlements.forEach { settlement ->
                settlement.infrastructure.buildings.forEach { building ->
                    prepareBuilding(building)
                }
                settlement.infrastructure.buildings.forEach { building ->
                    update(event.game, settlement, building)
                }
            }
        }
    }

    protected fun prepareBuilding(building: Building) {
        building.workedTile = null
        building.active = false
    }

    protected fun update(game: GameExtended, settlement: Settlement, building: Building) {
        recalculateWorkTile(game, settlement, building)
        recalculateActiveState(building)
    }

    private fun recalculateWorkTile(game: GameExtended, settlement: Settlement, building: Building) {
        var workTile: Tile? = null

        if (building.type.templateData.requiresTile()) {
            val availableTiles = settlementUtilities.getPossibleWorkTiles(game, settlement, building.type).toList()
            val availablePreferredTiles = availableTiles.filter {
                if (building.type.templateData.requiredTileResource == null) {
                    it.dataWorld.resourceType == TileResourceType.NONE
                } else {
                    true
                }
            }
            val availablePossibleTiles = availableTiles.filter { it.notContainedIn(availablePreferredTiles) }
            workTile = availablePreferredTiles.randomOrNull() ?: availablePossibleTiles.randomOrNull()

            building.workedTile = workTile?.ref()
        }
    }

    private fun recalculateActiveState(building: Building) {
        building.active = if (building.type.templateData.requiresTile()) building.workedTile != null else true
    }

}