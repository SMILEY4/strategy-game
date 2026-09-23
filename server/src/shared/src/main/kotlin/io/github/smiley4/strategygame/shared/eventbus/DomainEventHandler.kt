package io.github.smiley4.strategygame.shared.eventbus

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Base class for event-driven handlers.
 */
abstract class DomainEventHandler {

    /**
     * Launch the handler after the subclass has initialized its dependencies.
     * Calling an overridable method from this base class constructor would run it too early.
     */
    protected fun launch() {
        CoroutineScope(Dispatchers.Default).launch {
            start()
        }
    }

    /**
     * Subscribe to events and process them. Called once at startup.
     */
    abstract suspend fun start()
}
