package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.external.api.models.AuthData
import de.ruegnerlukas.strategygame.backend.external.api.models.CreateUserData
import de.ruegnerlukas.strategygame.backend.external.api.models.UserConfirmationData
import de.ruegnerlukas.strategygame.backend.external.awscognito.AwsCognito
import de.ruegnerlukas.strategygame.backend.ports.models.AuthResult
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route


/**
 * configuration for user-actions
 */
fun Route.userRoutes(cognito: AwsCognito) {
	route("user") {
		post("signup") {
			call.receive<CreateUserData>().let {
				val result = cognito.createUser(it.email, it.password, it.username)
				when {
					result.isSuccess() -> call.respond(HttpStatusCode.OK)
					result.isError("USER_EXISTS") -> call.respond(HttpStatusCode.Conflict, result.getError())
					result.isError("INVALID_EMAIL_OR_PASSWORD") -> call.respond(HttpStatusCode.BadRequest, result.getError())
					result.isError("CODE_DELIVERY_FAILURE") -> call.respond(HttpStatusCode.BadRequest, result.getError())
					result.isError() -> call.respond(HttpStatusCode.InternalServerError)
				}
			}
		}
		post("login") {
			call.receive<AuthData>().let {
				val result = cognito.authenticate(it.email, it.password)
				when {
					result.isSuccess() -> call.respond(HttpStatusCode.OK, AuthResult(result.getOrThrow()))
					result.isError("NOT_AUTHORIZED") -> call.respond(HttpStatusCode.Unauthorized, result.getError())
					result.isError("USER_NOT_CONFIRMED") -> call.respond(HttpStatusCode.Conflict, result.getError())
					result.isError("USER_NOT_FOUND") -> call.respond(HttpStatusCode.NotFound, result.getError())
					result.isError() -> call.respond(HttpStatusCode.InternalServerError)
				}
			}
		}
		post("refresh") {
			call.receive<String>().let {
				val result = cognito.refreshAuthentication(it)
				when {
					result.isSuccess() -> call.respond(HttpStatusCode.OK, result.getOrThrow())
					result.isError("NOT_AUTHORIZED") -> call.respond(HttpStatusCode.Unauthorized, result.getError())
					result.isError("USER_NOT_CONFIRMED") -> call.respond(HttpStatusCode.Conflict, result.getError())
					result.isError("USER_NOT_FOUND") -> call.respond(HttpStatusCode.NotFound, result.getError())
					result.isError() -> call.respond(HttpStatusCode.InternalServerError)
				}
			}
		}
		authenticate {
			delete("delete") {
				call.receive<AuthData>().let {
					val result = cognito.deleteUser(it.email, it.password)
					when {
						result.isSuccess() -> call.respond(HttpStatusCode.OK)
						result.isError("NOT_AUTHORIZED") -> call.respond(HttpStatusCode.Unauthorized)
						result.isError() -> call.respond(HttpStatusCode.InternalServerError)
					}
				}
			}
			get("protected") {
				// temporary test route
				val principal = call.principal<JWTPrincipal>()
				val userId = principal!!.payload.getClaim("sub").asString()
				val expiresAt = principal.expiresAt?.time?.minus(System.currentTimeMillis())
				call.respondText("Hello, $userId! Token is expired at $expiresAt ms.")
			}
		}
	}
}