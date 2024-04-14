package de.ruegnerlukas.strategygame.backend.common.utils


sealed class GameError : Exception {
    constructor() : super()
    constructor(cause: Throwable) : super(cause)
}