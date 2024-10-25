package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.engine.module.GameConfig
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.events.UpdateWorldEvent
import io.github.smiley4.strategygame.backend.engine.module.tools.InfluenceCalculator

internal class UpdateInfluenceStep(private val influenceCalculator: InfluenceCalculator) : GameEventNode<UpdateWorldEvent>, Logging {

    override fun handle(event: UpdateWorldEvent, publisher: GameEventPublisher) {
        log().info("Updating all tile influences")
        event.game.tiles.forEach { tile ->
            setInfluences(tile, event.game)
            setControlledBy(tile)
            updateDiscoveredBy(tile)
        }
    }

    private fun setInfluences(tile: Tile, game: GameExtended) {
        tile.dataPolitical.influences.clear()
        tile.dataPolitical.influences.addAll(influenceCalculator.calculate(game, tile))
    }

    private fun setControlledBy(tile: Tile) {

        // find country with most total influence and total  influence above threshold
        val controllingCountry: Country.Id? = tile.dataPolitical.influences
            .groupBy { it.country }
            .filter { (_, totalInfluence) -> totalInfluence >= GameConfig.influenceThresholdTileControl }
            .maxByOrNull { (_, totalInfluence) -> totalInfluence }
            ?.first

        if (controllingCountry == null) {
            tile.dataPolitical.controlledBy = null
            return
        }

        // determine controlling province
        val controllerProvince = tile.dataPolitical.influences
            .filter { it.country == controllingCountry }
            .groupBy { it.province }
            .maxBy { (_, totalInfluence) -> totalInfluence }
            .first

        // determine controlling settlement
        val controllerSettlement = tile.dataPolitical.influences
            .filter { it.country == controllingCountry && it.province == controllerProvince }
            .groupBy { it.settlement }
            .maxBy { (_, totalInfluence) -> totalInfluence }
            .first

        tile.dataPolitical.controlledBy = Tile.Owner(
            country = controllingCountry,
            province = controllerProvince,
            settlement = controllerSettlement
        )
    }

    private fun updateDiscoveredBy(tile: Tile) {
        tile.dataPolitical.influences.forEach { influence ->
            tile.dataPolitical.discoveredByCountries.add(influence.country)
        }
    }

    private fun <K> Collection<Tile.Influence>.groupBy(keyProvider: (influence: Tile.Influence) -> K): List<Pair<K, Double>> {
        val sums = mutableMapOf<K, Double>()
        this.forEach { influence ->
            sums[keyProvider(influence)] = (sums[keyProvider(influence)] ?: 0.0) + influence.amount
        }
        return sums.toList()
    }

}
