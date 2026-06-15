package io.github.smiley4.strategygame.engine

import io.github.smiley4.strategygame.engine.gameplay.GameplayEngine
import io.github.smiley4.strategygame.shared.eventbus.Event
import io.github.smiley4.strategygame.shared.eventbus.ReadableEventBus
import io.github.smiley4.strategygame.shared.eventbus.WritableEventBus
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import io.mockk.mockk
import org.koin.core.Koin
import org.koin.dsl.koinApplication
import org.koin.dsl.module

object TestProjectConfig {

    fun testDependencies(): Koin {

        val testDependencies = module {
            single<GameplayEngine> { mockk<GameplayEngine>(relaxed = true) }

            val eventBus = TestEventBus()
            single<WritableEventBus> { eventBus }
            single<ReadableEventBus> { eventBus }
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
