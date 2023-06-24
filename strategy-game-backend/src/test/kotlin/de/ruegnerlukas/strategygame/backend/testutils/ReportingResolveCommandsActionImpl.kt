package de.ruegnerlukas.strategygame.backend.testutils

//import arrow.core.Either
//import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
//import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
//import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CommandResolutionError
//import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.ResolveCommandsAction
//import de.ruegnerlukas.strategygame.backend.testutils.TestActions.Companion.TestActionContext
//
//class ReportingResolveCommandsActionImpl(
//    private val testContext: TestActionContext,
//    private val action: ResolveCommandsAction
//) : ResolveCommandsAction {
//
//    override suspend fun perform(
//        game: GameExtended,
//        commands: List<Command<*>>
//    ): Either<ResolveCommandsAction.ResolveCommandsActionError, List<CommandResolutionError>> {
//        return action.perform(game, commands).also { result ->
//            if (result is Either.Right) {
//                testContext.commandResolutionErrors[game.game.turn] = result.value
//            }
//        }
//    }
//
//}