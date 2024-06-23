package io.github.smiley4.strategygame.backend.app

import io.github.smiley4.ktorwebsocketsextended.WSExtended
import io.github.smiley4.ktorwebsocketsextended.session.WebSocketConnectionHandler
import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.common.monitoring.MicrometerMonitoringService
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring
import io.github.smiley4.strategygame.backend.common.monitoring.MonitoringService
import io.github.smiley4.strategygame.backend.common.persistence.DatabaseProvider
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.engine.core.DiscoverMapAreaImpl
import io.github.smiley4.strategygame.backend.engine.core.GameStepImpl
import io.github.smiley4.strategygame.backend.engine.core.InitializePlayerImpl
import io.github.smiley4.strategygame.backend.engine.core.InitializeWorldImpl
import io.github.smiley4.strategygame.backend.engine.core.common.PopFoodConsumption
import io.github.smiley4.strategygame.backend.engine.core.common.RouteGenerator
import io.github.smiley4.strategygame.backend.engine.core.eco.EconomyPopFoodConsumptionProvider
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENAddProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENCreateBuilding
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENCreateCity
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENDeleteMarker
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENPlaceMarker
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENPlaceScout
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENRemoveProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateCityGrowthProgress
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateCityInfluence
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateCityNetwork
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateCitySize
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateCityTileOwnership
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateEconomy
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateInfluenceOwnership
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateInfluenceVisibility
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateProductionQueue
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateScoutLifetime
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpgradeSettlementTier
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateAddProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateCreateCity
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateOperationInvalid
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidatePlaceMarker
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidatePlaceScout
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateRemoveProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateUpgradeSettlementTier
import io.github.smiley4.strategygame.backend.engine.core.playerview.POVBuilderImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.CountryInsertImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.GameExistsQueryImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.GameExtendedQueryImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.GameExtendedUpdateImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.ReservationInsertImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.TilesInsertImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.TilesQueryByGameAndPositionImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.TilesQueryByGameImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.TilesUpdateImpl
import io.github.smiley4.strategygame.backend.engine.ports.provided.DiscoverMapArea
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializePlayer
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializeWorld
import io.github.smiley4.strategygame.backend.engine.ports.provided.POVBuilder
import io.github.smiley4.strategygame.backend.engine.ports.required.CountryInsert
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExistsQuery
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExtendedQuery
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExtendedUpdate
import io.github.smiley4.strategygame.backend.engine.ports.required.ReservationInsert
import io.github.smiley4.strategygame.backend.engine.ports.required.TilesInsert
import io.github.smiley4.strategygame.backend.engine.ports.required.TilesQueryByGame
import io.github.smiley4.strategygame.backend.engine.ports.required.TilesQueryByGameAndPosition
import io.github.smiley4.strategygame.backend.engine.ports.required.TilesUpdate
import io.github.smiley4.strategygame.backend.gateway.dependenciesGateway
import io.github.smiley4.strategygame.backend.users.core.CreateUserImpl
import io.github.smiley4.strategygame.backend.users.core.DeleteUserImpl
import io.github.smiley4.strategygame.backend.users.core.LoginUserImpl
import io.github.smiley4.strategygame.backend.users.core.RefreshUserTokenImpl
import io.github.smiley4.strategygame.backend.users.dependenciesUsers
import io.github.smiley4.strategygame.backend.users.ports.provided.CreateUser
import io.github.smiley4.strategygame.backend.users.ports.provided.DeleteUser
import io.github.smiley4.strategygame.backend.users.ports.provided.LoginUser
import io.github.smiley4.strategygame.backend.users.ports.provided.RefreshUserToken
import io.github.smiley4.strategygame.backend.users.ports.required.UserIdentityService
import io.github.smiley4.strategygame.backend.worldgen.dependenciesWorldGen
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenerator
import io.github.smiley4.strategygame.backend.worldgen.module.WorldGeneratorImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.ConnectToGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.CreateGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.DeleteGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.DisconnectAllPlayersImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.DisconnectFromGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.JoinGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.ListGamesImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.RequestConnectionToGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.TurnEndImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.TurnSubmitActionImpl
import io.github.smiley4.strategygame.backend.worlds.external.message.handler.MessageHandler
import io.github.smiley4.strategygame.backend.worlds.external.message.producer.GameMessageProducer
import io.github.smiley4.strategygame.backend.worlds.external.message.producer.GameMessageProducerImpl
import io.github.smiley4.strategygame.backend.worlds.external.message.websocket.MessageProducer
import io.github.smiley4.strategygame.backend.worlds.external.message.websocket.WebSocketMessageProducer
import io.github.smiley4.strategygame.backend.worlds.external.persistence.CommandsByGameQueryImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.CommandsInsertImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.GameDeleteImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.GameInsertImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.GameQueryImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.GameUpdateImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.GamesByUserQueryImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.UsersConnectedToGamesQueryImpl
import io.github.smiley4.strategygame.backend.worlds.ports.provided.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.edge.CreateGame
import io.github.smiley4.strategygame.backend.worlds.edge.DeleteGame
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectFromGame
import io.github.smiley4.strategygame.backend.worlds.edge.JoinGame
import io.github.smiley4.strategygame.backend.worlds.edge.ListGames
import io.github.smiley4.strategygame.backend.worlds.edge.RequestConnectionToGame
import io.github.smiley4.strategygame.backend.worlds.edge.TurnEnd
import io.github.smiley4.strategygame.backend.worlds.edge.TurnSubmit
import io.github.smiley4.strategygame.backend.worlds.module.core.required.CommandsByGameQuery
import io.github.smiley4.strategygame.backend.worlds.module.core.required.CommandsInsert
import io.github.smiley4.strategygame.backend.worlds.module.core.required.GameDelete
import io.github.smiley4.strategygame.backend.worlds.module.core.required.GameInsert
import io.github.smiley4.strategygame.backend.worlds.module.core.required.GameQuery
import io.github.smiley4.strategygame.backend.worlds.module.core.required.GameUpdate
import io.github.smiley4.strategygame.backend.worlds.module.core.required.GamesByUserQuery
import io.github.smiley4.strategygame.backend.worlds.module.core.required.UsersConnectedToGamesQuery
import io.micrometer.prometheus.PrometheusConfig
import io.micrometer.prometheus.PrometheusMeterRegistry
import kotlinx.coroutines.runBlocking
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.dsl.module
import kotlin.time.Duration.Companion.seconds

