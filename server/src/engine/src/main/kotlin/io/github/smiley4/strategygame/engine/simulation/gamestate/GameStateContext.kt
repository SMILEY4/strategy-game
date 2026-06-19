package io.github.smiley4.strategygame.engine.simulation.gamestate

import io.github.smiley4.strategygame.shared.values.GameId

class GameStateContext(
    val id: GameId,
    var turn: Int,
    val tiles: List<Tile>,
)