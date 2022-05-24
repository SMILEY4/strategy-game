package de.ruegnerlukas.strategygame.backend.ports.errors

sealed class ApplicationError {
	override fun toString(): String = this.javaClass.simpleName
}

//== Database Errors ============//

object EntityNotFoundError : ApplicationError()
object DbWriteError : ApplicationError()

//== Game Errors ================//

object GameNotFoundError : ApplicationError()
object NotParticipantError : ApplicationError()
