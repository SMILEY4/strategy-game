package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCommandsActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateCityCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceMarkerCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceScoutCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveProductionQueueAddEntryCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveProductionQueueRemoveEntryCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GamesListActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.UncoverMapAreaActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.sendstate.SendGameStateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.update.TurnUpdateActionImpl
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CommandsInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CountryByGameAndUserQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CountryInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameExtendedQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameExtendedUpdateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameUpdateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GamesByUserQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.ReservationInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.TilesQueryByGameAndPositionImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.TilesQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.TilesUpdateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction

data class TestActionsCollection(
    val context: TestActionContext,
    val gameCreate: GameCreateActionImpl,
    val gameJoin: GameJoinActionImpl,
    val gameRequestConnect: GameRequestConnectionActionImpl,
    val gameConnect: GameConnectActionImpl,
    val gamesList: GamesListActionImpl,
    val turnSubmit: TurnSubmitActionImpl,
    val resolveCommands: ReportingResolveCommandsActionImpl,
    val turnEnd: TurnEndActionImpl,
) {

    companion object {

        class TestActionContext {
            val commandResolutionErrors = mutableMapOf<Int, List<CommandResolutionError>>()
        }

        fun create(database: ArangoDatabase): TestActionsCollection {
            val context = TestActionContext()
            val gameCreate = gameCreateAction(database)
            val gameJoin = gameJoinAction(database)
            val gameRequestConnect = gameRequestConnectionAction(database)
            val gameConnect = gameConnectAction(database)
            val gamesList = gamesListAction(database)
            val resolveCommands = resolveCommandsAction(database, context)
            val turnSubmit = turnSubmitAction(database, resolveCommands)
            val turnEnd = turnEndAction(database, resolveCommands)
            return TestActionsCollection(
                context = context,
                gameCreate = gameCreate,
                gameJoin = gameJoin,
                gameRequestConnect = gameRequestConnect,
                gameConnect = gameConnect,
                gamesList = gamesList,
                turnSubmit = turnSubmit,
                resolveCommands = resolveCommands,
                turnEnd = turnEnd,
            )
        }

        fun gameCreateAction(database: ArangoDatabase) =
            GameCreateActionImpl(
                GameInsertImpl(database)
            )

        fun gameJoinAction(database: ArangoDatabase) =
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

        fun gameConnectAction(database: ArangoDatabase) =
            GameConnectActionImpl(
                GameQueryImpl(database),
                GameUpdateImpl(database),
                SendGameStateActionImpl(
                    GameConfig.default(),
                    GameExtendedQueryImpl(database),
                    GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
                ),
            )

        fun turnSubmitAction(database: ArangoDatabase, resolveCommandsAction: ResolveCommandsAction) =
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
                    TurnUpdateActionImpl(
                        ReservationInsertImpl(database),
                        GameConfig.default()
                    )
                ),
                GameQueryImpl(database),
                CountryByGameAndUserQueryImpl(database),
                GameUpdateImpl(database),
                CommandsInsertImpl(database),
            )

        fun gamesListAction(database: ArangoDatabase) =
            GamesListActionImpl(
                GamesByUserQueryImpl(database)
            )

        fun gameRequestConnectionAction(database: ArangoDatabase) =
            GameRequestConnectionActionImpl(
                GameQueryImpl(database),
            )

        fun resolveCommandsAction(database: ArangoDatabase, context: TestActionContext) =
            ReportingResolveCommandsActionImpl(
                context,
                ResolveCommandsActionImpl(
                    ResolvePlaceMarkerCommandImpl(
                        TurnUpdateActionImpl(
                            ReservationInsertImpl(database),
                            GameConfig.default()
                        )
                    ),
                    ResolveCreateCityCommandImpl(
                        GameConfig.default(),
                        TurnUpdateActionImpl(
                            ReservationInsertImpl(database),
                            GameConfig.default()
                        )
                    ),
                    ResolvePlaceScoutCommandImpl(
                        GameConfig.default(),
                        TurnUpdateActionImpl(
                            ReservationInsertImpl(database),
                            GameConfig.default()
                        )
                    ),
                    ResolveProductionQueueAddEntryCommandImpl(
                        TurnUpdateActionImpl(
                            ReservationInsertImpl(database),
                            GameConfig.default()
                        ),
                        GameConfig.default()
                    ),
                    ResolveProductionQueueRemoveEntryCommandImpl(
                        TurnUpdateActionImpl(
                            ReservationInsertImpl(database),
                            GameConfig.default()
                        ),
                    )
                )
            )

        fun turnEndAction(database: ArangoDatabase, resolveCommandsAction: ResolveCommandsAction) =
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
                TurnUpdateActionImpl(
                    ReservationInsertImpl(database),
                    GameConfig.default()
                )
            )

    }

}