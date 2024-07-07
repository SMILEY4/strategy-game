package io.github.smiley4.strategygame.backend.commondata

open class DetailLog<T : Enum<*>>(private val details: MutableList<DetailLogEntry<T>> = mutableListOf()) {

    fun getDetails(): List<DetailLogEntry<T>> = details

    fun mergeDetail(id: T, data: MutableMap<String, DetailLogValue>) {
        var merged = false
        for (detail in getDetails()) {
            if (detail.merge(id, data)) {
                merged = true
                break
            }
        }
        if (!merged) {
            addDetail(id, data)
        }
    }

    fun replaceDetail(id: T, data: MutableMap<String, DetailLogValue>) {
        clear(id)
        addDetail(id, data)
    }

    fun addDetail(id: T, data: MutableMap<String, DetailLogValue>) {
        details.add(DetailLogEntry(id, data))
    }

    fun clear(ids: Set<T>): Unit = this.details.removeIf { ids.contains(it.id) }.let { }

    fun clear(id: T): Unit = this.details.removeIf { id == it.id }.let { }

    fun clear(): Unit = this.details.clear()

}