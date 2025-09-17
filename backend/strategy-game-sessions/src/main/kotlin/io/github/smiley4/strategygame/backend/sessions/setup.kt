package io.github.smiley4.strategygame.backend.sessions

import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DatabaseProvider
import io.github.smiley4.strategygame.backend.sessions.application.core.ConnectToGameImpl
import io.github.smiley4.strategygame.backend.sessions.application.core.CreateGameImpl
import io.github.smiley4.strategygame.backend.sessions.application.core.DeleteGameImpl
import io.github.smiley4.strategygame.backend.sessions.application.core.DisconnectAllPlayersImpl
import io.github.smiley4.strategygame.backend.sessions.application.core.DisconnectPlayerImpl
import io.github.smiley4.strategygame.backend.sessions.application.core.GameServiceImpl
import io.github.smiley4.strategygame.backend.sessions.application.core.JoinGameImpl
import io.github.smiley4.strategygame.backend.sessions.application.core.ListGamesImpl
import io.github.smiley4.strategygame.backend.sessions.application.core.RequestConnectionToGameImpl
import io.github.smiley4.strategygame.backend.sessions.application.core.TurnEndImpl
import io.github.smiley4.strategygame.backend.sessions.application.core.TurnSubmitImpl
import io.github.smiley4.strategygame.backend.sessions.application.engine.GameStepAdapter
import io.github.smiley4.strategygame.backend.sessions.application.engine.GenericGameServiceAdapter
import io.github.smiley4.strategygame.backend.sessions.application.engine.InitializePlayerAdapter
import io.github.smiley4.strategygame.backend.sessions.application.engine.InitializeWorldAdapter
import io.github.smiley4.strategygame.backend.sessions.application.persistence.CommandsByGameQuery
import io.github.smiley4.strategygame.backend.sessions.application.persistence.CommandsInsert
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameDelete
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameExistsQuery
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameStateQuery
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameInsert
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameQuery
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameUpdate
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GamesByUserQuery
import io.github.smiley4.strategygame.backend.sessions.application.persistence.UsersConnectedToGamesQuery
import io.github.smiley4.strategygame.backend.sessions.ports.provided.ConnectToGame
import io.github.smiley4.strategygame.backend.sessions.ports.provided.CreateGame
import io.github.smiley4.strategygame.backend.sessions.ports.provided.DeleteGame
import io.github.smiley4.strategygame.backend.sessions.ports.provided.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.sessions.ports.provided.DisconnectPlayer
import io.github.smiley4.strategygame.backend.sessions.ports.provided.GameService
import io.github.smiley4.strategygame.backend.sessions.ports.provided.JoinGame
import io.github.smiley4.strategygame.backend.sessions.ports.provided.ListGames
import io.github.smiley4.strategygame.backend.sessions.ports.provided.RequestConnectionToGame
import io.github.smiley4.strategygame.backend.sessions.ports.provided.TurnEnd
import io.github.smiley4.strategygame.backend.sessions.ports.provided.TurnSubmit
import io.github.smiley4.strategygame.backend.sessions.ports.required.GameStep
import io.github.smiley4.strategygame.backend.sessions.ports.required.GenericGameService
import io.github.smiley4.strategygame.backend.sessions.ports.required.InitializePlayer
import io.github.smiley4.strategygame.backend.sessions.ports.required.InitializeWorld
import kotlinx.coroutines.runBlocking
import org.koin.core.module.Module
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import kotlin.time.Duration.Companion.seconds

fun Module.dependenciesSessions() {

    // core
    single<ConnectToGame> { ConnectToGameImpl(get(), get(), get(), get(), get()) }
    single<CreateGame> { CreateGameImpl(get(), get(), get()) }
    single<DeleteGame> { DeleteGameImpl(get()) }
    single<DisconnectAllPlayers> { DisconnectAllPlayersImpl(get(), get()) }
    single<DisconnectPlayer> { DisconnectPlayerImpl(get(), get()) }
    single<JoinGame> { JoinGameImpl(get(), get(), get(), get(), get()) }
    single<ListGames> { ListGamesImpl(get()) }
    single<RequestConnectionToGame> { RequestConnectionToGameImpl(get()) }
    single<TurnEnd> { TurnEndImpl(get(), get(), get(), get(), get(), get(), get(), get()) }
    single<TurnSubmit> { TurnSubmitImpl(get(), get(), get(), get()) }
    single<GameService> { GameServiceImpl(get(), get()) }

    // persistence
    single<DatabaseProvider.Config> {
        DatabaseProvider.Config(
            host = Config.get().database.host,
            port = Config.get().database.port,
            username = null,
            password = null,
            name = Config.get().database.name,
            retryCount = Config.get().database.retryCount,
            retryTimeout = Config.get().database.retryTimeout.seconds
        )
    }
    single<ArangoDatabase> { runBlocking { DatabaseProvider.create(get()) } } withOptions { createdAtStart() }
    single<CommandsByGameQuery> { CommandsByGameQuery(get()) }
    single<CommandsInsert> { CommandsInsert(get()) }
    single<GameDelete> { GameDelete(get()) }
    single<GameExistsQuery> { GameExistsQuery(get()) }
    single<GameStateQuery> { GameStateQuery(get()) }
    single<io.github.smiley4.strategygame.backend.sessions.application.persistence.GameStateUpdate> {
        io.github.smiley4.strategygame.backend.sessions.application.persistence.GameStateUpdate(
            get()
        )
    }
    single<GameInsert> { GameInsert(get()) }
    single<GameQuery> { GameQuery(get()) }
    single<GamesByUserQuery> { GamesByUserQuery(get()) }
    single<GameUpdate> { GameUpdate(get()) }
    single<UsersConnectedToGamesQuery> { UsersConnectedToGamesQuery(get()) }

    // engine
    single<GameStep> { GameStepAdapter(get()) }
    single<InitializePlayer> { InitializePlayerAdapter(get()) }
    single<InitializeWorld> { InitializeWorldAdapter(get()) }
    single<GenericGameService> { GenericGameServiceAdapter(get()) }

}
