package io.github.smiley4.strategygame.engine.gameplay.data

sealed class PlayerCommand {
    class Increment : PlayerCommand()
    class Decrement : PlayerCommand()
}