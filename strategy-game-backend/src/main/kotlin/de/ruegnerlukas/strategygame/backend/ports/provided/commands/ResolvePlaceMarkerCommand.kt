package de.ruegnerlukas.strategygame.backend.ports.provided.commands

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.GameState
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError

interface ResolvePlaceMarkerCommand {

	suspend fun perform(command: CommandEntity, state: GameState): Either<ResolveCommandsActionError, List<CommandResolutionError>>

}