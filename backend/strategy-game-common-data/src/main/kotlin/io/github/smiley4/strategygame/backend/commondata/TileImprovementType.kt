package io.github.smiley4.strategygame.backend.commondata

enum class TileImprovementType(
    val requiredTerrain: Set<TerrainType>,
    val requiredNeighborTerrain: Set<TerrainType>,
    val harvests: Map<ResourceType, Double>,
    val produces: Map<ResourceType, Double>,
) {
    MINE(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet(),
        harvests = mapOf(
            ResourceType.METAL to 3.0,
        ),
        produces = mapOf(
            ResourceType.METAL to 3.0,
        )
    ),

    QUARRY(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet(),
        harvests = mapOf(
            ResourceType.STONE to 3.0,
        ),
        produces = mapOf(
            ResourceType.STONE to 3.0,
        )
    ),

    WOODWORKER_CAMP(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet(),
        harvests = mapOf(
            ResourceType.WOOD to 3.0,
        ),
        produces = mapOf(
            ResourceType.WOOD to 3.0,
        )
    ),

    FARMSTEAD(
        requiredTerrain = setOf(TerrainType.LAND),
        requiredNeighborTerrain = emptySet(),
        harvests = mapOf(),
        produces = mapOf(
            ResourceType.FISH to 3.0,
        )
    ),

    FISHING_CAMP(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = setOf(TerrainType.WATER),
        harvests = mapOf(
            ResourceType.FISH to 3.0,
        ),
        produces = mapOf(
            ResourceType.FISH to 3.0,
        )
    ),

    FORTIFICATION(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet(),
        harvests = mapOf(),
        produces = mapOf()
    ),

    FRONTIER_SETTLEMENT_CAMP(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet(),
        harvests = mapOf(),
        produces = mapOf()
    ),

}