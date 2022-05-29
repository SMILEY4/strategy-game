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
import de.ruegnerlukas.strategygame.backend.shared.either.map
import de.ruegnerlukas.strategygame.backend.shared.either.respondCallErr
import de.ruegnerlukas.strategygame.backend.shared.either.respondCallOk
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
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
					.respondCallOk(call, HttpStatusCode.OK)
					.respondCallErr(call, UserAlreadyExistsError, HttpStatusCode.Conflict)
					.respondCallErr(call, InvalidEmailOrPasswordError, HttpStatusCode.Conflict)
					.respondCallErr(call, CodeDeliveryError, HttpStatusCode.Conflict)
					.respondCallErr(call, HttpStatusCode.InternalServerError)
			}
		}
		post("login") {
			call.receive<LoginData>().let { requestData ->
				userIdentityService.authenticate(requestData.email, requestData.password)
					.map { AuthData(it) }
					.respondCallOk(call, HttpStatusCode.OK)
					.respondCallErr(call, NotAuthorizedError, HttpStatusCode.Unauthorized)
					.respondCallErr(call, UserNotConfirmedError, HttpStatusCode.Conflict)
					.respondCallErr(call, UserNotFoundError, HttpStatusCode.NotFound)
					.respondCallErr(call, HttpStatusCode.InternalServerError)
			}
		}
		post("refresh") {
			call.receive<String>().let { requestData ->
				userIdentityService.refreshAuthentication(requestData)
					.respondCallOk(call, HttpStatusCode.OK)
					.respondCallErr(call, NotAuthorizedError, HttpStatusCode.Unauthorized)
					.respondCallErr(call, UserNotConfirmedError, HttpStatusCode.Conflict)
					.respondCallErr(call, UserNotFoundError, HttpStatusCode.NotFound)
					.respondCallErr(call, HttpStatusCode.InternalServerError)
			}
		}
		authenticate {
			delete("delete") {
				call.receive<LoginData>().let { requestData ->
					userIdentityService.deleteUser(requestData.email, requestData.password)
						.respondCallOk(call, HttpStatusCode.OK)
						.respondCallErr(call, NotAuthorizedError, HttpStatusCode.Unauthorized)
						.respondCallErr(call, HttpStatusCode.InternalServerError)
				}
			}
		}
	}
}