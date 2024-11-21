package io.github.smiley4.strategygame.backend.playerpov.application

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ProductionIds
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.requiresTile
import io.github.smiley4.strategygame.backend.engine.ports.provided.SettlementUtilities


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
                        "workTile" to obj {
                            "requiredTerrain" to it.type.templateData.requiredTileTerrain
                            "requiredResource" to it.type.templateData.requiredTileResource
                            "tile" to it.workedTile?.let { workedTile ->
                                obj {
                                    "id" to workedTile.id.value
                                    "q" to workedTile.q
                                    "r" to workedTile.r
                                }
                            }
                        }
                        "validity" to obj {
                            "workTile" to it.validity.workTile
                            "inputResources" to it.validity.inputResources
                        }
                        "activity" to obj {
                            "consumed" to it.activity.consumed.toStacks(false).map {
                                obj {
                                    "type" to it.type
                                    "amount" to it.amount
                                }
                            }
                            "produced" to it.activity.produced.toStacks(false).map {
                                obj {
                                    "type" to it.type
                                    "amount" to it.amount
                                }
                            }
                            "missing" to it.activity.missing.toStacks(false).map {
                                obj {
                                    "type" to it.type
                                    "amount" to it.amount
                                }
                            }
                        }
                    }
                }
            }
            "resources" to objHidden(povCache.povCountryId == settlement.country) {
                settlement.resourceLedger.getEntries().map { entry ->
                    obj {
                        "type" to entry.resourceType
                        "amount" to entry.produced.amount - entry.consumed.amount
                        "produced" to obj {
                            "amount" to entry.produced.amount
                            "details" to entry.produced.details.map {
                                obj {
                                    "key" to it.key
                                    "amount" to it.value
                                }
                            }
                        }
                        "consumed" to obj {
                            "amount" to entry.consumed.amount
                            "details" to entry.consumed.details.map {
                                obj {
                                    "key" to it.key
                                    "amount" to it.value
                                }
                            }
                        }
                        "missing" to obj {
                            "amount" to entry.missing.amount
                            "details" to entry.missing.details.map {
                                obj {
                                    "key" to it.key
                                    "amount" to it.value
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