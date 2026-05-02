package io.github.smiley4.strategygame.identity.tests

import io.github.smiley4.strategygame.identity.shared.HashedPassword
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.UnsafePasswordError
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.shared.UsernameError
import io.github.smiley4.strategygame.identity.testScope
import io.github.smiley4.strategygame.identity.user.ChangePasswordError
import io.github.smiley4.strategygame.identity.user.ChangeUsernameError
import io.github.smiley4.strategygame.identity.user.RegisterUserError
import io.github.smiley4.strategygame.identity.user.UserService
import io.github.smiley4.strategygame.identity.user.domain.UserRepository
import io.github.smiley4.strategygame.shared.domain.UserId
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe

class UserTests : FreeSpec({

    "username" - {

        "successful for valid value" {
            Username("tester")
        }

        "should fail with empty string" {
            shouldThrow<UsernameError.Empty> {
                Username("")
            }
        }

        "should fail with blank string" {
            shouldThrow<UsernameError.Empty> {
                Username("      ")
            }
        }

        "should fail with illegal characters" {
            shouldThrow<UsernameError.InvalidSymbols> {
                Username("Hello%($/&$(World")
            }
        }

    }

    "unsafe password" - {

        "successful for valid value" {
            UnsafePassword("password")
        }

        "should fail with empty string" {
            shouldThrow<UnsafePasswordError.Empty> {
                UnsafePassword("")
            }
        }

        "should fail with blank string" {
            shouldThrow<UnsafePasswordError.Empty> {
                UnsafePassword("     ")
            }
        }

    }

    "hashed password" - {

        "successful for valid value" {
            HashedPassword(
                hash = "\$test\$hash",
                salt = "testsalt"
            )
        }

        "should throw if does not start with $" {
            shouldThrow<Exception> {
                HashedPassword(
                    hash = "invalid",
                    salt = "testsalt"
                )
            }
        }

    }

    "user registration" - {

        "registration with valid data is successful" {
            testScope {
                val repository = get<UserRepository>()
                val service = get<UserService>()

                val userId = service.register(Username("tester"), UnsafePassword("password"))

                val user = repository.findById(userId)
                user shouldNotBe null
            }
        }

        "should fail for already taken username" {
            testScope {
                val service = get<UserService>()

                service.register(Username("tester"), UnsafePassword("password1"))

                shouldThrow<RegisterUserError.AlreadyTaken> {
                    service.register(Username("tester"), UnsafePassword("password2"))
                }
            }
        }

    }

    "user changes username" - {

        "successful for valid value" {
            testScope {
                val repository = get<UserRepository>()
                val service = get<UserService>()

                val userId = service.register(Username("original"), UnsafePassword("password"))

                repository.findById(userId)?.toSnapshot()?.username?.value shouldBe "original"

                service.changeUsername(userId, Username("renamed"))

                repository.findById(userId)?.toSnapshot()?.username?.value shouldBe "renamed"
            }
        }

        "should fail for unknown user" {
            testScope {
                val repository = get<UserRepository>()
                val service = get<UserService>()

                val existingUserId = service.register(Username("tester"), UnsafePassword("password"))
                val unknownUserId = UserId()

                shouldThrow<ChangeUsernameError.UserNotFound> {
                    service.changeUsername(unknownUserId, Username("renamed"))
                }

                repository.findById(existingUserId)?.toSnapshot()?.username?.value shouldBe "tester"
            }
        }

        "should fail for already taken name" {
            testScope {
                val repository = get<UserRepository>()
                val service = get<UserService>()

                val existingUserId1 = service.register(Username("tester1"), UnsafePassword("password1"))
                val existingUserId2 = service.register(Username("tester2"), UnsafePassword("password2"))

                shouldThrow<ChangeUsernameError.AlreadyTaken> {
                    service.changeUsername(existingUserId2, Username("tester1"))
                }

                repository.findById(existingUserId1)?.toSnapshot()?.username?.value shouldBe "tester1"
                repository.findById(existingUserId2)?.toSnapshot()?.username?.value shouldBe "tester2"
            }
        }

    }

    "user changes password" - {

        "successful for valid value" {
            testScope {
                val repository = get<UserRepository>()
                val service = get<UserService>()

                val userId = service.register(Username("tester"), UnsafePassword("oldpassword"))
                val passwordBefore = repository.findById(userId)?.toSnapshot()?.password

                service.changePassword(userId, UnsafePassword("newpassword"))

                val passwordAfter = repository.findById(userId)?.toSnapshot()?.password
                passwordAfter?.hash shouldNotBe passwordBefore?.hash
                passwordAfter?.salt shouldNotBe passwordBefore?.salt
            }
        }

        "should fail for unknown user" {
            testScope {
                val service = get<UserService>()

                service.register(Username("tester"), UnsafePassword("password"))

                shouldThrow<ChangePasswordError.UserNotFound> {
                    service.changePassword(UserId(), UnsafePassword("newpassword"))
                }
            }
        }

    }

})