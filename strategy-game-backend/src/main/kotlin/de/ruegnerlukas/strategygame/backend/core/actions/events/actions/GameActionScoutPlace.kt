package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandScoutPlace
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

class GameActionScoutPlace(
    private val gameConfig: GameConfig
) : GameAction<GameEventCommandScoutPlace>(GameEventCommandScoutPlace.TYPE) {

    override suspend fun perform(event: GameEventCommandScoutPlace): List<GameEvent> {
        val tile = getTile(event)
        addScout(tile, event.command.countryId, event.game.game.turn)
        discoverTiles(event.game, tile)
        return listOf()
    }

    private fun getTile(event: GameEventCommandScoutPlace): Tile {
        return event.game.tiles.find { it.position.q == event.command.data.q && it.position.r == event.command.data.r }!!
    }


    private fun addScout(tile: Tile, countryId: String, turn: Int) {
        tile.content.add(ScoutTileContent(countryId, turn))
    }

    private fun discoverTiles(game: GameExtended, scoutTile: Tile) {
        val scout = scoutTile.content.find { it is ScoutTileContent }.let { it as ScoutTileContent }
        positionsCircle(scoutTile.position, gameConfig.scoutVisibilityRange)
            .asSequence()
            .mapNotNull { pos -> game.tiles.find { it.position.q == pos.q && it.position.r == pos.r } }
            .filter { !hasDiscovered(scout.countryId, it) }
            .forEach { it.discoveredByCountries.add(scout.countryId) }
    }

    private fun hasDiscovered(countryId: String, tile: Tile) = tile.discoveredByCountries.contains(countryId)

}