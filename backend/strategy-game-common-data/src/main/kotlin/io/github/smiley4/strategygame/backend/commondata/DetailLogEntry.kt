package io.github.smiley4.strategygame.backend.commondata

data class DetailLogEntry<T: Enum<*>>(
    val id: T,
    val data: MutableMap<String, DetailLogValue>
) {

    fun merge(id: T, otherData: Map<String, DetailLogValue>): Boolean {
        return if (this.id == id && canMergeProperties(otherData)) {
            otherData.forEach { (key, value) ->
                if (data.containsKey(key)) {
                    data[key]?.merge(value)
                } else {
                    data[key] = value
                }
            }
            true
        } else {
            false
        }
    }

    private fun canMergeProperties(otherData: Map<String, DetailLogValue>): Boolean {
        return otherData.filter { this.data.containsKey(it.key) }.all { (key, value) ->
            val baseValue = this.data[key]
            when(value) {
                is TextDetailLogValue -> (baseValue as TextDetailLogValue).value == value.value
                is BooleanDetailLogValue -> (baseValue as BooleanDetailLogValue).value == value.value
                is BuildingTypeDetailLogValue -> (baseValue as BuildingTypeDetailLogValue).value == value.value
                is FloatDetailLogValue -> true
                is IntDetailLogValue -> true
                is ResourcesDetailLogValue -> true
                is TileRefDetailLogValue -> (baseValue as TileRefDetailLogValue).value.id == value.value.id
            }
        }
    }

}