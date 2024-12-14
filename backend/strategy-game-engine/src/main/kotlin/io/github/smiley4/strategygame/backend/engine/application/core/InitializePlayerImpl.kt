package io.github.smiley4.strategygame.backend.engine.application.core

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.common.utils.getNeighbourPositions
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.COUNTRY_COLORS
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializePlayer


internal class InitializePlayerImpl : InitializePlayer {

    private val metricId = MetricId.action(InitializePlayer::class)

    override suspend fun perform(game: GameExtended, userId: User.Id) {
        return time(metricId) {
            val spawnLocation = findSpawnLocation(game)
            val countryId = initCountry(game, userId)
            initSettler(game, countryId, spawnLocation)
            initScout(game, countryId, spawnLocation)
        }
    }

    private fun findSpawnLocation(game: GameExtended): TileRef {

        for(i in 1..20) {
            val spawnTile = game.tiles.random()
            if(!isValidSpawnTile(spawnTile)) {
                continue
            }

            val validTileCount = getNeighbourPositions(spawnTile.position)
                .mapNotNull { (q, r) -> game.findTileOrNull(q, r) }
                .filter { isValidSpawnTile(it) }
                .size + 1

            if(validTileCount >= 5) {
                return spawnTile.ref()
            }
        }

        throw Exception("No valid spawn location found")
    }

    private fun initCountry(game: GameExtended, userId: User.Id): Country.Id {
        return Country(
            id = Country.Id.gen(),
            user = userId,
            color = COUNTRY_COLORS[game.countries.size % COUNTRY_COLORS.size],
        ).also { game.countries.add(it) }.id
    }

    private fun initSettler(game: GameExtended, countryId: Country.Id, spawnLocation: TileRef) {
        val settler = WorldObject.Settler(
            id = WorldObject.Id.gen(),
            tile = spawnLocation,
            country = countryId,
            maxMovement = 3,
            viewDistance = 1
        )
        game.worldObjects.add(settler)
        positionsCircle(settler.tile, settler.viewDistance).forEach { pos ->
            game.findTileOrNull(pos)?.dataPolitical?.discoveredByCountries?.add(countryId)
        }
    }

    private fun initScout(game: GameExtended, countryId: Country.Id, spawnLocation: TileRef) {
        val scoutLocation = getNeighbourPositions(spawnLocation)
            .mapNotNull { game.findTileOrNull(it.first, it.second) }
            .filter { isValidSpawnTile(it) }
            .random()
            .ref()
        val scout = WorldObject.Scout(
            id = WorldObject.Id.gen(),
            tile = scoutLocation,
            country = countryId,
            maxMovement = 5,
            viewDistance = 3
        )
        game.worldObjects.add(scout)
        positionsCircle(scout.tile, scout.viewDistance).forEach { pos ->
            game.findTileOrNull(pos)?.dataPolitical?.discoveredByCountries?.add(countryId)
        }
    }

    private fun isValidSpawnTile(tile: Tile): Boolean {
        return tile.dataWorld.terrainType == TerrainType.LAND
    }

}