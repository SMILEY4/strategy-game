package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolveCommandsActionImpl
import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolveCreateCityCommandImpl
import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolvePlaceMarkerCommandImpl
import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolvePlaceScoutCommandImpl
import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolveProductionQueueAddEntryCommandImpl
import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolveProductionQueueRemoveEntryCommandImpl
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.gamesession.core.ConnectToGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.CreateGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.JoinGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.RequestConnectionToGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.ListGamesImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CommandsInsertImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CountryByGameAndUserQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CountryInsertImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameExtendedQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameExtendedUpdateImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameUpdateImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GamesByUserQueryImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.ReservationInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesQueryByGameAndPositionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.TilesQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesUpdateImpl
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.economy.core.EconomyUpdateImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.PopFoodConsumption
import de.ruegnerlukas.strategygame.backend.gameengine.core.TurnUpdateActionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.UncoverMapAreaActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.SendGameStateActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.TurnSubmitActionImpl
import io.mockk.every
import io.mockk.mockk

data class TestActions(
    val context: TestActionContext,
    val gameCreate: CreateGameImpl,
    val gameJoin: JoinGameImpl,
    val gameRequestConnect: RequestConnectionToGameImpl,
    val gameConnect: ConnectToGameImpl,
    val gamesList: ListGamesImpl,
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
            CreateGameImpl(
                GameInsertImpl(database)
            )

        private fun gameJoinAction(database: ArangoDatabase) =
            JoinGameImpl(
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
            ConnectToGameImpl(
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
            ListGamesImpl(
                GamesByUserQueryImpl(database)
            )

        private fun gameRequestConnectionAction(database: ArangoDatabase) =
            RequestConnectionToGameImpl(
                GameQueryImpl(database),
            )

        private fun resolveCommandsAction(context: TestActionContext, turnUpdate: TurnUpdateActionImpl) =
            ReportingResolveCommandsActionImpl(
                context,
                ResolveCommandsActionImpl(
                    ResolvePlaceMarkerCommandImpl(
                        turnUpdate
                    ),
                    ResolveCreateCityCommandImpl(
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
                popFoodConsumption,
                EconomyUpdateImpl(
                    GameConfig.default(),
                    popFoodConsumption
                )
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