package io.github.smiley4.strategygame.backend.commondata

enum class TileImprovementType(
    val requiredTerrain: Set<TerrainType>,
    val requiredNeighborTerrain: Set<TerrainType>
) {
    MINE(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet()
    ),

    QUARRY(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet()
    ),

    WOODWORKER_CAMP(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet()
    ),

    FARMSTEAD(
        requiredTerrain = setOf(TerrainType.LAND),
        requiredNeighborTerrain = emptySet()
    ),

    FISHING_CAMP(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = setOf(TerrainType.WATER)
    ),

    FORTIFICATION(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet()
    ),

    FRONTIER_SETTLEMENT_CAMP(
        requiredTerrain = setOf(TerrainType.LAND, TerrainType.MOUNTAIN),
        requiredNeighborTerrain = emptySet()
    ),

}