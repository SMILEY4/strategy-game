package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.ScoutTileContent

class GameActionScoutLifetime(
    private val gameConfig: GameConfig
) : GameAction<GameEventWorldUpdate>(GameEventWorldUpdate.TYPE) {

    override suspend fun perform(event: GameEventWorldUpdate): List<GameEvent> {
        event.game.tiles
            .asSequence()
            .map { tile -> tile to tile.content.find { it is ScoutTileContent } }
            .filter { it.second != null }
            .map { it.first to it.second as ScoutTileContent }
            .forEach { (tile, scout) ->
                val lifetime = event.game.game.turn - scout.turn
                if (lifetime > gameConfig.scoutLifetime) {
                    tile.content.remove(scout)
                }
            }
        return listOf()
    }
}