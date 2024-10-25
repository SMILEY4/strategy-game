package io.github.smiley4.strategygame.backend.commondata

data class Tile(
    val id: Id,
    val position: TilePosition,
    val dataWorld: WorldData,
    val dataPolitical: PoliticalData,
) {

    @JvmInline
    value class Id(val value: String)

    data class WorldData(
        var terrainType: TerrainType,
        var resourceType: TileResourceType,
        var height: Float,
    )

    data class PoliticalData(
        val influences: MutableList<Influence>,
        val discoveredByCountries: MutableSet<Country.Id>,
        var controlledBy: Owner?
    )

    data class Owner(
        val country: Country.Id,
        val province: Province.Id,
        val settlement: Settlement.Id
    )

    data class Influence(
        val country: Country.Id,
        val province: Province.Id,
        val settlement: Settlement.Id,
        val amount: Double
    )

}
