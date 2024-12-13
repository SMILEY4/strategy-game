package io.github.smiley4.strategygame.backend.commondata

enum class BuildingType(val templateData: BuildingTemplateData) {
    DEV_FACTORY(BuildingTemplateDataDevFactory()),
    FARM(BuildingTemplateDataFarm()),
    FISHERS_HUT(BuildingTemplateDataFishersHut()),
    MINE(BuildingTemplateDataMine()),
    QUARRY(BuildingTemplateDataQuarry()),
    WOODCUTTER(BuildingTemplateDataWoodcutter()),
    CATTLE_FARM(BuildingTemplateDataCattleFarm()),
    ARMOR_SMITH(BuildingTemplateDataArmorSmith()),
    COOPER(BuildingTemplateDataCooper()),
    JEWELLER(BuildingTemplateDataJeweller()),
    SHEEP_FARM(BuildingTemplateDataSheepFarm()),
    STABLES(BuildingTemplateDataStables()),
    TOOLMAKER(BuildingTemplateDataToolMarker()),
    WEAPON_SMITH(BuildingTemplateDataWeaponSmith()),
    MARKET(BuildingTemplateDataMarket()),
    PARCHMENTERS_WORKSHOP(BuildingTemplateDataParchmentersWorkshop()),
    TAILORS_WORKSHOP(BuildingTemplateDataTailorsWorkshop()),
    WINERY(BuildingTemplateDataWinery()),
}

abstract class BuildingTemplateData(
    val constructionCost: ResourceCollection = ResourceCollection.empty(),
    val requires: ResourceCollection = ResourceCollection.empty(),
    val produces: ResourceCollection = ResourceCollection.empty(),
    val requiredTileTerrain: TerrainType? = null,
    val requiredTileResource: TileResourceType? = null,
)

class BuildingTemplateDataDevFactory : BuildingTemplateData(
    constructionCost = ResourceCollection.empty(),
    produces = ResourceCollection.basic(
        ResourceType.FOOD.amount(1f),
        ResourceType.WOOD.amount(1f),
        ResourceType.STONE.amount(1f),
        ResourceType.METAL.amount(1f)
    ),
)

class BuildingTemplateDataFarm : BuildingTemplateData(
    constructionCost = ResourceCollection.basic(
        ResourceType.WOOD.amount(10f),
        ResourceType.STONE.amount(5f)
    ),
    produces = ResourceCollection.basic(
        ResourceType.FOOD.amount(1f)
    ),
    requiredTileTerrain = TerrainType.LAND,
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
    requiredTileResource = TileResourceType.WOOD,
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
    requiredTileTerrain = TerrainType.LAND
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
    requiredTileTerrain = TerrainType.LAND
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
    requiredTileTerrain = TerrainType.LAND
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


fun BuildingTemplateData.requiresTile(): Boolean {
    return this.requiredTileTerrain != null || this.requiredTileResource != null
}


fun BuildingTemplateData.checkTile(tile: Tile): Boolean {
    if (this.requiredTileTerrain != null && this.requiredTileTerrain != tile.dataWorld.terrainType) {
        return false
    }
    if (this.requiredTileResource != null && this.requiredTileResource != tile.dataWorld.resourceType) {
        return false
    }
    return true
}