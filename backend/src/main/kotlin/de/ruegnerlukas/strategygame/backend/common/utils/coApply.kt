package de.ruegnerlukas.strategygame.backend.common.utils

suspend fun <T> T.coApply(block: suspend T.() -> Unit): T {
    block()
    return this
}