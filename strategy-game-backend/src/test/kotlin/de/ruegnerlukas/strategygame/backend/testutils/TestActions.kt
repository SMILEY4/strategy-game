package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCommandsActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateBuildingCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateCityCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceMarkerCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceScoutCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventManager
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.*
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.*
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GamesListActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.UncoverMapAreaActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.sendstate.SendGameStateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.*
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
                ResolvePlaceMarkerCommandImpl(
                    gameEventManager(database)
                ),
                ResolveCreateCityCommandImpl(
                    GameConfig.default(),
                    gameEventManager(database)
                ),
                ResolveCreateBuildingCommandImpl(
                    GameConfig.default(),
                    gameEventManager(database)
                ),
                ResolvePlaceScoutCommandImpl(
                    GameConfig.default(),
                    gameEventManager(database)
                )
            ),
            SendGameStateActionImpl(
                GameConfig.default(),
                GameExtendedQueryImpl(database),
                GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
            ),
            GameExtendedQueryImpl(database),
            GameExtendedUpdateImpl(database),
            CommandsByGameQueryImpl(database),
            gameEventManager(database)
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
        ResolvePlaceMarkerCommandImpl(gameEventManager(database)),
        ResolveCreateCityCommandImpl(
            GameConfig.default(),
                    gameEventManager(database)
        ),
        ResolveCreateBuildingCommandImpl(
            GameConfig.default(),
            gameEventManager(database)
        ),
        ResolvePlaceScoutCommandImpl(
            GameConfig.default(),
            gameEventManager(database)
        )
    )

    fun turnEndAction(database: ArangoDatabase) = TurnEndActionImpl(
        ResolveCommandsActionImpl(
            ResolvePlaceMarkerCommandImpl(gameEventManager(database)),
            ResolveCreateCityCommandImpl(
                GameConfig.default(),
                gameEventManager(database)
            ),
            ResolveCreateBuildingCommandImpl(
                GameConfig.default(),
                gameEventManager(database)
            ),
            ResolvePlaceScoutCommandImpl(
                GameConfig.default(),
                gameEventManager(database)
            )
        ),
        SendGameStateActionImpl(
            GameConfig.default(),
            GameExtendedQueryImpl(database),
            GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
        ),
        GameExtendedQueryImpl(database),
        GameExtendedUpdateImpl(database),
        CommandsByGameQueryImpl(database),
        gameEventManager(database)
    )
    
    private fun gameEventManager(database: ArangoDatabase): GameEventManager {
        return GameEventManager().also {
            it.register(GameEventCityCreate.TYPE, GameActionCityInfluence(GameConfig.default()))
            it.register(GameEventCityCreate.TYPE, GameActionCityTileOwnership())
            it.register(GameEventCommandBuildingCreate.TYPE, GameActionBuildingCreation())
            it.register(GameEventCommandCityCreate.TYPE, GameActionCityCreation(ReservationInsertImpl(database)))
            it.register(GameEventCommandMarkerPlace.TYPE, GameActionMarkerPlace())
            it.register(GameEventCommandScoutPlace.TYPE, GameActionScoutPlace(GameConfig.default()))
            it.register(GameEventTileInfluenceUpdate.TYPE, GameActionInfluenceOwnership(GameConfig.default()))
            it.register(GameEventTileInfluenceUpdate.TYPE, GameActionInfluenceVisibility())
            it.register(GameEventWorldUpdate.TYPE, GameActionCountryResources(GameConfig.default()))
            it.register(GameEventWorldUpdate.TYPE, GameActionScoutLifetime(GameConfig.default()))
        }
    }

}