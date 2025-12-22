package io.github.smiley4.strategygame.backend.users.create

import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.users.ErrorResponse
import io.github.smiley4.strategygame.backend.users.create.CreateUserData
import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import org.koin.ktor.ext.inject


private object CodeDeliveryFailedResponse : ErrorResponse(
    status = 409,
    title = "Code delivery failed",
    errorCode = "CODE_DELIVERY_FAILED",
    detail = "Verification code could not be delivered to provided email.",
)

private object InvalidEmailOrPasswordResponse : ErrorResponse(
    status = 409,
    title = "Invalid email or password",
    errorCode = "INVALID_EMAIL_OR_PASSWORD",
    detail = "Provided email or password is invalid.",
)

private object UserAlreadyExistsResponse : ErrorResponse(
    status = 409,
    title = "User already exists",
    errorCode = "USER_ALREADY_EXISTS",
    detail = "User with the given email already exists.",
)

fun Route.routeUserCreate(): Route {
    val userCreate by inject<UserCreate>()
    return post("signup") {
        withLoggingContextAsync(mdcTraceId()) {
            call.receive<CreateUserData>().let { requestData ->
                try {
                    userCreate.create(requestData.email, requestData.password, requestData.username)
                    call.respond(HttpStatusCode.OK, Unit)
                } catch (e: UserCreateError) {
                    when (e) {
                        is UserCreateError.CodeDeliveryError -> call.respond(CodeDeliveryFailedResponse)
                        is UserCreateError.InvalidEmailOrPasswordError -> call.respond(InvalidEmailOrPasswordResponse)
                        is UserCreateError.UserAlreadyExistsError -> call.respond(UserAlreadyExistsResponse)
                    }
                }
            }
        }
    }
}