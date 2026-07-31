package io.github.smiley4.strategygame.shared.eventbus

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Base class for event-driven handlers. Automatically launches [start] on the default dispatcher.
 */
abstract class DomainEventHandler {

    init {
        CoroutineScope(Dispatchers.Default).launch {
            start()
        }
    }

    /**
     * Subscribe to events and process them. Called once at startup.
     */
    abstract suspend fun start()
}