package io.github.smiley4.strategygame.backend.common.utils


sealed class GameError : Exception {
    constructor() : super()
    constructor(cause: Throwable) : super(cause)
}