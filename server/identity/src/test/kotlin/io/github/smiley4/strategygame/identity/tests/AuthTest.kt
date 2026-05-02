package io.github.smiley4.strategygame.identity.tests

import io.github.smiley4.strategygame.identity.auth.AuthService
import io.github.smiley4.strategygame.identity.auth.AuthenticateUserError
import io.github.smiley4.strategygame.identity.auth.LogInUserError
import io.github.smiley4.strategygame.identity.auth.LogOutError
import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.testScope
import io.github.smiley4.strategygame.identity.user.UserService
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.shouldNotBe

class AuthTest : FreeSpec({

    "login" - {

        "as registered user with valid credentials should succeed" {
            testScope {
                val authService = get<AuthService>()
                val userService = get<UserService>()

                userService.register(Username("tester1"), UnsafePassword("password_1"))
                userService.register(Username("tester2"), UnsafePassword("password_2"))

                authService.login(Username("tester1"), UnsafePassword("password_1"))
            }
        }

        "with invalid username should fail" {
            testScope {
                val authService = get<AuthService>()
                val userService = get<UserService>()

                userService.register(Username("tester1"), UnsafePassword("password_1"))
                userService.register(Username("tester2"), UnsafePassword("password_2"))

                shouldThrow<LogInUserError.InvalidUsernameOrPassword> {
                    authService.login(Username("unknown"), UnsafePassword("password_1"))
                }
            }
        }

        "with invalid password should fail" {
            testScope {
                val authService = get<AuthService>()
                val userService = get<UserService>()

                userService.register(Username("tester1"), UnsafePassword("password_1"))
                userService.register(Username("tester2"), UnsafePassword("password_2"))

                shouldThrow<LogInUserError.InvalidUsernameOrPassword> {
                    authService.login(Username("tester1"), UnsafePassword("password_2"))
                }
            }
        }

        "multiple attempts result in different tokens" {
            testScope {
                val authService = get<AuthService>()
                val userService = get<UserService>()

                userService.register(Username("tester"), UnsafePassword("password"))

                val token1 = authService.login(Username("tester"), UnsafePassword("password"))
                val token2 = authService.login(Username("tester"), UnsafePassword("password"))

                token1 shouldNotBe token2
            }
        }

    }


    "logout" - {

        "should invalidate token" {
            testScope {
                val authService = get<AuthService>()
                val userService = get<UserService>()

                userService.register(Username("tester"), UnsafePassword("password"))
                val token = authService.login(Username("tester"), UnsafePassword("password"))

                authService.authenticate(token)

                authService.logout(token)

                shouldThrow<AuthenticateUserError.InvalidToken> {
                    authService.authenticate(token)
                }
            }
        }

        "with invalid token should fail" {
            testScope {
                val authService = get<AuthService>()
                val userService = get<UserService>()

                userService.register(Username("tester"), UnsafePassword("password"))
                val token = authService.login(Username("tester"), UnsafePassword("password"))

                authService.authenticate(token)

                shouldThrow<LogOutError.InvalidToken> {
                    authService.logout(SessionToken())
                }

                authService.authenticate(token)
            }
        }

    }


    "authenticate" - {

        " with valid token should succeed" {
            testScope {
                val authService = get<AuthService>()
                val userService = get<UserService>()

                userService.register(Username("tester"), UnsafePassword("password"))
                val token = authService.login(Username("tester"), UnsafePassword("password"))

                authService.authenticate(token)
            }
        }

        "with invalid token should fail" {
            testScope {
                val authService = get<AuthService>()
                val userService = get<UserService>()

                userService.register(Username("tester"), UnsafePassword("password"))

                shouldThrow<AuthenticateUserError.InvalidToken> {
                    authService.authenticate(SessionToken())
                }
            }
        }

    }

})