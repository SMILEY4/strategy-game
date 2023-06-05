package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceMarkerCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceScoutCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveProductionQueueAddEntryCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveProductionQueueRemoveEntryCommandImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GamesListActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.UncoverMapAreaActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.sendstate.SendGameStateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.update.PopFoodConsumption
import de.ruegnerlukas.strategygame.backend.core.actions.update.TurnUpdateActionImpl
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.external.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.CommandsInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.CountryByGameAndUserQueryImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.CountryInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GameExtendedQueryImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GameExtendedUpdateImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameUpdateImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GamesByUserQueryImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.ReservationInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesQueryByGameAndPositionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesUpdateImpl
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCommandsAction
import io.mockk.every
import io.mockk.mockk

data class TestActions(
    val context: TestActionContext,
    val gameCreate: GameCreateActionImpl,
    val gameJoin: GameJoinActionImpl,
    val gameRequestConnect: GameRequestConnectionActionImpl,
    val gameConnect: GameConnectActionImpl,
    val gamesList: GamesListActionImpl,
    val turnSubmit: TurnSubmitActionImpl,
    val resolveCommands: ReportingResolveCommandsActionImpl,
    val turnEnd: TurnEndActionImpl,
    val turnUpdate: TurnUpdateActionImpl
) {

    companion object {

        class TestActionContext {
            val commandResolutionErrors = mutableMapOf<Int, List<CommandResolutionError>>()
        }

        fun create(database: ArangoDatabase, fixedPopFoodConsumption: Int? = null): TestActions {
            val context = TestActionContext()
            val gameCreate = gameCreateAction(database)
            val gameJoin = gameJoinAction(database)
            val gameRequestConnect = gameRequestConnectionAction(database)
            val gameConnect = gameConnectAction(database)
            val gamesList = gamesListAction(database)
            val turnUpdate = turnUpdateAction(database, popFoodConsumption(fixedPopFoodConsumption))
            val resolveCommands = resolveCommandsAction(context, turnUpdate)
            val turnSubmit = turnSubmitAction(database, resolveCommands, turnUpdate)
            val turnEnd = turnEndAction(database, resolveCommands, turnUpdate)
            return TestActions(
                context = context,
                gameCreate = gameCreate,
                gameJoin = gameJoin,
                gameRequestConnect = gameRequestConnect,
                gameConnect = gameConnect,
                gamesList = gamesList,
                turnSubmit = turnSubmit,
                resolveCommands = resolveCommands,
                turnEnd = turnEnd,
                turnUpdate = turnUpdate
            )
        }

        private fun gameCreateAction(database: ArangoDatabase) =
            GameCreateActionImpl(
                GameInsertImpl(database)
            )

        private fun gameJoinAction(database: ArangoDatabase) =
            GameJoinActionImpl(
                GameQueryImpl(database),
                GameUpdateImpl(database),
                CountryInsertImpl(database),
                TilesQueryByGameImpl(database),
                GameConfig(),
                UncoverMapAreaActionImpl(
                    TilesQueryByGameAndPositionImpl(database),
                    TilesUpdateImpl(database)
                )
            )

        private fun gameConnectAction(database: ArangoDatabase) =
            GameConnectActionImpl(
                GameQueryImpl(database),
                GameUpdateImpl(database),
                SendGameStateActionImpl(
                    GameConfig.default(),
                    GameExtendedQueryImpl(database),
                    GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
                ),
            )

        private fun turnSubmitAction(
            database: ArangoDatabase,
            resolveCommandsAction: ResolveCommandsAction,
            turnUpdate: TurnUpdateActionImpl
        ) =
            TurnSubmitActionImpl(
                TurnEndActionImpl(
                    resolveCommandsAction,
                    SendGameStateActionImpl(
                        GameConfig.default(),
                        GameExtendedQueryImpl(database),
                        GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
                    ),
                    GameExtendedQueryImpl(database),
                    GameExtendedUpdateImpl(database),
                    CommandsByGameQueryImpl(database),
                    turnUpdate
                ),
                GameQueryImpl(database),
                CountryByGameAndUserQueryImpl(database),
                GameUpdateImpl(database),
                CommandsInsertImpl(database),
            )

        private fun gamesListAction(database: ArangoDatabase) =
            GamesListActionImpl(
                GamesByUserQueryImpl(database)
            )

        private fun gameRequestConnectionAction(database: ArangoDatabase) =
            GameRequestConnectionActionImpl(
                GameQueryImpl(database),
            )

        private fun resolveCommandsAction(context: TestActionContext, turnUpdate: TurnUpdateActionImpl) =
            ReportingResolveCommandsActionImpl(
                context,
                de.ruegnerlukas.strategygame.backend.gameengine.core.actions.commands.ResolveCommandsActionImpl(
                    ResolvePlaceMarkerCommandImpl(
                        turnUpdate
                    ),
                    de.ruegnerlukas.strategygame.backend.gameengine.core.actions.commands.ResolveCreateCityCommandImpl(
                        GameConfig.default(),
                        turnUpdate
                    ),
                    ResolvePlaceScoutCommandImpl(
                        GameConfig.default(),
                        turnUpdate
                    ),
                    ResolveProductionQueueAddEntryCommandImpl(
                        turnUpdate,
                        GameConfig.default()
                    ),
                    ResolveProductionQueueRemoveEntryCommandImpl(
                        turnUpdate
                    )
                )
            )

        private fun turnEndAction(
            database: ArangoDatabase,
            resolveCommandsAction: ResolveCommandsAction,
            turnUpdate: TurnUpdateActionImpl
        ) =
            TurnEndActionImpl(
                resolveCommandsAction,
                SendGameStateActionImpl(
                    GameConfig.default(),
                    GameExtendedQueryImpl(database),
                    GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
                ),
                GameExtendedQueryImpl(database),
                GameExtendedUpdateImpl(database),
                CommandsByGameQueryImpl(database),
                turnUpdate
            )

        private fun turnUpdateAction(database: ArangoDatabase, popFoodConsumption: PopFoodConsumption) =
            TurnUpdateActionImpl(
                ReservationInsertImpl(database),
                GameConfig.default(),
                popFoodConsumption
            )

        private fun popFoodConsumption(fixed: Int? = null): PopFoodConsumption {
            if (fixed == null) {
                return PopFoodConsumption()
            } else {
                return mockk<PopFoodConsumption>().also {
                    every { it.getRequiredFood(any()) } returns fixed.toFloat()
                }
            }
        }
    }

}