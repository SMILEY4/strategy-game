package io.github.smiley4.strategygame.backend.sessions

import io.github.smiley4.ktoropenapi.route
import io.github.smiley4.ktorplus.WebSocketContext
import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.DatabaseProvider
import io.github.smiley4.strategygame.backend.sessions.connect.GameConnect
import io.github.smiley4.strategygame.backend.sessions.connect.GameDbQuery
import io.github.smiley4.strategygame.backend.sessions.connect.GameDbStateQuery
import io.github.smiley4.strategygame.backend.sessions.connect.GameDbUpdate
import io.github.smiley4.strategygame.backend.sessions.create.GameCreate
import io.github.smiley4.strategygame.backend.sessions.create.GameDbInsert
import io.github.smiley4.strategygame.backend.sessions.create.GameDbStateUpdate
import io.github.smiley4.strategygame.backend.sessions.create.routeGameCreate
import io.github.smiley4.strategygame.backend.sessions.delete.GameDbDelete
import io.github.smiley4.strategygame.backend.sessions.delete.GameDelete
import io.github.smiley4.strategygame.backend.sessions.delete.routeGameDelete
import io.github.smiley4.strategygame.backend.sessions.events.GameEventProducer
import io.github.smiley4.strategygame.backend.sessions.events.models.GameEventConnection
import io.github.smiley4.strategygame.backend.sessions.events.models.GameEventServerMessage
import io.github.smiley4.strategygame.backend.sessions.events.routeGameEvents
import io.github.smiley4.strategygame.backend.sessions.eventstoken.routeGameEventsToken
import io.github.smiley4.strategygame.backend.sessions.infrastructure.GameDbCommandsInsertImpl
import io.github.smiley4.strategygame.backend.sessions.infrastructure.GameDbCommandsQueryImpl
import io.github.smiley4.strategygame.backend.sessions.infrastructure.GameDbDeleteImpl
import io.github.smiley4.strategygame.backend.sessions.infrastructure.GameDbInsertImpl
import io.github.smiley4.strategygame.backend.sessions.infrastructure.GameDbQueryByUserImpl
import io.github.smiley4.strategygame.backend.sessions.infrastructure.GameDbQueryImpl
import io.github.smiley4.strategygame.backend.sessions.infrastructure.GameDbStateQueryImpl
import io.github.smiley4.strategygame.backend.sessions.infrastructure.GameDbStateUpdateImpl
import io.github.smiley4.strategygame.backend.sessions.infrastructure.GameDbUpdateImpl
import io.github.smiley4.strategygame.backend.sessions.join.GameJoin
import io.github.smiley4.strategygame.backend.sessions.join.routeGameJoin
import io.github.smiley4.strategygame.backend.sessions.list.GamesList
import io.github.smiley4.strategygame.backend.sessions.list.routeGamesList
import io.github.smiley4.strategygame.backend.sessions.services.GameServices
import io.github.smiley4.strategygame.backend.sessions.services.routeGameMovementAvailablePositions
import io.github.smiley4.strategygame.backend.sessions.services.routeGameSettlementName
import io.github.smiley4.strategygame.backend.sessions.turnend.GameDbCommandsQuery
import io.github.smiley4.strategygame.backend.sessions.turnend.GameTurnEnd
import io.github.smiley4.strategygame.backend.sessions.turnsubmit.GameDbCommandsInsert
import io.github.smiley4.strategygame.backend.sessions.turnsubmit.GameTurnSubmit
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import kotlinx.coroutines.runBlocking
import org.koin.core.module.Module
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import kotlin.time.Duration.Companion.seconds

fun Module.dependenciesSessions() {

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

    // websocket
    single<WebSocketContext<GameEventConnection, GameEventServerMessage>> { WebSocketContext.create<GameEventConnection, GameEventServerMessage>() }

    // events
    single<GameEventProducer> { GameEventProducer(get()) }

    // connect
    single<GameConnect> { GameConnect(get(), get(), get()) }
    single<GameDbQuery> { GameDbQueryImpl(get()) }
    single<GameDbStateQuery> { GameDbStateQueryImpl(get()) }
    single<GameDbUpdate> { GameDbUpdateImpl(get()) }

    // create
    single<GameCreate> { GameCreate(get(), get(), get()) }
    single<GameDbInsert> { GameDbInsertImpl(get()) }
    single<GameDbStateUpdate> { GameDbStateUpdateImpl(get()) }

    //  delete
    single<GameDelete> { GameDelete(get()) }
    single<GameDbDelete> { GameDbDeleteImpl(get()) }

    // join
    single<GameJoin> { GameJoin(get(), get(), get(), get(), get()) }
    single<io.github.smiley4.strategygame.backend.sessions.join.GameDbQuery> { GameDbQueryImpl(get()) }
    single<io.github.smiley4.strategygame.backend.sessions.join.GameDbStateQuery> { GameDbStateQueryImpl(get()) }
    single<io.github.smiley4.strategygame.backend.sessions.join.GameDbStateUpdate> { GameDbStateUpdateImpl(get()) }
    single<io.github.smiley4.strategygame.backend.sessions.join.GameDbUpdate> { GameDbUpdateImpl(get()) }

    // list
    single<GamesList> { GamesList(get()) }
    single<io.github.smiley4.strategygame.backend.sessions.list.GameDbQueryByUser> { GameDbQueryByUserImpl(get()) }

    // services
    single<GameServices> { GameServices(get(), get(), get()) }
    single<io.github.smiley4.strategygame.backend.sessions.services.GameDbStateQuery> { GameDbStateQueryImpl(get()) }

    // turn end
    single<GameTurnEnd> { GameTurnEnd(get(), get(), get(), get(), get(), get(), get(), get()) }
    single<GameDbCommandsQuery> { GameDbCommandsQueryImpl(get()) }
    single<io.github.smiley4.strategygame.backend.sessions.turnend.GameDbQuery> { GameDbQueryImpl(get()) }
    single<io.github.smiley4.strategygame.backend.sessions.turnend.GameDbStateQuery> { GameDbStateQueryImpl(get()) }
    single<io.github.smiley4.strategygame.backend.sessions.turnend.GameDbStateUpdate> { GameDbStateUpdateImpl(get()) }
    single<io.github.smiley4.strategygame.backend.sessions.turnend.GameDbUpdate> { GameDbUpdateImpl(get()) }

    // turn submit
    single<GameTurnSubmit> { GameTurnSubmit(get(), get(), get(), get()) }
    single<GameDbCommandsInsert> { GameDbCommandsInsertImpl(get()) }
    single<io.github.smiley4.strategygame.backend.sessions.turnsubmit.GameDbQuery> { GameDbQueryImpl(get()) }
    single<io.github.smiley4.strategygame.backend.sessions.turnsubmit.GameDbUpdate> { GameDbUpdateImpl(get()) }
}


fun Route.routingGameSessions() {
    route("session", {
        tags("session")
    }) {
        authenticate("user") {
            routeGameEventsToken()
            routeGameCreate()
            routeGameJoin()
            routeGamesList()
            routeGameDelete()
        }
        authenticate("game-events") {
            routeGameEvents()
        }
    }
    route("game", {
        tags("game")
    }) {
        authenticate("user") {
            route("movement") {
                routeGameMovementAvailablePositions()
            }
            route("settlement") {
                routeGameSettlementName()
            }
        }
    }
}
