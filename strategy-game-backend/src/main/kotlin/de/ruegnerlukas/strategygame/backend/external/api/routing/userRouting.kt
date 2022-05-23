package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.ports.models.auth.LoginData
import de.ruegnerlukas.strategygame.backend.ports.models.auth.CreateUserData
import de.ruegnerlukas.strategygame.backend.ports.models.auth.AuthData
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.post
import io.ktor.server.routing.route


/**
 * configuration for user-routes
 */
fun Route.userRoutes(userIdentityService: UserIdentityService) {
	route("user") {
		post("signup") {
			call.receive<CreateUserData>().let {
				val result = userIdentityService.createUser(it.email, it.password, it.username)
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
			call.receive<LoginData>().let {
				val result = userIdentityService.authenticate(it.email, it.password)
				when {
					result.isSuccess() -> call.respond(HttpStatusCode.OK, AuthData(result.get()))
					result.isError("NOT_AUTHORIZED") -> call.respond(HttpStatusCode.Unauthorized, result.getError())
					result.isError("USER_NOT_CONFIRMED") -> call.respond(HttpStatusCode.Conflict, result.getError())
					result.isError("USER_NOT_FOUND") -> call.respond(HttpStatusCode.NotFound, result.getError())
					result.isError() -> call.respond(HttpStatusCode.InternalServerError)
				}
			}
		}
		post("refresh") {
			call.receive<String>().let {
				val result = userIdentityService.refreshAuthentication(it)
				when {
					result.isSuccess() -> call.respond(HttpStatusCode.OK, result.get())
					result.isError("NOT_AUTHORIZED") -> call.respond(HttpStatusCode.Unauthorized, result.getError())
					result.isError("USER_NOT_CONFIRMED") -> call.respond(HttpStatusCode.Conflict, result.getError())
					result.isError("USER_NOT_FOUND") -> call.respond(HttpStatusCode.NotFound, result.getError())
					result.isError() -> call.respond(HttpStatusCode.InternalServerError)
				}
			}
		}
		authenticate {
			delete("delete") {
				call.receive<LoginData>().let {
					val result = userIdentityService.deleteUser(it.email, it.password)
					when {
						result.isSuccess() -> call.respond(HttpStatusCode.OK)
						result.isError("NOT_AUTHORIZED") -> call.respond(HttpStatusCode.Unauthorized)
						result.isError() -> call.respond(HttpStatusCode.InternalServerError)
					}
				}
			}
		}
	}
}