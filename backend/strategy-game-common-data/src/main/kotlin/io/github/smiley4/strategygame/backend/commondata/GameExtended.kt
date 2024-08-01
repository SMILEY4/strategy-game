package io.github.smiley4.strategygame.backend.commondata

data class GameExtended(
    val meta: GameMeta,
    val tiles: TileContainer,
    val worldObjects: TrackingList<WorldObject>,
    val countries: TrackingList<Country>,

    val cities: TrackingList<City>,
    val provinces: TrackingList<Province>,
    val routes: TrackingList<Route>,
) {

    fun findTile(q: Int, r: Int): Tile = tiles.get(q, r)
        ?: throw Exception("Could not find tile at $q,$r in game ${meta.gameId}")

    fun findTileOrNull(q: Int, r: Int): Tile? = tiles.get(q, r)

    fun findTile(tileId: String): Tile = findTileOrNull(tileId)
        ?: throw Exception("Could not find tile $tileId in game ${meta.gameId}")

    fun findTileOrNull(tileId: String): Tile? = tiles.get(tileId)

    fun findTile(pos: TilePosition): Tile = findTile(pos.q, pos.r)

    fun findTileOrNull(pos: TilePosition): Tile? = findTileOrNull(pos.q, pos.r)

    fun findTile(ref: TileRef): Tile = findTile(ref.id)

    fun findWorldObject(worldObjectId: String): WorldObject? = worldObjects.find { it.id == worldObjectId }

    fun findCountry(countryId: String): Country = countries.firstOrNull { it.countryId == countryId }
        ?: throw Exception("Could not find country $countryId in game ${meta.gameId}")

    fun findCountryByUser(userId: String): Country = countries.firstOrNull { it.userId == userId }
        ?: throw Exception("Could not find country for user $userId in game ${meta.gameId}")

    fun findCity(cityId: String): City = cities.firstOrNull { it.cityId == cityId }
        ?: throw Exception("Could not find city $cityId in game ${meta.gameId}")

    fun findProvince(provinceId: String): Province = provinces.firstOrNull { it.provinceId == provinceId }
        ?: throw Exception("Could not find province $provinceId in game ${meta.gameId}")

    fun findProvinceByCity(cityId: String): Province = provinces.firstOrNull { it.cityIds.contains(cityId) }
        ?: throw Exception("Could not find province with city $cityId in game ${meta.gameId}")

}