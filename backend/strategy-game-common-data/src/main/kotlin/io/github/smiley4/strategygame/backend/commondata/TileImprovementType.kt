package io.github.smiley4.strategygame.backend.commondata

enum class TileImprovementType(
    val allowedTerrain: Set<TerrainType>,
    val requiredNeighborTerrain: Set<TerrainType>,
    val harvests: Map<ResourceType, Double>,
    val consumes: Map<ResourceType, Double>,
    val produces: Map<ResourceType, Double>,
) {
    MINE(
        allowedTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet(),
        harvests = mapOf(
            ResourceType.RAW_METAL to 1.0,
        ),
        consumes = mapOf(
            ResourceType.FOOD to 1.0,
        ),
        produces = mapOf(
            ResourceType.METAL to 1.0,
        )
    ),

    QUARRY(
        allowedTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet(),
        harvests = mapOf(
            ResourceType.RAW_STONE to 1.0,
        ),
        consumes = mapOf(
            ResourceType.FOOD to 1.0,
        ),
        produces = mapOf(
            ResourceType.STONE to 1.0,
        )
    ),

    WOODWORKER_CAMP(
        allowedTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet(),
        harvests = mapOf(
            ResourceType.RAW_WOOD to 1.0,
        ),
        consumes = mapOf(
            ResourceType.FOOD to 1.0,
        ),
        produces = mapOf(
            ResourceType.TIMBER to 1.0,
        )
    ),

    FARMSTEAD(
        allowedTerrain = setOf(TerrainType.LAND),
        requiredNeighborTerrain = emptySet(),
        harvests = mapOf(),
        consumes = mapOf(),
        produces = mapOf(
            ResourceType.FOOD to 3.0,
        )
    ),

    FISHING_CAMP(
        allowedTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = setOf(TerrainType.WATER),
        harvests = mapOf(
            ResourceType.RAW_FISH to 1.0,
        ),
        consumes = mapOf(),
        produces = mapOf(
            ResourceType.FOOD to 4.0,
        )
    ),

}