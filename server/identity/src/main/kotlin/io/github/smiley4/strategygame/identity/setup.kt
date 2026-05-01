package io.github.smiley4.strategygame.identity

import io.github.smiley4.ktoropenapi.route
import io.github.smiley4.strategygame.identity.auth.AuthService
import io.github.smiley4.strategygame.identity.auth.domain.AuthServiceImpl
import io.github.smiley4.strategygame.identity.auth.domain.SessionRepository
import io.github.smiley4.strategygame.identity.auth.infrastructure.InMemorySessionRepository
import io.github.smiley4.strategygame.identity.routing.routeChangePassword
import io.github.smiley4.strategygame.identity.routing.routeChangeUsername
import io.github.smiley4.strategygame.identity.routing.routeLogIn
import io.github.smiley4.strategygame.identity.routing.routeLogOut
import io.github.smiley4.strategygame.identity.routing.routeRegisterUser
import io.github.smiley4.strategygame.identity.shared.PasswordHasher
import io.github.smiley4.strategygame.identity.user.UserService
import io.github.smiley4.strategygame.identity.user.domain.UserRepository
import io.github.smiley4.strategygame.identity.user.domain.UserServiceImpl
import io.github.smiley4.strategygame.identity.user.infrastructure.InMemoryUserRepository
import io.github.smiley4.strategygame.shared.routing.RoutingAuthConstants
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import org.koin.core.module.Module


fun Module.dependenciesIdentity() {

    // Shared
    single<PasswordHasher> { PasswordHasher() }

    // User
    single<UserRepository> { InMemoryUserRepository() }
    single<UserService> { UserServiceImpl(get(), get()) }

    // Auth
    single<SessionRepository> { InMemorySessionRepository() }
    single<AuthService> { AuthServiceImpl(get(), get(), get()) }

}

fun Route.routingIdentity() {
    route("identity", {
        description = "User management and authentication"
        tags("identity")
    }) {
        routeRegisterUser()
        routeLogIn()
//        authenticate(RoutingAuthConstants.AUTH_USER) {
            routeChangeUsername()
            routeChangePassword()
            routeLogOut()
//        }
    }
}