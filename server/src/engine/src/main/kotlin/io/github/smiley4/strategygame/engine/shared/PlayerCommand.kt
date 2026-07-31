package io.github.smiley4.strategygame.engine.shared

/**
 * A command issued by a player during their turn.
 */
sealed class PlayerCommand {
    class Increment : PlayerCommand()
    class Decrement : PlayerCommand()
}