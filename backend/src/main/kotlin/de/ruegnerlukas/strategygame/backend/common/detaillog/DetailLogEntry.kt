package de.ruegnerlukas.strategygame.backend.common.detaillog

data class DetailLogEntry<T: Enum<*>>(
    val id: T,
    val data: MutableMap<String, DetailLogValue>
) {

    fun merge(id: T, data: MutableMap<String, DetailLogValue>): Boolean {
        return if (this.id == id) {
            data.forEach { (key, value) ->
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

}