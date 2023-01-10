package de.ruegnerlukas.strategygame.backend.app

import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCommandsActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateBuildingCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateCityCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceMarkerCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceScoutCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventManager
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionBuildingCreation
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionCityCreation
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionCityInfluence
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionCityNetworkUpdate
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionCityTileOwnership
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionInfluenceOwnership
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionInfluenceVisibility
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionMarkerPlace
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionScoutPlace
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionCountryResources
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionMarketUpdate
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionScoutLifetime
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.GameActionWorldPrepare
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandBuildingCreate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandCityCreate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCityCreate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandMarkerPlace
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandScoutPlace
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventResourcesUpdate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventTileInfluenceUpdate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldPrepare
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameDeleteActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameDisconnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GamesListActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.UncoverMapAreaActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.sendstate.SendGameStateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.user.UserCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.user.UserDeleteActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.user.UserLoginActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.user.UserRefreshTokenActionImpl
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.websocket.WebSocketMessageProducer
import de.ruegnerlukas.strategygame.backend.external.monitoring.MonitoringServiceImpl
import de.ruegnerlukas.strategygame.backend.external.parameters.AWSParameterStore
import de.ruegnerlukas.strategygame.backend.external.persistence.DatabaseProvider
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CommandsInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CountryByGameAndUserQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CountryInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameDeleteImpl
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
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateBuildingCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceScoutCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDeleteAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.UncoverMapAreaAction
import de.ruegnerlukas.strategygame.backend.ports.provided.sendstate.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserDeleteAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserLoginAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserRefreshTokenAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService
import de.ruegnerlukas.strategygame.backend.ports.required.ParameterService
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CommandsByGameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CommandsInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CountryByGameAndUserQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CountryInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameDelete
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GamesByUserQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.ReservationInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesQueryByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesQueryByGameAndPosition
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesUpdate
import io.github.smiley4.ktorwebsocketsextended.WSExtended
import io.github.smiley4.ktorwebsocketsextended.session.WebSocketConnectionHandler
import io.micrometer.prometheus.PrometheusConfig
import io.micrometer.prometheus.PrometheusMeterRegistry
import kotlinx.coroutines.runBlocking
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.dsl.module

@Suppress("RemoveExplicitTypeArguments")
val applicationDependencies = module {

    single<ParameterService> { AWSParameterStore.create(Config.get()) } withOptions { createdAtStart() }
    single<UserIdentityService> { UserIdentityService.create(Config.get()) } withOptions { createdAtStart() }
    single<ArangoDatabase> { runBlocking { DatabaseProvider.create(Config.get().database) } } withOptions { createdAtStart() }
    single<GameMessageProducer> { GameMessageProducerImpl(WebSocketMessageProducer(get())) }
    single<PrometheusMeterRegistry> { PrometheusMeterRegistry(PrometheusConfig.DEFAULT) }
    single<MonitoringService> { MonitoringServiceImpl(get(), get()) }
    single<WebSocketConnectionHandler> { WSExtended.getConnectionHandler() }

    single<UserCreateAction> { UserCreateActionImpl(get()) }
    single<UserDeleteAction> { UserDeleteActionImpl(get()) }
    single<UserLoginAction> { UserLoginActionImpl(get()) }
    single<UserRefreshTokenAction> { UserRefreshTokenActionImpl(get()) }

    single<CommandsInsert> { CommandsInsertImpl(get()) }
    single<GameInsert> { GameInsertImpl(get()) }
    single<CommandsByGameQuery> { CommandsByGameQueryImpl(get()) }
    single<GameQuery> { GameQueryImpl(get()) }
    single<GamesByUserQuery> { GamesByUserQueryImpl(get()) }
    single<GameExtendedQuery> { GameExtendedQueryImpl(get()) }
    single<GameUpdate> { GameUpdateImpl(get()) }
    single<GameDelete> { GameDeleteImpl(get()) }
    single<CountryInsert> { CountryInsertImpl(get()) }
    single<GameExtendedUpdate> { GameExtendedUpdateImpl(get()) }
    single<CountryByGameAndUserQuery> { CountryByGameAndUserQueryImpl(get()) }
    single<ReservationInsert> { ReservationInsertImpl(get()) }
    single<TilesQueryByGame> { TilesQueryByGameImpl(get()) }
    single<TilesQueryByGameAndPosition> { TilesQueryByGameAndPositionImpl(get()) }
    single<TilesUpdate> { TilesUpdateImpl(get()) }

    single<GameConfig> { GameConfig.default() }
    single<ResolvePlaceMarkerCommand> { ResolvePlaceMarkerCommandImpl(get()) }
    single<ResolveCreateCityCommand> { ResolveCreateCityCommandImpl(get(), get()) }
    single<ResolveCreateBuildingCommand> { ResolveCreateBuildingCommandImpl(get(), get()) }
    single<ResolvePlaceScoutCommand> { ResolvePlaceScoutCommandImpl(get(), get()) }
    single<SendGameStateAction> { SendGameStateActionImpl(get(), get(), get()) }
    single<GamesListAction> { GamesListActionImpl(get()) }
    single<GameDeleteAction> { GameDeleteActionImpl(get()) }
    single<GameConnectAction> { GameConnectActionImpl(get(), get(), get()) }
    single<GameCreateAction> { GameCreateActionImpl(get()) }
    single<GameDisconnectAction> { GameDisconnectActionImpl(get(), get()) }
    single<UncoverMapAreaAction> { UncoverMapAreaActionImpl(get(), get()) }
    single<GameJoinAction> { GameJoinActionImpl(get(), get(), get(), get(), get(), get()) }
    single<GameRequestConnectionAction> { GameRequestConnectionActionImpl(get()) }
    single<ResolveCommandsAction> { ResolveCommandsActionImpl(get(), get(), get(), get()) }
    single<TurnEndAction> { TurnEndActionImpl(get(), get(), get(), get(), get(), get()) }
    single<TurnSubmitAction> { TurnSubmitActionImpl(get(), get(), get(), get(), get()) }
    single<MessageHandler> { MessageHandler(get()) }

    single<GameEventManager> {
        GameEventManager().also {
            it.register(GameEventCityCreate.TYPE, GameActionCityInfluence(get()))
            it.register(GameEventCityCreate.TYPE, GameActionCityNetworkUpdate(get(), get()))
            it.register(GameEventCityCreate.TYPE, GameActionCityTileOwnership())
            it.register(GameEventCommandBuildingCreate.TYPE, GameActionBuildingCreation())
            it.register(GameEventCommandCityCreate.TYPE, GameActionCityCreation(get()))
            it.register(GameEventCommandMarkerPlace.TYPE, GameActionMarkerPlace())
            it.register(GameEventCommandScoutPlace.TYPE, GameActionScoutPlace(get()))
            it.register(GameEventResourcesUpdate.TYPE, GameActionMarketUpdate())
            it.register(GameEventTileInfluenceUpdate.TYPE, GameActionInfluenceOwnership(get()))
            it.register(GameEventTileInfluenceUpdate.TYPE, GameActionInfluenceVisibility())
            it.register(GameEventWorldPrepare.TYPE, GameActionWorldPrepare())
            it.register(GameEventWorldUpdate.TYPE, GameActionCountryResources(get()))
            it.register(GameEventWorldUpdate.TYPE, GameActionScoutLifetime(get()))
        }
    }

}