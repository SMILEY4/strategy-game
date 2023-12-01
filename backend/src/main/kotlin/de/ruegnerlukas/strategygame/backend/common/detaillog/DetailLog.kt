package de.ruegnerlukas.strategygame.backend.common.detaillog

open class DetailLog<T : Enum<*>>(private val details: MutableList<DetailLogEntry<T>> = mutableListOf()) {

    fun getDetails(): List<DetailLogEntry<T>> = details

    fun addDetail(id: T, data: MutableMap<String, DetailLogValue>) {
        var merged = false
        for (detail in getDetails()) {
            if (detail.merge(id, data)) {
                merged = true
                break
            }
        }
        if (!merged) {
            details.add(DetailLogEntry(id, data))
        }
    }

}