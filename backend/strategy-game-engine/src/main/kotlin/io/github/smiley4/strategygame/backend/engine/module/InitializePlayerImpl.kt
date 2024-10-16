package io.github.smiley4.strategygame.backend.engine.module

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.Id
import io.github.smiley4.strategygame.backend.common.utils.getNeighbourPositions
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.COUNTRY_COLORS
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ScoutWorldObject
import io.github.smiley4.strategygame.backend.commondata.SettlerWorldObject
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.edge.InitializePlayer


internal class InitializePlayerImpl : InitializePlayer {

    private val metricId = MetricId.action(InitializePlayer::class)

    override suspend fun perform(game: GameExtended, userId: String) {
        return time(metricId) {
            val spawnLocation = findSpawnLocation(game)
            val countryId = initCountry(game, userId)
            initScout(game, countryId, spawnLocation)
            initSettler(game, countryId, spawnLocation)
        }
    }

    private fun findSpawnLocation(game: GameExtended): TileRef {
        return game.tiles.random().ref()
    }

    private fun initCountry(game: GameExtended, userId: String): String {
        return Country(
            countryId = Id.gen(),
            userId = userId,
            color = COUNTRY_COLORS[game.countries.size % COUNTRY_COLORS.size]
        ).also { game.countries.add(it) }.countryId
    }

    private fun initScout(game: GameExtended, countryId: String, spawnLocation: TileRef) {
        val scoutLocation = getNeighbourPositions(spawnLocation)
            .mapNotNull { game.findTileOrNull(it.first, it.second) }
            .random()
            .ref()
        val scout = ScoutWorldObject(
            id = Id.gen(),
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

    private fun initSettler(game: GameExtended, countryId: String, spawnLocation: TileRef) {
        val settler = SettlerWorldObject(
            id = Id.gen(),
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

}