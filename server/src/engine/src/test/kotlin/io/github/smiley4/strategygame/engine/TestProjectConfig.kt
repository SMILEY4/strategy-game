package io.github.smiley4.strategygame.engine

import com.lectra.koson.ObjectType
import io.github.smiley4.strategygame.engine.game.domain.GameNotificationService
import io.github.smiley4.strategygame.engine.game.infrastructure.WebsocketNotificationService
import io.github.smiley4.strategygame.shared.eventbus.Event
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import io.github.smiley4.strategygame.shared.eventbus.WritableEventBus
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import org.koin.core.Koin
import org.koin.dsl.koinApplication
import org.koin.dsl.module

object TestProjectConfig {

    fun testDependencies(): Koin {

        val testDependencies = module {
            val eventBus = TestEventBus()
            single<WritableEventBus> { eventBus }
            single<ReadableEventBus> { eventBus }
            val gameNotificationService = TestGameNotificationService()
            single<GameNotificationService> { gameNotificationService }
            single<TestGameNotificationService> { gameNotificationService }
        }

        return koinApplication {
            modules(
                module { dependenciesEngine() },
                testDependencies
            )
        }.koin
    }
}

class TestEventBus : ReadableEventBus, WritableEventBus {

    private val mutableEvents = MutableSharedFlow<Event>(
        replay = 0,
        extraBufferCapacity = 64,
        onBufferOverflow = BufferOverflow.SUSPEND
    )

    override val events = mutableEvents.asSharedFlow()

    override suspend fun emit(event: Event) {
        mutableEvents.emit(event)
    }
}


class TestGameNotificationService : GameNotificationService {

    private val connections = mutableListOf<Pair<GameId, UserId>>()
    private val sentGameStates = mutableListOf<Triple<GameId, UserId, ObjectType>>()

    fun connect(gameId: GameId, userId: UserId){
        connections.add(gameId to userId)
    }

    override suspend fun disconnect(gameId: GameId, userId: UserId) {
        connections.remove(gameId to userId)
    }

    override suspend fun sendGameState(gameId: GameId, userId: UserId, gameState: ObjectType) {
        sentGameStates.add(Triple(gameId, userId, gameState))
    }

    override fun getConnectedGames(userId: UserId): List<GameId> {
        return connections.filter { it.second == userId }.map { it.first }
    }

    override fun getConnectedUsers(gameId: GameId): List<UserId> {
        return connections.filter { it.first == gameId }.map { it.second }
    }

    fun getSentGameStates(): List<Triple<GameId, UserId, ObjectType>> {
        return this.sentGameStates
    }

}