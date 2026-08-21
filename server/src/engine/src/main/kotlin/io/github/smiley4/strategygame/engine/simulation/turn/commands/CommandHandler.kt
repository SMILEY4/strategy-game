package io.github.smiley4.strategygame.engine.simulation.turn.commands

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import kotlin.reflect.KClass

internal interface CommandHandler<T : PlayerCommand> {
    val commandType: KClass<T>
    fun handle(gameState: GameStateContext, command: T)
}