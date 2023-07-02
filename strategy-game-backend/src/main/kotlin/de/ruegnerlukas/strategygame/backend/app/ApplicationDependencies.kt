package de.ruegnerlukas.strategygame.backend.app

import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.monitoring.MicrometerMonitoringService
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService
import de.ruegnerlukas.strategygame.backend.common.persistence.DatabaseProvider
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gameengine.core.GameStepImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.InitializeWorldImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.PopFoodConsumption
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENAddProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENCreateBuilding
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENCreateCity
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENPlaceMarker
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENPlaceScout
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENRemoveProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateCityGrowthProgress
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateCityInfluence
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateCityNetwork
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateCitySize
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateCityTileOwnership
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateEconomy
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateInfluenceOwnership
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateInfluenceVisibility
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateProductionQueue
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateScoutLifetime
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateAddProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateCreateCity
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateOperationInvalid
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidatePlaceMarker
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidatePlaceScout
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateRemoveProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.playerview.PlayerViewCreatorImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.ReservationInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.GameStep
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.ReservationInsert
import de.ruegnerlukas.strategygame.backend.gamesession.core.ConnectToGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.CreateGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.DeleteGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.DisconnectAllPlayersImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.DisconnectFromGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.JoinGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.ListGamesImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.RequestConnectionToGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.TurnEndImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.DiscoverMapAreaImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.producer.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.websocket.WebSocketMessageProducer
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CommandsInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.CountryInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GameExistsQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameDeleteImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GameExtendedQueryImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GameExtendedUpdateImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.InitializeWorld
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PlayerViewCreator
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameUpdateImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GamesByUserQueryImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesQueryByGameAndPositionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesUpdateImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.UsersConnectedToGamesQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.CreateGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DeleteGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectAllPlayers
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectFromGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ListGames
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEnd
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnSubmit
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.DiscoverMapArea
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CommandsByGameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CommandsInsert
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.CountryInsert
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExistsQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameDelete
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesInsert
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameInsert
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GamesByUserQuery
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
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldBuilder
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldBuilderImpl
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
    single<MonitoringService> { MicrometerMonitoringService(get()).also { Monitoring.service = it } }
    single<WebSocketConnectionHandler> { WSExtended.getConnectionHandler() }

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

    single<WorldBuilder> { WorldBuilderImpl() }

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

    single<PlayerViewCreator> { PlayerViewCreatorImpl(get(), get()) }
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
    single<GENValidatePlaceScout> { GENValidatePlaceScout(get(), get()) } withOptions { createdAtStart() }
    single<GENPlaceScout> { GENPlaceScout(get(), get()) } withOptions { createdAtStart() }
    single<GENValidateAddProductionQueueEntry> { GENValidateAddProductionQueueEntry(get(), get()) } withOptions { createdAtStart() }
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

}