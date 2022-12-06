package de.ruegnerlukas.strategygame.backend.ports.models

enum class BuildingType(val templateData: BuildingTemplateData) {
    ARMOR_SMITH(BuildingTemplateDataArmorSmith()),
    CATTLE_FARM(BuildingTemplateDataCattleFarm()),
    COOPER(BuildingTemplateDataCooper()),
    FARM(BuildingTemplateDataFarm()),
    FISHERS_HUT(BuildingTemplateDataFishersHut()),
    JEWELLER(BuildingTemplateDataJeweller()),
    MARKET(BuildingTemplateDataMarket()),
    MINE(BuildingTemplateDataMine()),
    PARCHMENTERS_WORKSHOP(BuildingTemplateDataParchmentersWorkshop()),
    QUARRY(BuildingTemplateDataQuarry()),
    SHEEP_FARM(BuildingTemplateDataSheepFarm()),
    STABLES(BuildingTemplateDataStables()),
    TAILORS_WORKSHOP(BuildingTemplateDataTailorsWorkshop()),
    TOOLMAKER(BuildingTemplateDataToolMarker()),
    WEAPON_SMITH(BuildingTemplateDataWeaponSmith()),
    WINERY(BuildingTemplateDataWinery()),
    WOODCUTTER(BuildingTemplateDataWoodcutter()),
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
