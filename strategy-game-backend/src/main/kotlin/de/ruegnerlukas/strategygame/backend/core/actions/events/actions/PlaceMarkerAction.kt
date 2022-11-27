package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.PlaceMarkerCommandEvent
import de.ruegnerlukas.strategygame.backend.ports.models.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

class PlaceMarkerAction : GameAction<PlaceMarkerCommandEvent>() {

    override suspend fun triggeredBy(): List<GameEventType> {
        return listOf(PlaceMarkerCommandEvent::class.simpleName!!)
    }

    override suspend fun perform(event: PlaceMarkerCommandEvent): List<GameEvent> {
        val tile = getTile(event)
        addMarker(tile, event.command.countryId)
        return listOf()
    }

    private fun getTile(event: PlaceMarkerCommandEvent): Tile {
        return event.game.tiles.find { it.position.q == event.command.data.q && it.position.r == event.command.data.r }!!
    }

    private fun addMarker(tile: Tile, countryId: String) {
        tile.content.add(MarkerTileContent(countryId))
    }

}