package de.ruegnerlukas.strategygame.ecosim.world


enum class BuildingType {
    FARM,
    IRON_MINE
}

data class Building(
    val type: BuildingType,
    val reqWorkerAmount: Int,
    val reqWorkerType: PopType,
    var isStaffed: Boolean = false,
    val production: List<Pair<ResourceType, Int>>,
) {
    companion object {

        fun farm() = Building(
            type = BuildingType.FARM,
            reqWorkerAmount = 1,
            reqWorkerType = PopType.PEASANT,
            production = listOf(ResourceType.FOOD to 2),
        )

        fun ironMine() = Building(
            type = BuildingType.IRON_MINE,
            reqWorkerAmount = 1,
            reqWorkerType = PopType.PEASANT,
            production = listOf(ResourceType.METAL to 1),
        )

    }
}