package io.github.smiley4.strategygame.backend.commondata

data class GameExtended(
    val meta: GameMeta,
    val tiles: TileContainer,
    val countries: TrackingList<Country>,
    val provinces: TrackingList<Province>,
    val settlements: TrackingList<Settlement>,
    val worldObjects: TrackingList<WorldObject>,
//    val routes: TrackingList<Route>,
) {

    fun findTile(q: Int, r: Int): Tile = tiles.get(q, r)
        ?: throw Exception("Could not find tile at $q,$r in game ${meta.id}")

    fun findTileOrNull(q: Int, r: Int): Tile? = tiles.get(q, r)

    fun findTile(tileId: Tile.Id): Tile = findTileOrNull(tileId)
        ?: throw Exception("Could not find tile $tileId in game ${meta.id}")

    fun findTileOrNull(tileId: Tile.Id): Tile? = tiles.get(tileId)

    fun findTile(pos: TilePosition): Tile = findTile(pos.q, pos.r)

    fun findTileOrNull(pos: TilePosition): Tile? = findTileOrNull(pos.q, pos.r)

    fun findTile(ref: TileRef): Tile = findTile(ref.id)


    fun findWorldObject(worldObjectId: WorldObject.Id): WorldObject = findWorldObjectOrNull(worldObjectId)
        ?: throw Exception("Could not find world-object $worldObjectId in game ${meta.id}")

    fun findWorldObjectOrNull(worldObjectId: WorldObject.Id): WorldObject? = worldObjects.find { it.id == worldObjectId }


    fun findCountry(countryId: Country.Id): Country = countries.firstOrNull { it.id == countryId }
        ?: throw Exception("Could not find country $countryId in game ${meta.id}")

    fun findCountryByUser(userId: User.Id): Country = countries.firstOrNull { it.user == userId }
        ?: throw Exception("Could not find country for user $userId in game ${meta.id}")



    fun findProvince(provinceId: Province.Id): Province = provinces.firstOrNull { it.id == provinceId }
        ?: throw Exception("Could not find province $provinceId in game ${meta.id}")


    fun findProvinceBySettlementOrNull(settlementId: Settlement.Id): Province? {
        return provinces.find { it.settlements.contains(settlementId) }
    }

    fun findProvinceBySettlement(settlementId: Settlement.Id) = findProvinceBySettlementOrNull(settlementId)
        ?: throw Exception("Could not find province for settlement $settlementId in game ${meta.id}")


    fun findSettlementOrNull(settlementId: Settlement.Id): Settlement? {
        return settlements.find { it.id == settlementId }
    }

    fun findSettlement(settlementId: Settlement.Id) = findSettlementOrNull(settlementId)
        ?: throw Exception("Could not find settlement with id $settlementId in game ${meta.id}")
}