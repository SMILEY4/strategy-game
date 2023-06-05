package de.ruegnerlukas.strategygame.backend.common.models

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

abstract class BuildingTemplateData(
    val constructionCost: ResourceCollection = ResourceCollection.empty(),
    val requires: ResourceCollection = ResourceCollection.empty(),
    val produces: ResourceCollection = ResourceCollection.empty(),
    val requiredTileResource: TileResourceType? = null
)

class BuildingTemplateDataFarm : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.FOOD.amount(1f)
    ),
    requiredTileResource = TileResourceType.PLAINS,
)

class BuildingTemplateDataFishersHut : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.FOOD.amount(1f)
    ),
    requiredTileResource = TileResourceType.FISH,
)

class BuildingTemplateDataWoodcutter : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.WOOD.amount(1f)
    ),
    requiredTileResource = TileResourceType.FOREST,
)

class BuildingTemplateDataQuarry : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.STONE.amount(1f)
    ),
    requiredTileResource = TileResourceType.STONE,
)

class BuildingTemplateDataMine : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.METAL.amount(1f)
    ),
    requiredTileResource = TileResourceType.METAL,
)

class BuildingTemplateDataArmorSmith : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.METAL.amount(1f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.ARMOR.amount(1f)
    ),
)

class BuildingTemplateDataWeaponSmith : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.METAL.amount(1f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.WEAPONS.amount(1f)
    ),
)

class BuildingTemplateDataToolMarker : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.WOOD.amount(1f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.TOOLS.amount(1f)
    ),
)

class BuildingTemplateDataJeweller : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.METAL.amount(1f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.JEWELLERIES.amount(1f)
    ),
)

class BuildingTemplateDataCooper : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.WOOD.amount(1f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.BARRELS.amount(1f)
    ),
)

class BuildingTemplateDataCattleFarm : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.FOOD.amount(1f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.FOOD.amount(2f)
    ),
)

class BuildingTemplateDataWinery : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.BARRELS.amount(1f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.WINE.amount(1f)
    ),
)

class BuildingTemplateDataMarket : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.BARRELS.amount(1f)
    ),
)

class BuildingTemplateDataStables : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.FOOD.amount(1f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.HORSE.amount(1f)
    ),
)

class BuildingTemplateDataSheepFarm : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.FOOD.amount(1f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.HIDE.amount(1f)
    ),
)

class BuildingTemplateDataTailorsWorkshop : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.HIDE.amount(1f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.CLOTHES.amount(1f)
    ),
)

class BuildingTemplateDataParchmentersWorkshop : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    requires = ResourceCollection.basic(
        ResourceType.HIDE.amount(1f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.PARCHMENT.amount(1f)
    ),
)
