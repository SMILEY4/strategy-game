package io.github.smiley4.strategygame.backend.worlds

import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DatabaseProvider
import io.github.smiley4.strategygame.backend.worlds.edge.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.edge.CreateGame
import io.github.smiley4.strategygame.backend.worlds.edge.DeleteGame
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectPlayer
import io.github.smiley4.strategygame.backend.worlds.edge.GameService
import io.github.smiley4.strategygame.backend.worlds.edge.JoinGame
import io.github.smiley4.strategygame.backend.worlds.edge.ListGames
import io.github.smiley4.strategygame.backend.worlds.edge.RequestConnectionToGame
import io.github.smiley4.strategygame.backend.worlds.edge.TurnEnd
import io.github.smiley4.strategygame.backend.worlds.edge.TurnSubmit
import io.github.smiley4.strategygame.backend.worlds.module.core.ConnectToGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.CreateGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.DeleteGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.DisconnectAllPlayersImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.DisconnectPlayerImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.GameServiceImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.JoinGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.ListGamesImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.RequestConnectionToGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.TurnEndImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.TurnSubmitImpl
import io.github.smiley4.strategygame.backend.worlds.module.persistence.CommandsByGameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.CommandsInsert
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameDelete
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExistsQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExtendedQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExtendedUpdate
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameInsert
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameUpdate
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GamesByUserQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.UsersConnectedToGamesQuery
import kotlinx.coroutines.runBlocking
import org.koin.core.module.Module
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import kotlin.time.Duration.Companion.seconds

fun Module.dependenciesWorlds() {

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
    single<GameService> { GameServiceImpl(get(), get(), get()) }

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
    single<GameExtendedQuery> { GameExtendedQuery(get()) }
    single<GameExtendedUpdate> { GameExtendedUpdate(get()) }
    single<GameInsert> { GameInsert(get()) }
    single<GameQuery> { GameQuery(get()) }
    single<GamesByUserQuery> { GamesByUserQuery(get()) }
    single<GameUpdate> { GameUpdate(get()) }
    single<UsersConnectedToGamesQuery> { UsersConnectedToGamesQuery(get()) }

}
