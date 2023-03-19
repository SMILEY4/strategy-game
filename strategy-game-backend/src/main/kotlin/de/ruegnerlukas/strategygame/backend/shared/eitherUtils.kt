package de.ruegnerlukas.strategygame.backend.shared

import arrow.core.Either
import arrow.core.getOrHandle
import arrow.core.left

fun <L, R> Either<L, R>.getOrThrow() =
	this.getOrHandle { throw Exception("Cannot get value of either with error (${this.left()})") }