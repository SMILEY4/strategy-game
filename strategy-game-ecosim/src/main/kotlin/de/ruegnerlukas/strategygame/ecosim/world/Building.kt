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

    val incomeWorkerFull: List<Pair<ResourceType, Int>>,
    val incomeWorker: List<Pair<ResourceType, Int>>,
    val incomeGentry: List<Pair<ResourceType, Int>>,
) {
    companion object {

        fun farm() = Building(
            type = BuildingType.FARM,
            reqWorkerAmount = 1,
            reqWorkerType = PopType.PEASANT,
            incomeWorkerFull = listOf(ResourceType.FOOD to 3),
            incomeWorker = listOf(ResourceType.FOOD to 2),
            incomeGentry = listOf(ResourceType.FOOD to 1),
        )

        fun ironMine() = Building(
            type = BuildingType.IRON_MINE,
            reqWorkerAmount = 1,
            reqWorkerType = PopType.PEASANT,
            incomeWorkerFull = listOf(ResourceType.METAL to 1),
            incomeWorker = listOf(ResourceType.MONEY to 1),
            incomeGentry = listOf(ResourceType.METAL to 1),
        )

    }
}