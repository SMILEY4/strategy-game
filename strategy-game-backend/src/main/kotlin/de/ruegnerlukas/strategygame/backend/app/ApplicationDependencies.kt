package de.ruegnerlukas.strategygame.backend.app

import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolveCommandsActionImpl
import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolveCreateCityCommandImpl
import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolvePlaceMarkerCommandImpl
import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolvePlaceScoutCommandImpl
import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolveProductionQueueAddEntryCommandImpl
import de.ruegnerlukas.strategygame.backend.commandresolution.core.ResolveProductionQueueRemoveEntryCommandImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.DisconnectAllPlayersActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameDeleteActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameDisconnectActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GamesListActionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.gameengine.external.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.message.websocket.WebSocketMessageProducer
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringServiceImpl
import de.ruegnerlukas.strategygame.backend.common.persistence.DatabaseProvider
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.CommandsInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.CountryByGameAndUserQueryImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.CountryInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GameDeleteImpl
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
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.UsersConnectedToGamesQueryImpl
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.GameConfig
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolvePlaceScoutCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveProductionQueueAddEntryCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveProductionQueueRemoveEntryCommand
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectAllPlayersAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameConnectAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameCreateAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameDeleteAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameJoinAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GamesListAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.game.UncoverMapAreaAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.sendstate.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.turn.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.update.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.common.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService
import de.ruegnerlukas.strategygame.backend.economy.core.EconomyUpdateImpl
import de.ruegnerlukas.strategygame.backend.economy.ports.provided.EconomyUpdate
import de.ruegnerlukas.strategygame.backend.gameengine.core.sendstate.SendGameStateActionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.update.PopFoodConsumption
import de.ruegnerlukas.strategygame.backend.gameengine.core.update.TurnUpdateActionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.CommandsByGameQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.CommandsInsert
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.CountryByGameAndUserQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.CountryInsert
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameDelete
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameInsert
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GamesByUserQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.ReservationInsert
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesQueryByGame
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesQueryByGameAndPosition
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesUpdate
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.UsersConnectedToGamesQuery
import de.ruegnerlukas.strategygame.backend.user.core.CreateUserImpl
import de.ruegnerlukas.strategygame.backend.user.core.DeleteUserImpl
import de.ruegnerlukas.strategygame.backend.user.core.LoginUserImpl
import de.ruegnerlukas.strategygame.backend.user.core.RefreshUserTokenImpl
import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.DeleteUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.LoginUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.RefreshUserToken
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService
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

    single<UserIdentityService> { UserIdentityService.create(Config.get()) } withOptions { createdAtStart() }
    single<ArangoDatabase> { runBlocking { DatabaseProvider.create(Config.get().database) } } withOptions { createdAtStart() }
    single<GameMessageProducer> { GameMessageProducerImpl(WebSocketMessageProducer(get())) }
    single<PrometheusMeterRegistry> { PrometheusMeterRegistry(PrometheusConfig.DEFAULT) }
    single<MonitoringService> { MonitoringServiceImpl(get(), get()) }
    single<WebSocketConnectionHandler> { WSExtended.getConnectionHandler() }

    single<CreateUser> { CreateUserImpl(get()) }
    single<DeleteUser> { DeleteUserImpl(get()) }
    single<LoginUser> { LoginUserImpl(get()) }
    single<RefreshUserToken> { RefreshUserTokenImpl(get()) }

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
    single<UsersConnectedToGamesQuery> { UsersConnectedToGamesQueryImpl(get()) }

    single<GameConfig> { GameConfig.default() }
    single<ResolvePlaceMarkerCommand> { ResolvePlaceMarkerCommandImpl(get()) }
    single<ResolveCreateCityCommand> {
        ResolveCreateCityCommandImpl(
            get(),
            get()
        )
    }
    single<ResolvePlaceScoutCommand> { ResolvePlaceScoutCommandImpl(get(), get()) }
    single<ResolveProductionQueueAddEntryCommand> { ResolveProductionQueueAddEntryCommandImpl(get(), get()) }
    single<ResolveProductionQueueRemoveEntryCommand> { ResolveProductionQueueRemoveEntryCommandImpl(get()) }

    single<PopFoodConsumption> { PopFoodConsumption() }

    single<EconomyUpdate> { EconomyUpdateImpl(get(), get()) }

    single<SendGameStateAction> { SendGameStateActionImpl(get(), get(), get()) }
    single<GamesListAction> { GamesListActionImpl(get()) }
    single<GameDeleteAction> { GameDeleteActionImpl(get()) }
    single<GameConnectAction> { GameConnectActionImpl(get(), get(), get()) }
    single<GameCreateAction> { GameCreateActionImpl(get()) }
    single<GameDisconnectAction> { GameDisconnectActionImpl(get(), get(), get()) }
    single<UncoverMapAreaAction> { de.ruegnerlukas.strategygame.backend.gameengine.core.game.UncoverMapAreaActionImpl(get(), get()) }
    single<GameJoinAction> { GameJoinActionImpl(get(), get(), get(), get(), get(), get()) }
    single<GameRequestConnectionAction> { GameRequestConnectionActionImpl(get()) }
    single<ResolveCommandsAction> {
        ResolveCommandsActionImpl(
            get(),
            get(),
            get(),
            get(),
            get()
        )
    }
    single<TurnEndAction> { TurnEndActionImpl(get(), get(), get(), get(), get(), get()) }
    single<TurnSubmitAction> { TurnSubmitActionImpl(get(), get(), get(), get(), get()) }
    single<MessageHandler> { MessageHandler(get()) }
    single<TurnUpdateAction> { TurnUpdateActionImpl(get(), get(), get(), get()) }
    single<DisconnectAllPlayersAction> { DisconnectAllPlayersActionImpl(get(), get()) }

}