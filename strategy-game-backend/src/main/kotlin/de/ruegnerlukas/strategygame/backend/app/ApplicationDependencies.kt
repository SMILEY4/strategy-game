package de.ruegnerlukas.strategygame.backend.app

import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCommandsActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateCityCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceMarkerCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceScoutCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveProductionQueueAddEntryCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveProductionQueueRemoveEntryCommandImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.DisconnectAllPlayersActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameDeleteActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.GameDisconnectActionImpl
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
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.websocket.WebSocketMessageProducer
import de.ruegnerlukas.strategygame.backend.external.monitoring.MonitoringServiceImpl
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
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.UsersConnectedToGamesQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceScoutCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveProductionQueueAddEntryCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveProductionQueueRemoveEntryCommand
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectAllPlayersAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameConnectAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameCreateAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameDeleteAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameJoinAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GamesListAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.UncoverMapAreaAction
import de.ruegnerlukas.strategygame.backend.ports.provided.sendstate.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.ports.provided.update.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService
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
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UsersConnectedToGamesQuery
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
    single<ResolveCreateCityCommand> { ResolveCreateCityCommandImpl(get(), get()) }
    single<ResolvePlaceScoutCommand> { ResolvePlaceScoutCommandImpl(get(), get()) }
    single<ResolveProductionQueueAddEntryCommand> { ResolveProductionQueueAddEntryCommandImpl(get(), get()) }
    single<ResolveProductionQueueRemoveEntryCommand> { ResolveProductionQueueRemoveEntryCommandImpl(get()) }

    single<SendGameStateAction> { SendGameStateActionImpl(get(), get(), get()) }
    single<GamesListAction> { GamesListActionImpl(get()) }
    single<GameDeleteAction> { GameDeleteActionImpl(get()) }
    single<GameConnectAction> { GameConnectActionImpl(get(), get(), get()) }
    single<GameCreateAction> { GameCreateActionImpl(get()) }
    single<GameDisconnectAction> { GameDisconnectActionImpl(get(), get(), get()) }
    single<UncoverMapAreaAction> { UncoverMapAreaActionImpl(get(), get()) }
    single<GameJoinAction> { GameJoinActionImpl(get(), get(), get(), get(), get(), get()) }
    single<GameRequestConnectionAction> { GameRequestConnectionActionImpl(get()) }
    single<ResolveCommandsAction> { ResolveCommandsActionImpl(get(), get(), get(), get(), get()) }
    single<TurnEndAction> { TurnEndActionImpl(get(), get(), get(), get(), get(), get()) }
    single<TurnSubmitAction> { TurnSubmitActionImpl(get(), get(), get(), get(), get()) }
    single<MessageHandler> { MessageHandler(get()) }
    single<TurnUpdateAction> { TurnUpdateActionImpl(get(), get(), PopFoodConsumption()) }
    single<DisconnectAllPlayersAction> { DisconnectAllPlayersActionImpl(get(), get()) }

}