package io.github.smiley4.strategygame.backend.commondata

enum class SettlementTier(
    val level: Int,
    val buildingSlots: Int,
    val minRequiredSize: Int,
    val maxSize: Int
) {
    VILLAGE(
        level = 0,
        buildingSlots = 2,
        minRequiredSize = 0,
        maxSize = 2
    ),
    TOWN(
        level = 1,
        buildingSlots = 4,
        minRequiredSize = 2,
        maxSize = 8
    ),
    CITY(
        level = 2,
        buildingSlots = 6,
        minRequiredSize = 6,
        maxSize = 9999
    )
}

fun SettlementTier.previousTier(): SettlementTier? {
    return SettlementTier.values().findLast { it.level < this.level }
}

fun SettlementTier.nextTier(): SettlementTier? {
    return SettlementTier.values().firstOrNull { it.level > this.level }
}

