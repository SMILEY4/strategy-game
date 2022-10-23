package de.ruegnerlukas.strategygame.backend.ports.provided.commands

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError

interface ResolveCreateCityCommand {

	suspend fun perform(
        command: Command<CreateCityCommandData>,
        game: GameExtended
	): Either<ResolveCommandsActionError, List<CommandResolutionError>>

}