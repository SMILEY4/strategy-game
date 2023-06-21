package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.ResolveCommandsAction.ResolveCommandsActionError

interface ResolvePlaceMarkerCommand {

	suspend fun perform(
        command: Command<PlaceMarkerCommandData>,
        game: GameExtended
	): Either<ResolveCommandsActionError, List<CommandResolutionError>>

}