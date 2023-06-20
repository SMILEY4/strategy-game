package de.ruegnerlukas.strategygame.backend.gamesession.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CommandResolutionError


data class CommandResolutionErrorDTO(
    val errorMessage: String
) {
    constructor(error: CommandResolutionError) : this(error.errorMessage)
}