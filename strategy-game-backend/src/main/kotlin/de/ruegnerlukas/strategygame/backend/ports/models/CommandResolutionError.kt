package de.ruegnerlukas.strategygame.backend.ports.models

data class CommandResolutionError(
    val command: Command<*>,
    val errorMessage: String
)