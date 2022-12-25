package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandMarkerPlace
import de.ruegnerlukas.strategygame.backend.ports.models.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

/**
 * Adds the marker at the given location
 * - triggered by [GameEventCommandMarkerPlace]
 * - triggers nothing
 */
class GameActionMarkerPlace : GameAction<GameEventCommandMarkerPlace>(GameEventCommandMarkerPlace.TYPE) {

    override suspend fun perform(event: GameEventCommandMarkerPlace): List<GameEvent> {
        val tile = getTile(event)
        addMarker(tile, event.command.countryId)
        return listOf()
    }


    private fun getTile(event: GameEventCommandMarkerPlace): Tile {
        return event.game.tiles.get(event.command.data.q, event.command.data.r)!!
    }


    private fun addMarker(tile: Tile, countryId: String) {
        tile.content.add(MarkerTileContent(countryId))
    }

}