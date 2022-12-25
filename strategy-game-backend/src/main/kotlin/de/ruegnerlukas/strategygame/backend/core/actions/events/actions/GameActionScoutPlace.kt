package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandScoutPlace
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

/**
 * Adds the scout at the given location and discovers the surrounding tiles
 * - triggered by [GameEventCommandScoutPlace]
 * - triggers nothing
 */
class GameActionScoutPlace(
    private val gameConfig: GameConfig
) : GameAction<GameEventCommandScoutPlace>(GameEventCommandScoutPlace.TYPE) {

    override suspend fun perform(event: GameEventCommandScoutPlace): List<GameEvent> {
        val tile = getTile(event)
        addScout(tile, event.command.countryId, event.game.game.turn)
        discoverTiles(event.game, tile, event.command.countryId)
        return listOf()
    }


    private fun getTile(event: GameEventCommandScoutPlace): Tile {
        return event.game.tiles.find { it.position.q == event.command.data.q && it.position.r == event.command.data.r }!!
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