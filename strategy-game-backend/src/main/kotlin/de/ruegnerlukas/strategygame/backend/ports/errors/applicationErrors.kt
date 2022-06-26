package de.ruegnerlukas.strategygame.backend.ports.errors

sealed class ApplicationError {
	override fun toString(): String = this.javaClass.simpleName
}

object InternalApplicationError : ApplicationError()

//== Database Errors ============//

sealed class DatabaseError : ApplicationError()

object GenericDatabaseError: DatabaseError()
object EntityNotFoundError : DatabaseError()


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
object AlreadyConnectedError: ApplicationError()
object UserAlreadyPlayer: ApplicationError()
