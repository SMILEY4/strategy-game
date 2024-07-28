package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.BooleanDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.BuildingTypeDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.DetailLog
import io.github.smiley4.strategygame.backend.commondata.DetailLogEntry
import io.github.smiley4.strategygame.backend.commondata.FloatDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.IntDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.ResourcesDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.TileRefDetailLogValue


internal class  DetailLogPOVBuilder {

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
                                    "id" to value.value.id
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