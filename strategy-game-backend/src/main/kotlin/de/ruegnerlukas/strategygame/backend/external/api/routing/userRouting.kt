package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.ports.errors.CodeDeliveryError
import de.ruegnerlukas.strategygame.backend.ports.errors.InvalidEmailOrPasswordError
import de.ruegnerlukas.strategygame.backend.ports.errors.NotAuthorizedError
import de.ruegnerlukas.strategygame.backend.ports.errors.UserAlreadyExistsError
import de.ruegnerlukas.strategygame.backend.ports.errors.UserNotConfirmedError
import de.ruegnerlukas.strategygame.backend.ports.errors.UserNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.auth.AuthData
import de.ruegnerlukas.strategygame.backend.ports.models.auth.CreateUserData
import de.ruegnerlukas.strategygame.backend.ports.models.auth.LoginData
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
			call.receive<CreateUserData>().let { requestData ->
				userIdentityService.createUser(requestData.email, requestData.password, requestData.username)
					.fold(
						{ e ->
							when (e) {
								is UserAlreadyExistsError -> call.respond(HttpStatusCode.Conflict, e.toString())
								is InvalidEmailOrPasswordError -> call.respond(HttpStatusCode.Conflict, e.toString())
								is CodeDeliveryError -> call.respond(HttpStatusCode.Conflict, e.toString())
								else -> call.respond(HttpStatusCode.InternalServerError, e.toString())
							}
						},
						{ call.respond(HttpStatusCode.OK, it) }
					)
			}
		}
		post("login") {
			call.receive<LoginData>().let { requestData ->
				userIdentityService.authenticate(requestData.email, requestData.password)
					.map { AuthData(it) }
					.fold(
						{ e ->
							when (e) {
								is NotAuthorizedError -> call.respond(HttpStatusCode.Unauthorized, e.toString())
								is UserNotConfirmedError -> call.respond(HttpStatusCode.Conflict, e.toString())
								is UserNotFoundError -> call.respond(HttpStatusCode.NotFound, e.toString())
								else -> call.respond(HttpStatusCode.InternalServerError, e.toString())
							}
						},
						{ call.respond(HttpStatusCode.OK, it) }
					)
			}
		}
		post("refresh") {
			call.receive<String>().let { requestData ->
				userIdentityService.refreshAuthentication(requestData)
					.fold(
						{ e ->
							when (e) {
								is NotAuthorizedError -> call.respond(HttpStatusCode.Unauthorized, e.toString())
								is UserNotConfirmedError -> call.respond(HttpStatusCode.Conflict, e.toString())
								is UserNotFoundError -> call.respond(HttpStatusCode.NotFound, e.toString())
								else -> call.respond(HttpStatusCode.InternalServerError, e.toString())
							}
						},
						{ call.respond(HttpStatusCode.OK, it) }
					)
			}
		}
		authenticate {
			delete("delete") {
				call.receive<LoginData>().let { requestData ->
					userIdentityService.deleteUser(requestData.email, requestData.password)
						.fold(
							{ e ->
								when (e) {
									is NotAuthorizedError -> call.respond(HttpStatusCode.Unauthorized, e.toString())
									else -> call.respond(HttpStatusCode.InternalServerError, e.toString())
								}
							},
							{ call.respond(HttpStatusCode.OK, it) }
						)
				}
			}
		}
	}
}