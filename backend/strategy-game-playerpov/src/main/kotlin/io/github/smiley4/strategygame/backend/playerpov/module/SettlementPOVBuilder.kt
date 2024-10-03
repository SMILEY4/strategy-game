package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.ProductionIds
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.Settlement


internal class SettlementPOVBuilder(private val povCache: POVCache) {

    fun build(settlement: Settlement): JsonType? {

        val visibility = povCache.settlementVisibility(settlement.id)
        if (visibility.isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return null
        }

        return obj {
            "id" to settlement.id.value
            "color" to obj {
                "red" to settlement.attributes.color.red
                "green" to settlement.attributes.color.green
                "blue" to settlement.attributes.color.blue
            }
            "name" to settlement.attributes.name
            "country" to settlement.country.value
            "tile" to obj {
                "id" to settlement.tile.id.value
                "q" to settlement.tile.q
                "r" to settlement.tile.r
            }
            "productionQueue" to objHidden(visibility.isAtLeast(TileVisibilityDTO.VISIBLE)) {
                settlement.infrastructure.productionQueue.map {
                    when (it) {
                        is ProductionQueueEntry.Settler -> obj {
                            "entryId" to it.id.value
                            "type" to ProductionIds.settler()
                            "progress" to calculateProgress(it)
                        }
                        is ProductionQueueEntry.Building -> obj {
                            "entryId" to it.id.value
                            "type" to ProductionIds.building(it.building)
                            "progress" to calculateProgress(it)
                        }
                    }
                }
            }
            "productionOptions" to objHidden(povCache.povCountryId == settlement.country) {
                buildList<JsonType> {
                    add(obj {
                        "type" to ProductionIds.settler()
                    })
                    BuildingType.entries.forEach { buildingType ->
                        add(obj {
                            "type" to ProductionIds.building(buildingType)
                        })
                    }
                }
            }
            "buildings" to objHidden(visibility.isAtLeast(TileVisibilityDTO.VISIBLE)) {
                settlement.infrastructure.buildings.map {
                    obj {
                        "type" to ProductionIds.building(it.type)
                        "workedTile" to it.workedTile?.let { workedTile ->
                            obj {
                                "id" to workedTile.id.value
                                "q" to workedTile.q
                                "r" to workedTile.r
                            }
                        }
                        "active" to it.active
                        "details" to null // todo
                    }
                }
            }
        }
    }

    private fun calculateProgress(queueEntry: ProductionQueueEntry): Float {
        val totalRequired = queueEntry.requiredResources.toList().map { (_, amount) -> amount }.sum()
        val totalCollected = queueEntry.collectedResources.toList().map { (_, amount) -> amount }.sum()
        return (totalCollected / totalRequired).coerceIn(0f, 1f)
    }

}