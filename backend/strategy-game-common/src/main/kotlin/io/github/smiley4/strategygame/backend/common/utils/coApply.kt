package io.github.smiley4.strategygame.backend.common.utils

suspend fun <T> T.coApply(block: suspend T.() -> Unit): T {
    block()
    return this
}