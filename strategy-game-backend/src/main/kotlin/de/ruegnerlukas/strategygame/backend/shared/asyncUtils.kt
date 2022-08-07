package de.ruegnerlukas.strategygame.backend.shared

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.joinAll
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.coroutines.CoroutineContext

suspend fun parallel(context: CoroutineContext, actions: List<suspend () -> Unit>) {
	withContext(context) {
		actions.map { launch { it.invoke() } }.joinAll()
	}
}

suspend fun parallel(context: CoroutineContext, vararg actions: suspend () -> Unit) = parallel(context, actions.toList())

suspend fun parallelIO(vararg actions: suspend () -> Unit) = parallel(Dispatchers.IO, actions.toList())

suspend fun parallel(vararg actions: suspend () -> Unit) = parallel(Dispatchers.Default, actions.toList())
