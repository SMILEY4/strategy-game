package io.github.smiley4.strategygame.engine.simulation.gamestate

import io.github.smiley4.strategygame.shared.values.GameId

/**
 * Mutable container for the full simulation state of a game at a given turn.
 */
class GameStateContext(
    val id: GameId,
    var turn: Int,
    val tiles: List<Tile>,
)