package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

data class CommandResolutionError(
    val command: Command<*>,
    val errorMessage: String
)