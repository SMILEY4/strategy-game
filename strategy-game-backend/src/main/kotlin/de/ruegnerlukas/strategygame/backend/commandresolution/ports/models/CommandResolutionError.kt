package de.ruegnerlukas.strategygame.backend.commandresolution.ports.models

data class CommandResolutionError(
    val command: Command<*>,
    val errorMessage: String
)