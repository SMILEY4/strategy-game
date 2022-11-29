package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventTileInfluenceUpdate
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

/**
 * handles the changed visibility after updating the influence of some tiles
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
            if (!hasDiscovered(country, tile)) {
                if (isOwner(country, tile) || hasInfluence(country.countryId, tile)) {
                    tile.discoveredByCountries.add(country.countryId)
                }
            }
        }
    }


    private fun hasDiscovered(country: Country, tile: Tile) = tile.discoveredByCountries.contains(country.countryId)

    private fun hasInfluence(countryId: String, tile: Tile) = tile.influences.any { it.countryId == countryId }

    private fun isOwner(country: Country, tile: Tile) = tile.owner?.countryId == country.countryId

}