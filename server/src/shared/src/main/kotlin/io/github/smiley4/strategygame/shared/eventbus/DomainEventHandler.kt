package io.github.smiley4.strategygame.shared.eventbus

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

abstract class DomainEventHandler {

    init {
        CoroutineScope(Dispatchers.Default).launch {
            start()
        }
    }

    abstract suspend fun start()
}