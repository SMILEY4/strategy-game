package io.github.smiley4.strategygame.engine.shared

sealed class PlayerCommand {
    class Increment : PlayerCommand()
    class Decrement : PlayerCommand()
}