val applicationDependencies = module {

    dependenciesGateway()
    dependenciesUsers()
    dependenciesWorldGen()

    single<UserIdentityService> { UserIdentityService.create(Config.get().identityService) } withOptions { createdAtStart() }
    single<ArangoDatabase> {
        runBlocking {
            DatabaseProvider.create(
                Config.get().database.name,
                Config.get().database.host,
                Config.get().database.port,
                Config.get().database.retryCount,
                Config.get().database.retryTimeout.seconds
            )
        }
    } withOptions { createdAtStart() }
    single<GameMessageProducer> { GameMessageProducerImpl(WebSocketMessageProducer(get())) }
    single<PrometheusMeterRegistry> { PrometheusMeterRegistry(PrometheusConfig.DEFAULT) }
    single<MonitoringService> { MicrometerMonitoringService(get()).also { Monitoring.service = it } }
    single<WebSocketConnectionHandler> { WSExtended.getConnectionHandler() }
    single<MessageProducer> { WebSocketMessageProducer(get()) }

    single<CreateUser> { CreateUserImpl(get()) }
    single<DeleteUser> { DeleteUserImpl(get()) }
    single<LoginUser> { LoginUserImpl(get()) }
    single<RefreshUserToken> { RefreshUserTokenImpl(get()) }

    single<CommandsInsert> { CommandsInsertImpl(get()) }
    single<GameInsert> { GameInsertImpl(get()) }
    single<TilesInsert> { TilesInsertImpl(get()) }
    single<CommandsByGameQuery> { CommandsByGameQueryImpl(get()) }
    single<GameQuery> { GameQueryImpl(get()) }
    single<GamesByUserQuery> { GamesByUserQueryImpl(get()) }
    single<GameExtendedQuery> { GameExtendedQueryImpl(get()) }
    single<GameUpdate> { GameUpdateImpl(get()) }
    single<GameDelete> { GameDeleteImpl(get()) }
    single<GameExistsQuery> { GameExistsQueryImpl(get()) }
    single<CountryInsert> { CountryInsertImpl(get()) }
    single<GameExtendedUpdate> { GameExtendedUpdateImpl(get()) }
    single<ReservationInsert> { ReservationInsertImpl(get()) }
    single<TilesQueryByGame> { TilesQueryByGameImpl(get()) }
    single<TilesQueryByGameAndPosition> { TilesQueryByGameAndPositionImpl(get()) }
    single<TilesUpdate> { TilesUpdateImpl(get()) }
    single<UsersConnectedToGamesQuery> { UsersConnectedToGamesQueryImpl(get()) }

    single<GameConfig> { GameConfig.default() }

    single<PopFoodConsumption> { PopFoodConsumption() }

    single<WorldGenerator> { WorldGeneratorImpl() }

    single<ListGames> { ListGamesImpl(get()) }
    single<DeleteGame> { DeleteGameImpl(get()) }
    single<ConnectToGame> { ConnectToGameImpl(get(), get(), get(), get()) }
    single<CreateGame> { CreateGameImpl(get(), get()) }
    single<DisconnectFromGame> { DisconnectFromGameImpl(get(), get(), get()) }
    single<DiscoverMapArea> { DiscoverMapAreaImpl(get(), get(), get()) }
    single<JoinGame> { JoinGameImpl(get(), get(), get()) }
    single<RequestConnectionToGame> { RequestConnectionToGameImpl(get()) }
    single<TurnEnd> { TurnEndImpl(get(), get(), get(), get(), get()) }
    single<TurnSubmit> { TurnSubmitActionImpl(get(), get(), get(), get()) }
    single<MessageHandler> { MessageHandler(get()) }
    single<GameStep> { GameStepImpl(get(), get(), get(), get()) }
    single<DisconnectAllPlayers> { DisconnectAllPlayersImpl(get(), get()) }

    single<RouteGenerator> { RouteGenerator(get()) }
    single<EconomyPopFoodConsumptionProvider> { PopFoodConsumption() }
    single<POVBuilder> { POVBuilderImpl(get(), get()) }
    single<InitializePlayer> { InitializePlayerImpl(get(), get(), get(), get(), get()) }
    single<InitializeWorld> { InitializeWorldImpl(get(), get(), get()) }
    single<EventSystem> { EventSystem() }
    single<GENCreateCity> { GENCreateCity(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateCityInfluence> { GENUpdateCityInfluence(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateCityNetwork> { GENUpdateCityNetwork(get(), get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateCityTileOwnership> { GENUpdateCityTileOwnership(get()) } withOptions { createdAtStart() }
    single<GENUpdateInfluenceOwnership> { GENUpdateInfluenceOwnership(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateInfluenceVisibility> { GENUpdateInfluenceVisibility(get()) } withOptions { createdAtStart() }
    single<GENValidateCreateCity> { GENValidateCreateCity(get(), get()) } withOptions { createdAtStart() }
    single<GENValidatePlaceMarker> { GENValidatePlaceMarker(get()) } withOptions { createdAtStart() }
    single<GENPlaceMarker> { GENPlaceMarker(get()) } withOptions { createdAtStart() }
    single<GENDeleteMarker> { GENDeleteMarker(get()) } withOptions { createdAtStart() }
    single<GENValidatePlaceScout> { GENValidatePlaceScout(get(), get()) } withOptions { createdAtStart() }
    single<GENPlaceScout> { GENPlaceScout(get(), get()) } withOptions { createdAtStart() }
    single<GENValidateAddProductionQueueEntry> { GENValidateAddProductionQueueEntry(get()) } withOptions { createdAtStart() }
    single<GENAddProductionQueueEntry> { GENAddProductionQueueEntry(get()) } withOptions { createdAtStart() }
    single<GENValidateRemoveProductionQueueEntry> { GENValidateRemoveProductionQueueEntry(get()) } withOptions { createdAtStart() }
    single<GENRemoveProductionQueueEntry> { GENRemoveProductionQueueEntry(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateScoutLifetime> { GENUpdateScoutLifetime(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateEconomy> { GENUpdateEconomy(get(), get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateProductionQueue> { GENUpdateProductionQueue(get()) } withOptions { createdAtStart() }
    single<GENCreateBuilding> { GENCreateBuilding(get()) } withOptions { createdAtStart() }
    single<GENUpdateCityGrowthProgress> { GENUpdateCityGrowthProgress(get(), get()) } withOptions { createdAtStart() }
    single<GENUpdateCitySize> { GENUpdateCitySize(get()) } withOptions { createdAtStart() }
    single<GENValidateOperationInvalid> { GENValidateOperationInvalid(get()) } withOptions { createdAtStart() }
    single<GENValidateUpgradeSettlementTier> { GENValidateUpgradeSettlementTier(get()) } withOptions { createdAtStart() }
    single<GENUpgradeSettlementTier> { GENUpgradeSettlementTier(get()) } withOptions { createdAtStart() }

}