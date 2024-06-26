package io.github.smiley4.strategygame.backend.worlds

import io.github.smiley4.strategygame.backend.worlds.edge.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.edge.CreateGame
import io.github.smiley4.strategygame.backend.worlds.edge.DeleteGame
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectFromGame
import io.github.smiley4.strategygame.backend.worlds.edge.JoinGame
import io.github.smiley4.strategygame.backend.worlds.edge.ListGames
import io.github.smiley4.strategygame.backend.worlds.edge.RequestConnectionToGame
import io.github.smiley4.strategygame.backend.worlds.edge.TurnEnd
import io.github.smiley4.strategygame.backend.worlds.edge.TurnSubmit
import io.github.smiley4.strategygame.backend.worlds.module.core.ConnectToGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.CreateGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.DeleteGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.DisconnectAllPlayersImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.DisconnectFromGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.JoinGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.ListGamesImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.RequestConnectionToGameImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.TurnEndImpl
import io.github.smiley4.strategygame.backend.worlds.module.core.TurnSubmitImpl
import io.github.smiley4.strategygame.backend.worlds.module.persistence.CommandsByGameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.CommandsInsert
import io.github.smiley4.strategygame.backend.worlds.module.persistence.CountryInsert
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameDelete
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExistsQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExtendedQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExtendedUpdate
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameInsert
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameUpdate
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GamesByUserQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.TilesInsert
import io.github.smiley4.strategygame.backend.worlds.module.persistence.TilesQueryByGame
import io.github.smiley4.strategygame.backend.worlds.module.persistence.TilesQueryByGameAndPosition
import io.github.smiley4.strategygame.backend.worlds.module.persistence.TilesUpdate
import io.github.smiley4.strategygame.backend.worlds.module.persistence.UsersConnectedToGamesQuery
import org.koin.core.module.Module

fun Module.dependenciesWorlds() {

    // core
    single<ConnectToGame> { ConnectToGameImpl(get(), get(), get(), get(), get()) }
    single<CreateGame> { CreateGameImpl(get(), get(), get()) }
    single<DeleteGame> { DeleteGameImpl(get()) }
    single<DisconnectAllPlayers> { DisconnectAllPlayersImpl(get(), get()) }
    single<DisconnectFromGame> { DisconnectFromGameImpl(get(), get()) }
    single<JoinGame> { JoinGameImpl(get(), get(), get(), get(), get()) }
    single<ListGames> { ListGamesImpl(get()) }
    single<RequestConnectionToGame> { RequestConnectionToGameImpl(get()) }
    single<TurnEnd> { TurnEndImpl(get(), get(), get(), get(), get(), get(), get(), get()) }
    single<TurnSubmit> { TurnSubmitImpl(get(), get(), get(), get()) }

    // persistence
    single<CommandsByGameQuery> { CommandsByGameQuery(get()) }
    single<CommandsInsert> { CommandsInsert(get()) }
    single<CountryInsert> { CountryInsert(get()) }
    single<GameDelete> { GameDelete(get()) }
    single<GameExistsQuery> { GameExistsQuery(get()) }
    single<GameExtendedQuery> { GameExtendedQuery(get()) }
    single<GameExtendedUpdate> { GameExtendedUpdate(get()) }
    single<GameInsert> { GameInsert(get()) }
    single<GameQuery> { GameQuery(get()) }
    single<GamesByUserQuery> { GamesByUserQuery(get()) }
    single<GameUpdate> { GameUpdate(get()) }
    single<TilesInsert> { TilesInsert(get()) }
    single<TilesQueryByGame> { TilesQueryByGame(get()) }
    single<TilesQueryByGameAndPosition> { TilesQueryByGameAndPosition(get()) }
    single<TilesUpdate> { TilesUpdate(get()) }
    single<UsersConnectedToGamesQuery> { UsersConnectedToGamesQuery(get()) }

}


