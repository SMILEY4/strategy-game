package de.ruegnerlukas.strategygame.ecosim.world

class Building(
    val type: BuildingType
)


enum class BuildingType(
    val input: Map<Resource, Int>,
    val output: Map<Resource, Int>
) {
    FARM(
        input = mapOf(),
        output = mapOf(
            Resource.FOOD to 1
        )
    ),
    WOODCUTTER(
        input = mapOf(),
        output = mapOf(
            Resource.WOOD to 1
        )
    ),
    MINE(
        input = mapOf(),
        output = mapOf(
            Resource.METAL to 1
        )
    ),
    QUARRY(
        input = mapOf(),
        output = mapOf(
            Resource.STONE to 1
        )
    ),
    ARMOR_SMITH(
        input = mapOf(
            Resource.METAL to 1
        ),
        output = mapOf(
            Resource.ARMOR to 1
        )
    ),
    WEAPON_SMITH(
        input = mapOf(
            Resource.METAL to 1
        ),
        output = mapOf(
            Resource.WEAPONS to 1
        )
    ),
    TOOLMAKER(
        input = mapOf(
            Resource.WOOD to 1,
            Resource.METAL to 1
        ),
        output = mapOf(
            Resource.TOOLS to 1
        )
    ),
    COOPER(
        input = mapOf(
            Resource.WOOD to 1
        ),
        output = mapOf(
            Resource.BARRELS to 1
        )
    ),
    JEWELLER(
        input = mapOf(
            Resource.METAL to 1
        ),
        output = mapOf(
            Resource.JEWELLERIES to 1
        )
    ),
    STABLES(
        input = mapOf(
            Resource.FOOD to 1
        ),
        output = mapOf(
            Resource.HORSE to 1
        )
    ),
    CATTLE_FARM(
        input = mapOf(
            Resource.FOOD to 1
        ),
        output = mapOf(
            Resource.FOOD to 1
        )
    ),
    WINERY(
        input = mapOf(
            Resource.BARRELS to 1
        ),
        output = mapOf(
            Resource.WINE to 1
        )
    ),
    SHEEP_FARM(
        input = mapOf(
            Resource.FOOD to 1
        ),
        output = mapOf(
            Resource.HIDE to 1
        )
    ),
    PARCHMENTERS_WORKSHOP(
        input = mapOf(
            Resource.HIDE to 1
        ),
        output = mapOf(
            Resource.PARCHMENT to 1
        )
    ),
    TAILOR(
        input = mapOf(
            Resource.HIDE to 1
        ),
        output = mapOf(
            Resource.CLOTH to 1
        )
    ),
    MARKET(
        input = mapOf(
            Resource.PARCHMENT to 1,
            Resource.BARRELS to 1
        ),
        output = mapOf()
    ),
}
