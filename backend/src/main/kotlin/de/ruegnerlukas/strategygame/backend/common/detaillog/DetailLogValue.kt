package de.ruegnerlukas.strategygame.backend.common.detaillog

import de.ruegnerlukas.strategygame.backend.common.models.BuildingType

sealed interface DetailLogValue {
    fun merge(other: DetailLogValue)
}


class FloatDetailLogValue(var value: Float) : DetailLogValue {
    override fun merge(other: DetailLogValue) {
        if (other is FloatDetailLogValue) {
            value += other.value
        }
    }
}

class IntDetailLogValue(var value: Int) : DetailLogValue {
    override fun merge(other: DetailLogValue) {
        if (other is IntDetailLogValue) {
            value += other.value
        }
    }
}

class BuildingTypeDetailLogValue(var value: BuildingType) : DetailLogValue {
    override fun merge(other: DetailLogValue) = Unit
}