package de.ruegnerlukas.strategygame.backend.common.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError

data class CommandResolutionErrorDTO(
    val errorMessage: String
) {
    constructor(error: CommandResolutionError) : this(error.errorMessage)
}