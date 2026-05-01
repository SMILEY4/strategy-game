package io.github.smiley4.strategygame.identity.user

import io.github.smiley4.strategygame.identity.auth.AuthError
import io.github.smiley4.strategygame.identity.auth.domain.AuthServiceImpl
import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.identity.auth.infrastructure.InMemorySessionRepository
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.shared.PasswordHasher
import io.github.smiley4.strategygame.identity.user.domain.UserServiceImpl
import io.github.smiley4.strategygame.identity.user.infrastructure.InMemoryUserRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.shouldNotBe

class AuthTest : FreeSpec({

    "login" - {

        "as registered user with valid credentials should succeed" {
            val sessionRepository = InMemorySessionRepository()
            val userRepository = InMemoryUserRepository()
            val authService = AuthServiceImpl(PasswordHasher(), sessionRepository, userRepository)
            val userService = UserServiceImpl(PasswordHasher(), userRepository)

            userService.register(Username("tester1"), UnsafePassword("password_1"))
            userService.register(Username("tester2"), UnsafePassword("password_2"))

            authService.login(Username("tester1"), UnsafePassword("password_1"))
        }

        "with invalid username should fail" {
            val sessionRepository = InMemorySessionRepository()
            val userRepository = InMemoryUserRepository()
            val authService = AuthServiceImpl(PasswordHasher(), sessionRepository, userRepository)
            val userService = UserServiceImpl(PasswordHasher(), userRepository)

            userService.register(Username("tester1"), UnsafePassword("password_1"))
            userService.register(Username("tester2"), UnsafePassword("password_2"))

            shouldThrow<AuthError.InvalidUsernameOrPassword> {
                authService.login(Username("unknown"), UnsafePassword("password_1"))
            }
        }

        "with invalid password should fail" {
            val sessionRepository = InMemorySessionRepository()
            val userRepository = InMemoryUserRepository()
            val authService = AuthServiceImpl(PasswordHasher(), sessionRepository, userRepository)
            val userService = UserServiceImpl(PasswordHasher(), userRepository)

            userService.register(Username("tester1"), UnsafePassword("password_1"))
            userService.register(Username("tester2"), UnsafePassword("password_2"))

            shouldThrow<AuthError.InvalidUsernameOrPassword> {
                authService.login(Username("tester1"), UnsafePassword("password_2"))
            }
        }

        "multiple attempts result in different tokens" {
            val sessionRepository = InMemorySessionRepository()
            val userRepository = InMemoryUserRepository()
            val authService = AuthServiceImpl(PasswordHasher(), sessionRepository, userRepository)
            val userService = UserServiceImpl(PasswordHasher(), userRepository)

            userService.register(Username("tester"), UnsafePassword("password"))

            val token1 = authService.login(Username("tester"), UnsafePassword("password"))
            val token2 = authService.login(Username("tester"), UnsafePassword("password"))

            token1 shouldNotBe token2
        }

    }


    "logout" - {

        "should invalidate token" {
            val sessionRepository = InMemorySessionRepository()
            val userRepository = InMemoryUserRepository()
            val authService = AuthServiceImpl(PasswordHasher(), sessionRepository, userRepository)
            val userService = UserServiceImpl(PasswordHasher(), userRepository)

            userService.register(Username("tester"), UnsafePassword("password"))
            val token = authService.login(Username("tester"), UnsafePassword("password"))

            authService.authenticate(token)

            authService.logout(token)

            shouldThrow<AuthError.InvalidToken> {
                authService.authenticate(token)
            }
        }

        "with invalid token should fail" {
            val sessionRepository = InMemorySessionRepository()
            val userRepository = InMemoryUserRepository()
            val authService = AuthServiceImpl(PasswordHasher(), sessionRepository, userRepository)
            val userService = UserServiceImpl(PasswordHasher(), userRepository)

            userService.register(Username("tester"), UnsafePassword("password"))
            val token = authService.login(Username("tester"), UnsafePassword("password"))

            authService.authenticate(token)

            shouldThrow<AuthError.InvalidToken> {
                authService.logout(SessionToken())
            }

            authService.authenticate(token)
        }

    }


    "authenticate" - {

        " with valid token should succeed" {
            val sessionRepository = InMemorySessionRepository()
            val userRepository = InMemoryUserRepository()
            val authService = AuthServiceImpl(PasswordHasher(), sessionRepository, userRepository)
            val userService = UserServiceImpl(PasswordHasher(), userRepository)

            userService.register(Username("tester"), UnsafePassword("password"))
            val token = authService.login(Username("tester"), UnsafePassword("password"))

            authService.authenticate(token)
        }

        "with invalid token should fail" {
            val sessionRepository = InMemorySessionRepository()
            val userRepository = InMemoryUserRepository()
            val authService = AuthServiceImpl(PasswordHasher(), sessionRepository, userRepository)
            val userService = UserServiceImpl(PasswordHasher(), userRepository)

            userService.register(Username("tester"), UnsafePassword("password"))

            shouldThrow<AuthError.InvalidToken> {
                authService.authenticate(SessionToken())
            }
        }

    }

})