package de.ruegnerlukas.strategygame.backend.testutils

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.testutils.TestActionsCollection.Companion.TestActionContext

class ReportingResolveCommandsActionImpl(
    private val testContext: TestActionContext,
    private val action: ResolveCommandsAction
) : ResolveCommandsAction {

    override suspend fun perform(
        game: GameExtended,
        commands: List<Command<*>>
    ): Either<ResolveCommandsAction.ResolveCommandsActionError, List<CommandResolutionError>> {
        return action.perform(game, commands).also { result ->
            if (result is Either.Right) {
                testContext.commandResolutionErrors[game.game.turn] = result.value
            }
        }
    }

}