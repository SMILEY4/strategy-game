package io.github.smiley4.strategygame.backend.engine.module

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.Id
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.COUNTRY_COLORS
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ScoutWorldObject
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.edge.InitializePlayer


internal class InitializePlayerImpl : InitializePlayer {

    private val metricId = MetricId.action(InitializePlayer::class)

    override suspend fun perform(game: GameExtended, userId: String) {
        return time(metricId) {
            val countryId = initCountry(game, userId)
            initScout(game, countryId)
        }
    }

    private fun initCountry(game: GameExtended, userId: String): String {
        return Country(
            countryId = Id.gen(),
            userId = userId,
            color = COUNTRY_COLORS[game.countries.size % COUNTRY_COLORS.size]
        ).also { game.countries.add(it) }.countryId
    }

    private fun initScout(game: GameExtended, countryId: String) {
        val scout = ScoutWorldObject(
            id = Id.gen(),
            tile = game.tiles.random().ref(),
            country = countryId,
            maxMovement = 5,
            viewDistance = 3
        )
        game.worldObjects.add(scout)
        positionsCircle(scout.tile, scout.viewDistance).forEach { pos ->
            game.findTileOrNull(pos)?.discoveredByCountries?.add(countryId)
        }
    }

}