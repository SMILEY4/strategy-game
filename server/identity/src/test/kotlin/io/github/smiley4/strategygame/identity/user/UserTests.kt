package io.github.smiley4.strategygame.identity.user

import io.github.smiley4.strategygame.identity.shared.HashedPassword
import io.github.smiley4.strategygame.identity.shared.PasswordHasher
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.user.domain.UserServiceImpl
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.user.infrastructure.InMemoryUserRepository
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
            shouldThrow<UserError.UsernameError.Empty> {
                Username("")
            }
        }

        "should fail with blank string" {
            shouldThrow<UserError.UsernameError.Empty> {
                Username("      ")
            }
        }

        "should fail with illegal characters" {
            shouldThrow<UserError.UsernameError.Invalid> {
                Username("Hello%($/&$(World")
            }
        }

    }

    "unsafe password" - {

        "successful for valid value" {
            UnsafePassword("password")
        }

        "should fail with empty string" {
            shouldThrow<UserError.UnsafePasswordError.Empty> {
                UnsafePassword("")
            }
        }

        "should fail with blank string" {
            shouldThrow<UserError.UnsafePasswordError.Empty> {
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
            val repository = InMemoryUserRepository()
            val service = UserServiceImpl(PasswordHasher(), repository)

            val userId = service.register(Username("tester"), UnsafePassword("password"))

            val snapshot = repository.getSnapshot(userId)
            snapshot shouldNotBe null
        }

        "should fail for already taken username" {
            val repository = InMemoryUserRepository()
            val service = UserServiceImpl(PasswordHasher(), repository)

            service.register(Username("tester"), UnsafePassword("password1"))

            shouldThrow<UserError.UsernameNotUnique> {
                service.register(Username("tester"), UnsafePassword("password2"))
            }
        }

    }

    "user changes username" - {

        "successful for valid value" {
            val repository = InMemoryUserRepository()
            val service = UserServiceImpl(PasswordHasher(), repository)

            val userId = service.register(Username("original"), UnsafePassword("password"))

            repository.getSnapshot(userId)?.username?.value shouldBe "original"

            service.changeUsername(userId, Username("renamed"))

            repository.getSnapshot(userId)?.username?.value shouldBe "renamed"
        }

        "should fail for unknown user" {
            val repository = InMemoryUserRepository()
            val service = UserServiceImpl(PasswordHasher(), repository)

            val existingUserId = service.register(Username("tester"), UnsafePassword("password"))
            val unknownUserId = UserId()

            shouldThrow<UserError.NotFound> {
                service.changeUsername(unknownUserId, Username("renamed"))
            }

            repository.getSnapshot(existingUserId)?.username?.value shouldBe "tester"
        }

    }

    "user changes password" - {

        "successful for valid value" {
            val repository = InMemoryUserRepository()
            val service = UserServiceImpl(PasswordHasher(), repository)

            val userId = service.register(Username("tester"), UnsafePassword("oldpassword"))
            val passwordBefore = repository.getSnapshot(userId)?.password

            service.changePassword(userId, UnsafePassword("newpassword"))

            val passwordAfter = repository.getSnapshot(userId)?.password
            passwordAfter?.hash shouldNotBe passwordBefore?.hash
            passwordAfter?.salt shouldNotBe passwordBefore?.salt
        }

        "should fail for unknown user" {
            val repository = InMemoryUserRepository()
            val service = UserServiceImpl(PasswordHasher(), repository)

            service.register(Username("tester"), UnsafePassword("password"))

            shouldThrow<UserError.NotFound> {
                service.changePassword(UserId(), UnsafePassword("newpassword"))
            }
        }

    }

})