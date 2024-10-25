package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.BooleanDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.BuildingTypeDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.FloatDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.IntDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.ProductionIds
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.ResourcesDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.TextDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.TileRefDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.requiresTile
import io.github.smiley4.strategygame.backend.engine.edge.SettlementUtilities


internal class SettlementPOVBuilder(private val povCache: POVCache, private val settlementUtilities: SettlementUtilities) {

    fun build(game: GameExtended, settlement: Settlement): JsonType? {

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
                        "availableTiles" to null
                    })
                    BuildingType.entries.forEach { buildingType ->
                        add(obj {
                            "type" to ProductionIds.building(buildingType)
                            "availableTiles" to countWorkTile(game, settlement, buildingType)
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
                        "active" to (it.requirements.fulfillsTile && it.requirements.fulfillsInputResources)
                        "details" to it.details.getDetails().map { detail -> // todo: mapping as shared code -> see DetailLogPOVBuilder
                            obj {
                                "id" to detail.id
                                "data" to detail.data.map { (key, value) ->
                                    obj {
                                        "key" to key
                                        "type" to when(value) {
                                            is BooleanDetailLogValue -> "boolean"
                                            is FloatDetailLogValue -> "number"
                                            is IntDetailLogValue -> "number"
                                            is TextDetailLogValue -> "text"
                                            is TileRefDetailLogValue -> "tile"
                                            is BuildingTypeDetailLogValue -> "building"
                                            is ResourcesDetailLogValue -> "resources"
                                        }
                                        "value" to when(value) {
                                            is BooleanDetailLogValue -> value.value
                                            is FloatDetailLogValue -> value.value
                                            is IntDetailLogValue -> value.value
                                            is TextDetailLogValue -> value.value
                                            is TileRefDetailLogValue -> obj {
                                                "id" to value.value.id.value
                                                "q" to value.value.q
                                                "r" to value.value.r
                                            }
                                            is BuildingTypeDetailLogValue -> value.value.name
                                            is ResourcesDetailLogValue -> value.value.toStacks().map { stack ->
                                                obj {
                                                    "type" to stack.type.name
                                                    "amount" to stack.amount
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            "resources" to objHidden(povCache.povCountryId == settlement.country) {
                settlement.resourceLedger.getEntries().map { entry ->
                    obj { // todo: mapping as shared code -> see DetailLogPOVBuilder
                        "type" to entry.resourceType
                        "produced" to entry.produced
                        "consumed" to entry.consumed
                        "amount" to entry.produced - entry.consumed
                        "missing" to entry.missing
                        "details" to entry.getDetails().map { detail ->
                            obj {
                                "id" to detail.id
                                "data" to detail.data.map { (key, value) ->
                                    obj {
                                        "key" to key
                                        "type" to when(value) {
                                            is BooleanDetailLogValue -> "boolean"
                                            is FloatDetailLogValue -> "number"
                                            is IntDetailLogValue -> "number"
                                            is TextDetailLogValue -> "text"
                                            is TileRefDetailLogValue -> "tile"
                                            is BuildingTypeDetailLogValue -> "building"
                                            is ResourcesDetailLogValue -> "resources"
                                        }
                                        "value" to when(value) {
                                            is BooleanDetailLogValue -> value.value
                                            is FloatDetailLogValue -> value.value
                                            is IntDetailLogValue -> value.value
                                            is TextDetailLogValue -> value.value
                                            is TileRefDetailLogValue -> obj {
                                                "id" to value.value.id.value
                                                "q" to value.value.q
                                                "r" to value.value.r
                                            }
                                            is BuildingTypeDetailLogValue -> value.value.name
                                            is ResourcesDetailLogValue -> value.value.toStacks().map { stack ->
                                                obj {
                                                    "type" to stack.type.name
                                                    "amount" to stack.amount
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
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

    private fun countWorkTile(game: GameExtended, settlement: Settlement, building: BuildingType): Int? {
        return if (building.templateData.requiresTile()) {
            settlementUtilities.getPossibleWorkTiles(game, settlement, building).count()
        } else {
            null
        }
    }

}