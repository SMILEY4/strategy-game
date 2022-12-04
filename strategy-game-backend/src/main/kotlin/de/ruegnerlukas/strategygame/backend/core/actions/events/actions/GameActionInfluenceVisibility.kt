package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventTileInfluenceUpdate
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

/**
 * Uncovers/Discovers tiles after a change in influence
 * - triggered by [GameEventTileInfluenceUpdate]
 * - triggers nothing
 */
class GameActionInfluenceVisibility : GameAction<GameEventTileInfluenceUpdate>(GameEventTileInfluenceUpdate.TYPE) {

    override suspend fun perform(event: GameEventTileInfluenceUpdate): List<GameEvent> {
        event.tiles.forEach { tile ->
            updateTile(event.game, tile)
        }
        return listOf()
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