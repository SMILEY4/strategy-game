package io.github.smiley4.strategygame.backend.worlds

import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring
import io.github.smiley4.strategygame.backend.common.monitoring.MonitoringService
import io.github.smiley4.strategygame.backend.common.monitoring.NoOpMonitoringService
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DatabaseProvider
import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.MoveCommandData
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.GameMeta
import io.github.smiley4.strategygame.backend.commondata.PlaceMarkerCommandData
import io.github.smiley4.strategygame.backend.commondata.PlayerState
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.commondata.TileContainer
import io.github.smiley4.strategygame.backend.commondata.tracking
import io.github.smiley4.strategygame.backend.engine.edge.GameStep
import io.github.smiley4.strategygame.backend.engine.edge.InitializePlayer
import io.github.smiley4.strategygame.backend.engine.edge.InitializeWorld
import io.github.smiley4.strategygame.backend.playerpov.edge.PlayerViewCreator
import io.github.smiley4.strategygame.backend.worlds.edge.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.edge.CreateGame
import io.github.smiley4.strategygame.backend.worlds.edge.DeleteGame
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectPlayer
import io.github.smiley4.strategygame.backend.worlds.edge.GameMessageProducer
import io.github.smiley4.strategygame.backend.worlds.edge.JoinGame
import io.github.smiley4.strategygame.backend.worlds.edge.ListGames
import io.github.smiley4.strategygame.backend.worlds.edge.RequestConnectionToGame
import io.github.smiley4.strategygame.backend.worlds.edge.TurnSubmit
import io.github.smiley4.strategygame.backend.worlds.module.persistence.CommandsByGameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExistsQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameQuery
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.longs.shouldBeGreaterThan
import io.kotest.matchers.shouldBe
import io.mockk.clearMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import org.koin.core.Koin
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import kotlin.time.Duration.Companion.seconds

