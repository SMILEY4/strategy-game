package de.ruegnerlukas.strategygame.backend.shared

import kotlinx.coroutines.slf4j.MDCContext
import kotlinx.coroutines.withContext
import mu.withLoggingContext

suspend fun <T> withLoggingContextAsync(vararg pair: Pair<String, String>, body: suspend () -> T): T {
    return withLoggingContext(pair.toMap()) {
        withContext(MDCContext()) {
            body()
        }
    }
}
