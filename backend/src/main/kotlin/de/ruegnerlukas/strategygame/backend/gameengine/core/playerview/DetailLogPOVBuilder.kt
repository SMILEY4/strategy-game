package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import com.lectra.koson.ArrayType
import com.lectra.koson.ObjectType
import com.lectra.koson.obj
import de.ruegnerlukas.strategygame.backend.common.detaillog.BooleanDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.BuildingTypeDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLog
import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogEntry
import de.ruegnerlukas.strategygame.backend.common.detaillog.FloatDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.IntDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.ResourcesDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.TileRefDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.utils.arrMap

class DetailLogPOVBuilder {

    fun build(detailLog: DetailLog<*>): ArrayType {
        return arrMap[detailLog.getDetails(), { detail -> build(detail) }]
    }

    fun build(detail: DetailLogEntry<*>): ObjectType {
        return obj {
            "id" to detail.id
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
                            "value" to arrMap[value.value.toStacks(), { stack ->
                                obj {
                                    "type" to stack.type.name
                                    "amount" to stack.amount
                                }
                            }]
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