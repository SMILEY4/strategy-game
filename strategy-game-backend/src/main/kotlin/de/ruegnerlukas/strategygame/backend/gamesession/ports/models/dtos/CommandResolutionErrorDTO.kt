package de.ruegnerlukas.strategygame.backend.gamesession.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CommandResolutionError


data class CommandResolutionErrorDTO(
    val errorMessage: String
) {
    constructor(error: CommandResolutionError) : this(error.errorMessage)
}