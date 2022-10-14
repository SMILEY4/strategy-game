package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCommandsActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateBuildingCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateCityCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateTownCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceMarkerCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceScoutCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GamesListActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.UncoverMapAreaActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.SendGameStateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnUpdateActionImpl
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

object TestActions {

    fun gameCreateAction(database: ArangoDatabase) = GameCreateActionImpl(
        GameInsertImpl(database)
    )

    fun gameJoinAction(database: ArangoDatabase) = GameJoinActionImpl(
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

    fun gameConnectAction(database: ArangoDatabase) = GameConnectActionImpl(
        GameQueryImpl(database),
        GameUpdateImpl(database),
        SendGameStateActionImpl(
            GameConfig.default(),
            GameExtendedQueryImpl(database),
            GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
        ),
    )

    fun turnSubmitAction(database: ArangoDatabase) = TurnSubmitActionImpl(
        TurnEndActionImpl(
            ResolveCommandsActionImpl(
                ResolvePlaceMarkerCommandImpl(),
                ResolveCreateCityCommandImpl(
                    ReservationInsertImpl(database),
                    GameConfig.default()
                ),
                ResolveCreateBuildingCommandImpl(
                    GameConfig.default()
                ),
                ResolveCreateTownCommandImpl(
                    ReservationInsertImpl(database),
                    GameConfig.default()
                ),
                ResolvePlaceScoutCommandImpl(
                    GameConfig.default()
                )
            ),
            SendGameStateActionImpl(
                GameConfig.default(),
                GameExtendedQueryImpl(database),
                GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
            ),
            TurnUpdateActionImpl(GameConfig.default()),
            GameExtendedQueryImpl(database),
            GameExtendedUpdateImpl(database),
            CommandsByGameQueryImpl(database),
        ),
        GameQueryImpl(database),
        CountryByGameAndUserQueryImpl(database),
        GameUpdateImpl(database),
        CommandsInsertImpl(database),
    )

    fun gamesListAction(database: ArangoDatabase) = GamesListActionImpl(
        GamesByUserQueryImpl(database)
    )

    fun gameRequestConnectionAction(database: ArangoDatabase) = GameRequestConnectionActionImpl(
        GameQueryImpl(database),
    )

    fun resolveCommandsAction(database: ArangoDatabase) = ResolveCommandsActionImpl(
        ResolvePlaceMarkerCommandImpl(),
        ResolveCreateCityCommandImpl(
            ReservationInsertImpl(database),
            GameConfig.default()
        ),
        ResolveCreateBuildingCommandImpl(
            GameConfig.default()
        ),
        ResolveCreateTownCommandImpl(
            ReservationInsertImpl(database),
            GameConfig.default()
        ),
        ResolvePlaceScoutCommandImpl(
            GameConfig.default()
        )
    )

    fun turnEndAction(database: ArangoDatabase) = TurnEndActionImpl(
        ResolveCommandsActionImpl(
            ResolvePlaceMarkerCommandImpl(),
            ResolveCreateCityCommandImpl(
                ReservationInsertImpl(database),
                GameConfig.default()
            ),
            ResolveCreateBuildingCommandImpl(
                GameConfig.default()
            ),
            ResolveCreateTownCommandImpl(
                ReservationInsertImpl(database),
                GameConfig.default()
            ),
            ResolvePlaceScoutCommandImpl(
                GameConfig.default()
            )
        ),
        SendGameStateActionImpl(
            GameConfig.default(),
            GameExtendedQueryImpl(database),
            GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
        ),
        TurnUpdateActionImpl(GameConfig.default()),
        GameExtendedQueryImpl(database),
        GameExtendedUpdateImpl(database),
        CommandsByGameQueryImpl(database),
    )

}