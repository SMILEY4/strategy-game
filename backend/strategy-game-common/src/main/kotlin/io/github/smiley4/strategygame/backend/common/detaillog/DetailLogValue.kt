package io.github.smiley4.strategygame.backend.common.detaillog

import io.github.smiley4.strategygame.backend.common.models.BuildingType
import io.github.smiley4.strategygame.backend.common.models.TileRef
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection


sealed interface DetailLogValue {
    fun merge(other: DetailLogValue)
}

class BooleanDetailLogValue(var value: Boolean) : DetailLogValue {
    override fun merge(other: DetailLogValue) = Unit
    override fun toString() = "BooleanDetailLogValue(value=$value)"
}

class FloatDetailLogValue(var value: Float) : DetailLogValue {
    override fun merge(other: DetailLogValue) {
        if (other is FloatDetailLogValue) {
            value += other.value
        }
    }
    override fun toString() = "FloatDetailLogValue(value=$value)"
}

class IntDetailLogValue(var value: Int) : DetailLogValue {
    override fun merge(other: DetailLogValue) {
        if (other is IntDetailLogValue) {
            value += other.value
        }
    }
    override fun toString() = "IntDetailLogValue(value=$value)"
}

class ResourcesDetailLogValue(var value: ResourceCollection) : DetailLogValue {
    override fun merge(other: DetailLogValue) {
        if (other is ResourcesDetailLogValue) {
            value.add(other.value)
        }
    }
    override fun toString() = "ResourcesDetailLogValue(value=$value)"
}

class BuildingTypeDetailLogValue(var value: BuildingType) : DetailLogValue {
    override fun merge(other: DetailLogValue) = Unit
    override fun toString() = "BuildingTypeDetailLogValue(value=$value)"
}

class TileRefDetailLogValue(var value: TileRef) : DetailLogValue {
    override fun merge(other: DetailLogValue) = Unit
    override fun toString() = "TileRefDetailLogValue(value=$value)"
}