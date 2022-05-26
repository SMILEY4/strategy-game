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
import de.ruegnerlukas.strategygame.backend.shared.onError
import de.ruegnerlukas.strategygame.backend.shared.onSuccess
import de.ruegnerlukas.strategygame.backend.shared.recover
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
					.onSuccess { call.respond(HttpStatusCode.OK) }
					.recover(UserAlreadyExistsError) { call.respond(HttpStatusCode.Conflict, it.toString()) }
					.recover(InvalidEmailOrPasswordError) { call.respond(HttpStatusCode.Conflict, it.toString()) }
					.recover(CodeDeliveryError) { call.respond(HttpStatusCode.Conflict, it.toString()) }
					.onError { call.respond(HttpStatusCode.InternalServerError) }
			}
		}
		post("login") {
			call.receive<LoginData>().let { requestData ->
				userIdentityService.authenticate(requestData.email, requestData.password)
					.onSuccess { call.respond(HttpStatusCode.OK, AuthData(it)) }
					.recover(NotAuthorizedError) { call.respond(HttpStatusCode.Unauthorized, it.toString()) }
					.recover(UserNotConfirmedError) { call.respond(HttpStatusCode.Conflict, it.toString()) }
					.recover(UserNotFoundError) { call.respond(HttpStatusCode.NotFound, it.toString()) }
					.onError { call.respond(HttpStatusCode.InternalServerError) }
			}
		}
		post("refresh") {
			call.receive<String>().let { requestData ->
				userIdentityService.refreshAuthentication(requestData)
					.onSuccess { call.respond(HttpStatusCode.OK, it) }
					.recover(NotAuthorizedError) { call.respond(HttpStatusCode.Unauthorized, it.toString()) }
					.recover(UserNotConfirmedError) { call.respond(HttpStatusCode.Conflict, it.toString()) }
					.recover(UserNotFoundError) { call.respond(HttpStatusCode.NotFound, it.toString()) }
					.onError { call.respond(HttpStatusCode.InternalServerError) }
			}
		}
		authenticate {
			delete("delete") {
				call.receive<LoginData>().let { requestData ->
					userIdentityService.deleteUser(requestData.email, requestData.password)
						.onSuccess { call.respond(HttpStatusCode.OK, it) }
						.recover(NotAuthorizedError) { call.respond(HttpStatusCode.Unauthorized, it.toString()) }
						.onError { call.respond(HttpStatusCode.InternalServerError) }
				}
			}
		}
	}
}