class WorldsTest : FreeSpec({

    beforeEach {
        val koin = createKoin()
        val dbConfig = koin.get<DatabaseProvider.Config>()
        ArangoDatabase.delete(dbConfig.host, dbConfig.port, dbConfig.username, dbConfig.password, dbConfig.name)
    }
    afterEach {
        val koin = createKoin()
        val dbConfig = koin.get<DatabaseProvider.Config>()
        ArangoDatabase.delete(dbConfig.host, dbConfig.port, dbConfig.username, dbConfig.password, dbConfig.name)
    }

    "create" - {

        "valid game, expect persisted game data" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()

            val gameId = createGame.perform("test-game", null)

            coVerify(exactly = 1) { koin.get<InitializeWorld>().perform(any(), any()) }

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.gameId shouldBe gameId
                game.name shouldBe "test-game"
                game.creationTimestamp shouldBeGreaterThan 0
                game.turn shouldBe 0
                game.players shouldHaveSize 0
            }
        }
    }


    "delete" - {

        "existing game, expect deleted" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val deleteGame = koin.get<DeleteGame>()

            val gameId1 = createGame.perform("test-game-1", null)
            val gameId2 = createGame.perform("test-game-2", null)

            deleteGame.perform(gameId1)

            koin.get<GameExistsQuery>().perform(gameId1) shouldBe false
            koin.get<GameExistsQuery>().perform(gameId2) shouldBe true
        }

        "not existing game, expect no change" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val deleteGame = koin.get<DeleteGame>()

            val gameId1 = createGame.perform("test-game-1", null)
            val gameId2 = createGame.perform("test-game-2", null)

            deleteGame.perform("different-game")

            koin.get<GameExistsQuery>().perform(gameId1) shouldBe true
            koin.get<GameExistsQuery>().perform(gameId2) shouldBe true
        }

    }

    "join" - {

        "valid game, expect no error and updated state" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()

            val gameId = createGame.perform("test-game", null)

            joinGame.perform("test-user", gameId)

            coVerify(exactly = 1) { koin.get<InitializePlayer>().perform(any(), any(), any()) }

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.players shouldHaveSize 1
                game.players.first().also { player ->
                    player.userId shouldBe "test-user"
                    player.connectionId shouldBe null
                    player.state shouldBe PlayerState.PLAYING
                }
            }
        }

        "not existing game, expect error" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()

            val gameId = createGame.perform("test-game", null)

            shouldThrow<JoinGame.GameNotFoundError> {
                joinGame.perform("test-user", "different-$gameId")
            }

            coVerify(exactly = 0) { koin.get<InitializePlayer>().perform(any(), any(), any()) }
        }

        "game with user already a player, expect error and no change" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()

            val gameId = createGame.perform("test-game", null)
            joinGame.perform("test-user", gameId)

            shouldThrow<JoinGame.UserAlreadyJoinedError> {
                joinGame.perform("test-user", gameId)
            }

            coVerify(exactly = 1) { koin.get<InitializePlayer>().perform(any(), any(), any()) }

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.players shouldHaveSize 1
                game.players.first().also { player ->
                    player.userId shouldBe "test-user"
                    player.connectionId shouldBe null
                    player.state shouldBe PlayerState.PLAYING
                }
            }
        }

    }


    "request connection" - {

        "valid request, expect no error" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val requestConnection = koin.get<RequestConnectionToGame>()

            val gameId = createGame.perform("test-game", null)
            joinGame.perform("test-user", gameId)

            requestConnection.perform("test-user", gameId)
        }

        "game does not exist, expect error" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val requestConnection = koin.get<RequestConnectionToGame>()

            val gameId = createGame.perform("test-game", null)
            joinGame.perform("test-user", gameId)

            shouldThrow<RequestConnectionToGame.GameNotFoundError> {
                requestConnection.perform("test-user", "different-$gameId")
            }
        }

        "game where user is not a player, expect error" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val requestConnection = koin.get<RequestConnectionToGame>()

            val gameId = createGame.perform("test-game", null)

            shouldThrow<RequestConnectionToGame.NotParticipantError> {
                requestConnection.perform("test-user", gameId)
            }
        }

        "game where user is already connected to, expect error" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val connectGame = koin.get<ConnectToGame>()
            val requestConnection = koin.get<RequestConnectionToGame>()

            val gameId = createGame.perform("test-game", null)
            joinGame.perform("test-user", gameId)
            connectGame.perform("test-user", gameId, 1)

            shouldThrow<RequestConnectionToGame.AlreadyConnectedError> {
                requestConnection.perform("test-user", gameId)
            }
        }

    }

    "connect" - {

        "valid connection, expect updated player state" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val connectGame = koin.get<ConnectToGame>()

            val gameId = createGame.perform("test-game", null)
            joinGame.perform("test-user", gameId)

            connectGame.perform("test-user", gameId, 42)

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.players shouldHaveSize 1
                game.players.first().also { player ->
                    player.userId shouldBe "test-user"
                    player.connectionId shouldBe 42
                    player.state shouldBe PlayerState.PLAYING
                }
            }

            coVerify(exactly = 1) { koin.get<GameMessageProducer>().sendGameState(eq(42), any()) }
        }

    }

    "disconnect" - {

        "all players, expect updated state" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val connectGame = koin.get<ConnectToGame>()
            val disconnectAll = koin.get<DisconnectAllPlayers>()

            val gameId = createGame.perform("test-game", null)

            joinGame.perform("test-user-1", gameId)
            connectGame.perform("test-user-1", gameId, 42)

            joinGame.perform("test-user-2", gameId)
            connectGame.perform("test-user-2", gameId, 43)

            disconnectAll.perform()

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.players shouldHaveSize 2
                game.players.find { it.userId == "test-user-1" }!!.also { player ->
                    player.connectionId shouldBe null
                }
                game.players.find { it.userId == "test-user-2" }!!.also { player ->
                    player.connectionId shouldBe null
                }
            }
        }

        "player from games, expect updated state" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val connectGame = koin.get<ConnectToGame>()
            val disconnectPlayer = koin.get<DisconnectPlayer>()

            val gameId = createGame.perform("test-game", null)

            joinGame.perform("test-user-1", gameId)
            connectGame.perform("test-user-1", gameId, 42)

            joinGame.perform("test-user-2", gameId)
            connectGame.perform("test-user-2", gameId, 43)

            disconnectPlayer.perform("test-user-1")

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.players shouldHaveSize 2
                game.players.find { it.userId == "test-user-1" }!!.also { player ->
                    player.connectionId shouldBe null
                }
                game.players.find { it.userId == "test-user-2" }!!.also { player ->
                    player.connectionId shouldBe 43
                }
            }
        }

        "not existing player, expect no change" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val connectGame = koin.get<ConnectToGame>()
            val disconnectPlayer = koin.get<DisconnectPlayer>()

            val gameId = createGame.perform("test-game", null)
            joinGame.perform("test-user", gameId)
            connectGame.perform("test-user", gameId, 42)

            disconnectPlayer.perform("different-test-user")

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.players shouldHaveSize 1
                game.players.find { it.userId == "test-user" }!!.also { player ->
                    player.connectionId shouldBe 42
                }
            }
        }

    }

    "list games" - {

        "existing player, expect correct list" - {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val listGames = koin.get<ListGames>()

            val gameId1 = createGame.perform("test-game-1", null)
            val gameId2 = createGame.perform("test-game-2", null)
            val gameId3 = createGame.perform("test-game-3", null)

            joinGame.perform("test-user-1", gameId1)
            joinGame.perform("test-user-1", gameId2)

            joinGame.perform("test-user-2", gameId2)
            joinGame.perform("test-user-2", gameId3)

            listGames.perform("test-user-1").also { games ->
                games shouldHaveSize 2
                games.find { it.id == gameId1 }!!.also { game ->
                    game.id shouldBe gameId1
                    game.name shouldBe "test-game-1"
                    game.creationTimestamp shouldBeGreaterThan 0
                    game.players shouldBe 1
                    game.currentTurn shouldBe 0
                }
                games.find { it.id == gameId2 }!!.also { game ->
                    game.id shouldBe gameId2
                    game.name shouldBe "test-game-2"
                    game.creationTimestamp shouldBeGreaterThan 0
                    game.players shouldBe 2
                    game.currentTurn shouldBe 0
                }
            }
        }


        "not existing player, expect no games" - {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val listGames = koin.get<ListGames>()

            val gameId = createGame.perform("test-game", null)
            joinGame.perform("test-user", gameId)

            listGames.perform("different-test-user").also { games ->
                games shouldHaveSize 0
            }
        }

    }

    "turn" - {

        "submit turn, expect saved commands and updated state" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val connectGame = koin.get<ConnectToGame>()
            val submitTurn = koin.get<TurnSubmit>()

            val gameId = createGame.perform("test-game", null)

            joinGame.perform("test-user-1", gameId)
            connectGame.perform("test-user-1", gameId, 42)

            joinGame.perform("test-user-2", gameId)
            connectGame.perform("test-user-2", gameId, 43)

            clearMocks(koin.get<GameMessageProducer>())

            submitTurn.perform(
                "test-user-1", gameId, listOf(
                    MoveCommandData(
                        q = 0,
                        r = 0,
                        name = "test-city",
                        withNewProvince = true
                    ),
                    PlaceMarkerCommandData(
                        q = 1,
                        r = 2,
                        label = "test-marker"
                    )
                )
            )

            coVerify(exactly = 0) { koin.get<GameStep>().perform(any(), any()) }
            coVerify(exactly = 0) { koin.get<GameMessageProducer>().sendGameState(eq(42), any()) }
            coVerify(exactly = 0) { koin.get<GameMessageProducer>().sendGameState(eq(43), any()) }

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.turn shouldBe 0
                game.players.find { it.userId == "test-user-1" }!!.also { player ->
                    player.state shouldBe PlayerState.SUBMITTED
                }
                game.players.find { it.userId == "test-user-2" }!!.also { player ->
                    player.state shouldBe PlayerState.PLAYING
                }
            }

            koin.get<CommandsByGameQuery>().execute(gameId, 0).also { commands ->
                commands shouldHaveSize 2
                commands.forEach { command ->
                    command.gameId shouldBe gameId
                    command.userId shouldBe "test-user-1"
                    command.turn shouldBe 0
                }
                commands.map { it.data }.filterIsInstance<MoveCommandData>() shouldHaveSize 1
                commands.map { it.data }.filterIsInstance<PlaceMarkerCommandData>() shouldHaveSize 1
            }
        }

        "submit empty turn, expect no saved commands and updated state" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val connectGame = koin.get<ConnectToGame>()
            val submitTurn = koin.get<TurnSubmit>()

            val gameId = createGame.perform("test-game", null)

            joinGame.perform("test-user-1", gameId)
            connectGame.perform("test-user-1", gameId, 42)

            joinGame.perform("test-user-2", gameId)
            connectGame.perform("test-user-2", gameId, 43)

            clearMocks(koin.get<GameMessageProducer>())

            submitTurn.perform("test-user-1", gameId, emptyList())

            coVerify(exactly = 0) { koin.get<GameStep>().perform(any(), any()) }
            coVerify(exactly = 0) { koin.get<GameMessageProducer>().sendGameState(eq(42), any()) }
            coVerify(exactly = 0) { koin.get<GameMessageProducer>().sendGameState(eq(43), any()) }

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.turn shouldBe 0
                game.players.find { it.userId == "test-user-1" }!!.also { player ->
                    player.state shouldBe PlayerState.SUBMITTED
                }
                game.players.find { it.userId == "test-user-2" }!!.also { player ->
                    player.state shouldBe PlayerState.PLAYING
                }
            }

            koin.get<CommandsByGameQuery>().execute(gameId, 0).also { commands ->
                commands shouldHaveSize 0
            }
        }

        "submit turn from all players, expect ended turn" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val connectGame = koin.get<ConnectToGame>()
            val submitTurn = koin.get<TurnSubmit>()

            val gameId = createGame.perform("test-game", null)

            joinGame.perform("test-user-1", gameId)
            connectGame.perform("test-user-1", gameId, 42)

            joinGame.perform("test-user-2", gameId)
            connectGame.perform("test-user-2", gameId, 43)

            clearMocks(koin.get<GameMessageProducer>())

            submitTurn.perform(
                "test-user-1", gameId, listOf(
                    MoveCommandData(
                        q = 0,
                        r = 0,
                        name = "test-city",
                        withNewProvince = true
                    )
                )
            )
            submitTurn.perform(
                "test-user-2", gameId, listOf(
                    PlaceMarkerCommandData(
                        q = 1,
                        r = 2,
                        label = "test-marker"
                    )
                )
            )

            coVerify(exactly = 1) { koin.get<GameStep>().perform(any(), any()) }
            coVerify(exactly = 1) { koin.get<GameMessageProducer>().sendGameState(eq(42), any()) }
            coVerify(exactly = 1) { koin.get<GameMessageProducer>().sendGameState(eq(43), any()) }

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.turn shouldBe 1
                game.players.find { it.userId == "test-user-1" }!!.also { player ->
                    player.state shouldBe PlayerState.PLAYING
                }
                game.players.find { it.userId == "test-user-2" }!!.also { player ->
                    player.state shouldBe PlayerState.PLAYING
                }
            }
        }

        "submit turn from user that is not a player, expect error and no change" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val connectGame = koin.get<ConnectToGame>()
            val submitTurn = koin.get<TurnSubmit>()

            val gameId = createGame.perform("test-game", null)
            joinGame.perform("test-user", gameId)
            connectGame.perform("test-user", gameId, 42)

            clearMocks(koin.get<GameMessageProducer>())

            shouldThrow<TurnSubmit.NotParticipantError> {
                submitTurn.perform(
                    "different-test-user", gameId, listOf(
                        PlaceMarkerCommandData(
                            q = 1,
                            r = 2,
                            label = "test-marker"
                        )
                    )
                )
            }

            coVerify(exactly = 0) { koin.get<GameMessageProducer>().sendGameState(eq(42), any()) }

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.turn shouldBe 0
                game.players.find { it.userId == "test-user" }!!.also { player ->
                    player.state shouldBe PlayerState.PLAYING
                }
            }

            koin.get<CommandsByGameQuery>().execute(gameId, 0).also { commands ->
                commands shouldHaveSize 0
            }
        }

        "submit turn for unknown game, expect error and no change" {
            val koin = createKoin()
            val createGame = koin.get<CreateGame>()
            val joinGame = koin.get<JoinGame>()
            val connectGame = koin.get<ConnectToGame>()
            val submitTurn = koin.get<TurnSubmit>()

            val gameId = createGame.perform("test-game", null)
            joinGame.perform("test-user", gameId)
            connectGame.perform("test-user", gameId, 42)

            clearMocks(koin.get<GameMessageProducer>())

            shouldThrow<TurnSubmit.GameNotFoundError> {
                submitTurn.perform(
                    "test-user", "different-$gameId", listOf(
                        PlaceMarkerCommandData(
                            q = 1,
                            r = 2,
                            label = "test-marker"
                        )
                    )
                )
            }

            coVerify(exactly = 0) { koin.get<GameMessageProducer>().sendGameState(eq(42), any()) }

            koin.get<GameQuery>().execute(gameId).also { game ->
                game.turn shouldBe 0
                game.players.find { it.userId == "test-user" }!!.also { player ->
                    player.state shouldBe PlayerState.PLAYING
                }
            }

            koin.get<CommandsByGameQuery>().execute(gameId, 0).also { commands ->
                commands shouldHaveSize 0
            }
        }

    }

}) {

    companion object {

        private fun createKoin(): Koin {
            return koinApplication {
                modules(
                    module { dependenciesWorlds() },
                    module {
                        single<DatabaseProvider.Config> {
                            DatabaseProvider.Config(
                                host = "localhost",
                                port = TestContainers.arangoDbPort ?: throw Exception("no port set for arangodb container"),
                                username = null,
                                password = null,
                                name = "strategy-game-testing",
                                retryCount = 5,
                                retryTimeout = 5.seconds
                            )
                        }
                        single<InitializeWorld> {
                            mockk<InitializeWorld>().also {
                                coEvery { it.perform(any(), any()) } answers {
                                    val game = firstArg<Game>()
                                    GameExtended(
                                        meta = GameMeta(
                                            gameId = game.gameId,
                                            turn = game.turn
                                        ),
                                        tiles = TileContainer(emptyList()),
                                        countries = emptyList<Country>().tracking(),
                                        cities = emptyList<City>().tracking(),
                                        provinces = emptyList<Province>().tracking(),
                                        routes = emptyList<Route>().tracking()
                                    )
                                }
                            }
                        }
                        single<InitializePlayer> {
                            mockk<InitializePlayer>(relaxed = true)
                        }
                        single<PlayerViewCreator> {
                            mockk<PlayerViewCreator>(relaxed = true)
                        }
                        single<GameMessageProducer> {
                            mockk<GameMessageProducer>(relaxed = true)
                        }
                        single<GameStep> {
                            mockk<GameStep>().also {
                                coEvery { it.perform(any(), any()) } answers {
                                    val game = firstArg<GameExtended>()
                                    game.meta.turn += 1
                                }
                            }
                        }
                        single<MonitoringService> {
                            NoOpMonitoringService().also {
                                Monitoring.service = it
                            }
                        } withOptions { createdAtStart() }
                    }
                )
            }.koin
        }

    }

}