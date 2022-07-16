package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.auth.AuthData
import de.ruegnerlukas.strategygame.backend.ports.models.auth.CreateUserData
import de.ruegnerlukas.strategygame.backend.ports.models.auth.LoginData
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.CodeDeliveryError
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.InvalidEmailOrPasswordError
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.NotAuthorizedError
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.UserAlreadyExistsError
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.UserNotConfirmedError
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.UserNotFoundError
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
			call.receive<CreateUserData>().let { requestData ->
				val result = userIdentityService.createUser(requestData.email, requestData.password, requestData.username)
				when (result) {
					is Either.Right -> call.respond(HttpStatusCode.OK, result.value)
					is Either.Left -> when (result.value) {
						CodeDeliveryError -> call.respond(HttpStatusCode.Conflict, result.value)
						InvalidEmailOrPasswordError -> call.respond(HttpStatusCode.Conflict, result.value)
						UserAlreadyExistsError -> call.respond(HttpStatusCode.Conflict, result.value)
					}
				}
			}
		}
		post("login") {
			call.receive<LoginData>().let { requestData ->
				val result = userIdentityService.authenticate(requestData.email, requestData.password)
				when (result) {
					is Either.Right -> call.respond(HttpStatusCode.OK, AuthData(result.value))
					is Either.Left -> when (result.value) {
						NotAuthorizedError -> call.respond(HttpStatusCode.Unauthorized, result.value)
						UserNotConfirmedError -> call.respond(HttpStatusCode.Conflict, result.value)
						UserNotFoundError -> call.respond(HttpStatusCode.NotFound, result.value)
					}
				}
			}
		}
		post("refresh") {
			call.receive<String>().let { requestData ->
				val result = userIdentityService.refreshAuthentication(requestData)
				when (result) {
					is Either.Right -> call.respond(HttpStatusCode.OK, result.value)
					is Either.Left -> when (result.value) {
						NotAuthorizedError -> call.respond(HttpStatusCode.Unauthorized, result.value)
						UserNotConfirmedError -> call.respond(HttpStatusCode.Conflict, result.value)
						UserNotFoundError -> call.respond(HttpStatusCode.NotFound, result.value)
					}
				}
			}
		}
		authenticate {
			delete("delete") {
				call.receive<LoginData>().let { requestData ->
					val result = userIdentityService.deleteUser(requestData.email, requestData.password)
					when (result) {
						is Either.Right -> call.respond(HttpStatusCode.OK, result.value)
						is Either.Left -> when (result.value) {
							NotAuthorizedError -> call.respond(HttpStatusCode.Unauthorized, result.value)
						}
					}
				}
			}
		}
	}
}