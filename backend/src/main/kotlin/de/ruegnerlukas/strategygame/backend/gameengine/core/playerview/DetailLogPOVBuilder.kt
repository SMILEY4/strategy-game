package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.detaillog.BooleanDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.BuildingTypeDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLog
import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogEntry
import de.ruegnerlukas.strategygame.backend.common.detaillog.FloatDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.IntDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.ResourcesDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.TileRefDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.common.jsondsl.obj

class DetailLogPOVBuilder {

    fun build(detailLog: DetailLog<*>): List<JsonType> {
        return detailLog.getDetails().map { detail -> build(detail) }
    }

    fun build(detail: DetailLogEntry<*>): JsonType {
        return obj {
            "id" to detail.id
            "data" to obj {
                detail.data.forEach { (key, value) ->
                    key to obj {
                        when (value) {
                            is BooleanDetailLogValue -> {
                                "type" to "boolean"
                                "value" to value.value
                            }
                            is FloatDetailLogValue -> {
                                "type" to "float"
                                "value" to value.value
                            }
                            is IntDetailLogValue -> {
                                "type" to "int"
                                "value" to value.value
                            }
                            is TileRefDetailLogValue -> {
                                "type" to "tile"
                                "value" to obj {
                                    "id" to value.value.tileId
                                    "q" to value.value.q
                                    "r" to value.value.r
                                }
                            }
                            is ResourcesDetailLogValue -> {
                                "type" to "resources"
                                "value" to value.value.toStacks().map { stack ->
                                    obj {
                                        "type" to stack.type.name
                                        "amount" to stack.amount
                                    }
                                }
                            }
                            is BuildingTypeDetailLogValue -> {
                                "type" to "building"
                                "value" to value.value.name
                            }
                        }
                    }
                }
            }
        }
    }
}