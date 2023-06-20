package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CommandResolutionError

interface ResolveCommandsAction {

    sealed class ResolveCommandsActionError
    object GameNotFoundError : ResolveCommandsActionError()
    object CountryNotFoundError : ResolveCommandsActionError()
    object TileNotFoundError : ResolveCommandsActionError()
    object CityNotFoundError : ResolveCommandsActionError()

    suspend fun perform(game: GameExtended, commands: List<Command<*>>): Either<ResolveCommandsActionError, List<CommandResolutionError>>
}