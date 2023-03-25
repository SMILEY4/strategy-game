package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

/**
 * Adds the scout at the given location and discovers the surrounding tiles
 */
class ScoutPlaceAction(private val gameConfig: GameConfig): Logging {

    fun perform(game: GameExtended, command: Command<PlaceScoutCommandData>) {
        val tile = getTile(game, command)
        log().debug("Place scout at ${tile.position} for country ${command.countryId}")
        addScout(tile, command.countryId, game.game.turn)
        discoverTiles(game, tile, command.countryId)
    }

    private fun getTile(game: GameExtended, command: Command<PlaceScoutCommandData>): Tile {
        return game.tiles.find { it.position.q == command.data.q && it.position.r == command.data.r }!!
    }

    private fun addScout(tile: Tile, countryId: String, turn: Int) {
        tile.content.add(ScoutTileContent(countryId, turn))
    }

    private fun discoverTiles(game: GameExtended, scoutTile: Tile, countryId: String) {
        positionsCircle(scoutTile.position, gameConfig.scoutVisibilityRange)
            .asSequence()
            .mapNotNull { findTile(game, it) }
            .filter { !hasDiscovered(countryId, it) }
            .forEach { it.discoveredByCountries.add(countryId) }
    }

    private fun findTile(game: GameExtended, pos: TilePosition): Tile? {
        return game.tiles.get(pos)
    }

    private fun hasDiscovered(countryId: String, tile: Tile): Boolean {
        return tile.discoveredByCountries.contains(countryId)
    }

}