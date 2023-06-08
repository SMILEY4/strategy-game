package de.ruegnerlukas.strategygame.backend.gameengine.core

/**
 * Adds the marker at the given location
 */
class MarkerPlaceAction: Logging {

    fun perform(game: GameExtended, command: Command<PlaceMarkerCommandData>) {
        val tile = getTile(game, command)
        log().debug("Place marker at ${tile.position} of country ${command.countryId}")
        addMarker(tile, command.countryId)
    }

    private fun getTile(game: GameExtended, command: Command<PlaceMarkerCommandData>): Tile {
        return game.tiles.get(command.data.q, command.data.r)!!
    }

    private fun addMarker(tile: Tile, countryId: String) {
        tile.content.add(MarkerTileContent(countryId))
    }

}