package de.ruegnerlukas.strategygame.backend.app

import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCommandsActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateBuildingCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateCityCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceMarkerCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceScoutCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventManager
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.BuildingCreationAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.BuildingCreationCostAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.CityCreationAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.CityCreationCostAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.CityInfluenceUpdateAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.CityTileOwnershipAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.InfluenceOwnershipUpdateAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.InfluenceVisibilityUpdateAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.PlaceMarkerAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.PlaceScoutAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.TickCountryResourcesAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.actions.UpdateScoutLifetimeAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.CreateBuildingCommandEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.CreateBuildingEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.CreateCityCommandEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.CreateCityEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.PlaceMarkerCommandEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.PlaceScoutCommandEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.TileInfluenceUpdateEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.WorldUpdateEvent
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
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnUpdateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.user.UserCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.user.UserDeleteActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.user.UserLoginActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.user.UserRefreshTokenActionImpl
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
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserDeleteAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserLoginAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserRefreshTokenAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService
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

    single<UserIdentityService> { UserIdentityService.create(Config.get()) } withOptions { createdAtStart() }
    single<GameMessageProducer> { GameMessageProducerImpl(WebSocketMessageProducer(get())) }
    single<ArangoDatabase> { runBlocking { DatabaseProvider.create(Config.get().db) } } withOptions { createdAtStart() }
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
    single<TurnUpdateAction> { TurnUpdateActionImpl(get()) }
    single<TurnEndAction> { TurnEndActionImpl(get(), get(), get(), get(), get(), get()) }
    single<TurnSubmitAction> { TurnSubmitActionImpl(get(), get(), get(), get(), get()) }
    single<MessageHandler> { MessageHandler(get()) }

    single<GameEventManager> {
        GameEventManager().also {
            it.register(CreateCityCommandEvent::class.simpleName!!, CityCreationAction(get()))
            it.register(CreateCityEvent::class.simpleName!!, CityCreationCostAction(get()))
            it.register(CreateCityEvent::class.simpleName!!, CityInfluenceUpdateAction(get()))
            it.register(CreateCityEvent::class.simpleName!!, CityTileOwnershipAction(get()))
            it.register(TileInfluenceUpdateEvent::class.simpleName!!, InfluenceOwnershipUpdateAction(get()))
            it.register(TileInfluenceUpdateEvent::class.simpleName!!, InfluenceVisibilityUpdateAction(get()))
            it.register(CreateBuildingCommandEvent::class.simpleName!!, BuildingCreationAction())
            it.register(CreateBuildingEvent::class.simpleName!!, BuildingCreationCostAction(get()))
            it.register(PlaceMarkerCommandEvent::class.simpleName!!, PlaceMarkerAction())
            it.register(PlaceScoutCommandEvent::class.simpleName!!, PlaceScoutAction(get()))
            it.register(WorldUpdateEvent::class.simpleName!!, UpdateScoutLifetimeAction(get()))
            it.register(WorldUpdateEvent::class.simpleName!!, TickCountryResourcesAction(get()))
        }
    }

}