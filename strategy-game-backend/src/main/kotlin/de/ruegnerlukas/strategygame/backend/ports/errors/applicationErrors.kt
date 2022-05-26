package de.ruegnerlukas.strategygame.backend.ports.errors

sealed class ApplicationError {
	override fun toString(): String = this.javaClass.simpleName
}

object InternalApplicationError : ApplicationError()

//== Database Errors ============//

object EntityNotFoundError : ApplicationError()

//== User Errors ================//

sealed class UserApplicationError: ApplicationError()

object UserAlreadyExistsError: UserApplicationError()
object InvalidEmailOrPasswordError: UserApplicationError()
object CodeDeliveryError: UserApplicationError()
object NotAuthorizedError: UserApplicationError()
object UserNotConfirmedError: UserApplicationError()
object UserNotFoundError: UserApplicationError()


//== Game Errors ================//

object GameNotFoundError : ApplicationError()
object NotParticipantError : ApplicationError()
