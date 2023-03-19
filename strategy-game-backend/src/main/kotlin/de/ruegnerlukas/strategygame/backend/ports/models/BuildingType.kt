package de.ruegnerlukas.strategygame.backend.ports.models

enum class BuildingType(val order: Int, val templateData: BuildingTemplateData) {
    FARM(10, BuildingTemplateDataFarm()),
    FISHERS_HUT(10, BuildingTemplateDataFishersHut()),
    MINE(10, BuildingTemplateDataMine()),
    QUARRY(10, BuildingTemplateDataQuarry()),
    WOODCUTTER(10, BuildingTemplateDataWoodcutter()),

    CATTLE_FARM(15, BuildingTemplateDataCattleFarm()),

    ARMOR_SMITH(20, BuildingTemplateDataArmorSmith()),
    COOPER(20, BuildingTemplateDataCooper()),
    JEWELLER(20, BuildingTemplateDataJeweller()),
    SHEEP_FARM(20, BuildingTemplateDataSheepFarm()),
    STABLES(20, BuildingTemplateDataStables()),
    TOOLMAKER(20, BuildingTemplateDataToolMarker()),
    WEAPON_SMITH(20, BuildingTemplateDataWeaponSmith()),

    MARKET(30, BuildingTemplateDataMarket()),
    PARCHMENTERS_WORKSHOP(30, BuildingTemplateDataParchmentersWorkshop()),
    TAILORS_WORKSHOP(30, BuildingTemplateDataTailorsWorkshop()),
    WINERY(30, BuildingTemplateDataWinery()),
}


data class ResourceStack(
    val type: ResourceType,
    val amount: Float
)

fun ResourceType.amount(amount: Float) = ResourceStack(this, amount)


abstract class BuildingTemplateData(
    val requires: List<ResourceStack> = listOf(),
    val produces: List<ResourceStack> = listOf(),
    val requiredTileResource: TileResourceType? = null
)

class BuildingTemplateDataFarm : BuildingTemplateData(
    produces = listOf(ResourceType.FOOD.amount(1f)),
    requiredTileResource = TileResourceType.PLAINS,
)

class BuildingTemplateDataFishersHut : BuildingTemplateData(
    produces = listOf(ResourceType.FOOD.amount(1f)),
    requiredTileResource = TileResourceType.FISH,
)

class BuildingTemplateDataWoodcutter : BuildingTemplateData(
    produces = listOf(ResourceType.WOOD.amount(1f)),
    requiredTileResource = TileResourceType.FOREST,
)

class BuildingTemplateDataMine : BuildingTemplateData(
    produces = listOf(ResourceType.METAL.amount(1f)),
    requiredTileResource = TileResourceType.METAL,
)

class BuildingTemplateDataQuarry : BuildingTemplateData(
    produces = listOf(ResourceType.STONE.amount(1f)),
    requiredTileResource = TileResourceType.STONE,
)

class BuildingTemplateDataArmorSmith : BuildingTemplateData(
    requires = listOf(ResourceType.METAL.amount(1f)),
    produces = listOf(ResourceType.ARMOR.amount(1f))
)

class BuildingTemplateDataWeaponSmith : BuildingTemplateData(
    requires = listOf(ResourceType.METAL.amount(1f)),
    produces = listOf(ResourceType.WEAPONS.amount(1f))
)

class BuildingTemplateDataToolMarker : BuildingTemplateData(
    requires = listOf(ResourceType.WOOD.amount(1f)),
    produces = listOf(ResourceType.TOOLS.amount(1f))
)

class BuildingTemplateDataJeweller : BuildingTemplateData(
    requires = listOf(ResourceType.METAL.amount(1f)),
    produces = listOf(ResourceType.JEWELLERIES.amount(1f))
)

class BuildingTemplateDataCooper : BuildingTemplateData(
    requires = listOf(ResourceType.WOOD.amount(1f)),
    produces = listOf(ResourceType.BARRELS.amount(1f))
)

class BuildingTemplateDataCattleFarm : BuildingTemplateData(
    requires = listOf(ResourceType.FOOD.amount(1f)),
    produces = listOf(ResourceType.FOOD.amount(2f))
)

class BuildingTemplateDataWinery : BuildingTemplateData(
    requires = listOf(ResourceType.BARRELS.amount(1f)),
    produces = listOf(ResourceType.WINE.amount(1f))
)

class BuildingTemplateDataMarket : BuildingTemplateData(
    requires = listOf(ResourceType.BARRELS.amount(1f)),
)

class BuildingTemplateDataStables : BuildingTemplateData(
    requires = listOf(ResourceType.FOOD.amount(1f)),
    produces = listOf(ResourceType.HORSE.amount(1f))
)

class BuildingTemplateDataSheepFarm : BuildingTemplateData(
    requires = listOf(ResourceType.FOOD.amount(1f)),
    produces = listOf(ResourceType.HIDE.amount(1f))
)

class BuildingTemplateDataTailorsWorkshop : BuildingTemplateData(
    requires = listOf(ResourceType.HIDE.amount(1f)),
    produces = listOf(ResourceType.CLOTHES.amount(1f))
)

class BuildingTemplateDataParchmentersWorkshop : BuildingTemplateData(
    requires = listOf(ResourceType.HIDE.amount(1f)),
    produces = listOf(ResourceType.PARCHMENT.amount(1f))
)
