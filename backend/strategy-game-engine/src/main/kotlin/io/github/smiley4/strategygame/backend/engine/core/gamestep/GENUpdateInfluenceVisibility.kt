package io.github.smiley4.strategygame.backend.engine.core.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.engine.ports.models.Country
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.common.models.Tile


/**
 * Uncovers/Discovers tiles after a change in influence
 */
class GENUpdateInfluenceVisibility(eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<InfluenceDirtyTilesData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENUpdateCityInfluence.Definition.after())
            action { data ->
                log().debug("Update visibility of ${data.tiles.size} tiles after changed influence")
                data.tiles.forEach { tile ->
                    updateTile(data.game, tile)
                }
                eventResultOk(Unit)
            }
        }
    }

    private fun updateTile(game: GameExtended, tile: Tile) {
        game.countries.forEach { country ->
            if (canDiscover(tile, country)) {
                discoverTile(tile, country)
            }
        }
    }

    private fun canDiscover(tile: Tile, country: Country): Boolean {
        return !hasDiscovered(country, tile) && (isOwner(country, tile) || hasInfluence(country.countryId, tile))
    }

    private fun hasDiscovered(country: Country, tile: Tile): Boolean {
        return tile.discoveredByCountries.contains(country.countryId)
    }

    private fun isOwner(country: Country, tile: Tile): Boolean {
        return tile.owner?.countryId == country.countryId
    }

    private fun hasInfluence(countryId: String, tile: Tile): Boolean {
        return tile.influences.any { it.countryId == countryId }
    }

    private fun discoverTile(tile: Tile, country: Country) {
        tile.discoveredByCountries.add(country.countryId)
    }

}