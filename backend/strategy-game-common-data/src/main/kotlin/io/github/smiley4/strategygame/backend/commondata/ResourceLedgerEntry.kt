package io.github.smiley4.strategygame.backend.commondata


class ResourceLedgerEntry(
    val resourceType: ResourceType,
    val consumed: Value,
    val produced: Value,
    val missing: Value

) {

    class Value(
        var amount: Float,
        val details: MutableMap<String, Float> = mutableMapOf(),
    ) {
        fun add(id: String, amount: Float) {
            this.amount += amount
            this.details[id] = (details[id] ?: 0f) + amount
        }
    }
}