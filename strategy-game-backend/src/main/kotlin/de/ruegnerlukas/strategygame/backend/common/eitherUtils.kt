package de.ruegnerlukas.strategygame.backend.common

import arrow.core.Either
import arrow.core.getOrHandle
import arrow.core.left

typealias Err<T> = Either.Left<T>
fun <A> A.err(): Either<A, Nothing> = Either.Left(this)

typealias Ok<T> = Either.Right<T>
fun <A> A.ok(): Either<Nothing, A> = Either.Right(this)

fun <L, R> Either<L, R>.getOrThrow() =
	this.getOrHandle { throw Exception("Cannot get value of either with error (${this.left()})") }
