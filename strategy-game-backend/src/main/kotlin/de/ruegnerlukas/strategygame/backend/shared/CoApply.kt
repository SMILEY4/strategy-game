package de.ruegnerlukas.strategygame.backend.shared

suspend fun <T> T.coApply(block: suspend T.() -> Unit): T {
    block()
    return this
}