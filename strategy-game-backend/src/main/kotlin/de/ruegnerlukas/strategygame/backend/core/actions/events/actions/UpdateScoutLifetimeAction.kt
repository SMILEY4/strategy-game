package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventType
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.WorldUpdateEvent
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.ScoutTileContent

class UpdateScoutLifetimeAction(private val gameConfig: GameConfig) : GameAction<WorldUpdateEvent>() {

    override suspend fun triggeredBy(): List<GameEventType> {
        return listOf(WorldUpdateEvent::class.java.simpleName)
    }

    override suspend fun perform(event: WorldUpdateEvent): List<GameEvent> {
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