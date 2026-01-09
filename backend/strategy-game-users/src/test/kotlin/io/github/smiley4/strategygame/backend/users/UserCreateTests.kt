package io.github.smiley4.strategygame.backend.users

import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring
import io.github.smiley4.strategygame.backend.common.monitoring.MonitoringService
import io.github.smiley4.strategygame.backend.common.monitoring.NoOpMonitoringService
import io.github.smiley4.strategygame.backend.users.authentication.UserIdentityService
import io.github.smiley4.strategygame.backend.users.create.UserCreate
import io.github.smiley4.strategygame.backend.users.create.UserCreateError
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.koin.core.Koin
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.dsl.koinApplication
import org.koin.dsl.module

class UserCreateTests : FreeSpec({

    "create new valid user" {
        val dependencies = testDependencies()
        val identityService = dependencies.get<UserIdentityService>()
        val userCreate = dependencies.get<UserCreate>()

        every { identityService.createUser(any(), any(), any()) } returns Unit

        val email = "test@example.com"
        val username = "test-user"
        val password = "test-secret"

        userCreate.create(email, password, username)

        verify(exactly = 1) { identityService.createUser(email, password, username) }
    }

    "create new user with not existing email" {
        val dependencies = testDependencies()
        val identityService = dependencies.get<UserIdentityService>()
        val userCreate = dependencies.get<UserCreate>()

        every { identityService.createUser(any(), any(), any()) } throws UserIdentityService.CodeDeliveryError()

        val email = "unknown@example.com"
        val username = "test-user"
        val password = "test-secret"

        shouldThrow<UserCreateError.CodeDeliveryError> {
            userCreate.create(email, password, username)
        }

        verify(exactly = 1) { identityService.createUser(email, password, username) }
    }

    "create new user with invalid email" {
        val dependencies = testDependencies()
        val identityService = dependencies.get<UserIdentityService>()
        val userCreate = dependencies.get<UserCreate>()

        every { identityService.createUser(any(), any(), any()) } throws UserIdentityService.InvalidEmailOrPasswordError()

        val email = "invalid-example.com"
        val username = "test-user"
        val password = "test-secret"

        shouldThrow<UserCreateError.InvalidEmailOrPasswordError> {
            userCreate.create(email, password, username)
        }

        verify(exactly = 1) { identityService.createUser(email, password, username) }
    }

    "create new user with invalid password" {
        val dependencies = testDependencies()
        val identityService = dependencies.get<UserIdentityService>()
        val userCreate = dependencies.get<UserCreate>()

        every { identityService.createUser(any(), any(), any()) } throws UserIdentityService.InvalidEmailOrPasswordError()

        val email = "test@example.com"
        val username = "test-user"
        val password = "invalid"

        shouldThrow<UserCreateError.InvalidEmailOrPasswordError> {
            userCreate.create(email, password, username)
        }

        verify(exactly = 1) { identityService.createUser(email, password, username) }
    }

    "create new user with user already exist" {
        val dependencies = testDependencies()
        val identityService = dependencies.get<UserIdentityService>()
        val userCreate = dependencies.get<UserCreate>()

        every { identityService.createUser(any(), any(), any()) } throws UserIdentityService.UserAlreadyExistsError()

        val email = "test@example.com"
        val username = "test-user"
        val password = "test-secret"

        shouldThrow<UserCreateError.UserAlreadyExistsError> {
            userCreate.create(email, password, username)
        }

        verify(exactly = 1) { identityService.createUser(email, password, username) }
    }

}) {

    companion object {

        private fun testDependencies(): Koin {
            return koinApplication {
                modules(
                    module { dependenciesUsers() },
                    module {

                        single<UserIdentityService> {
                            mockk<UserIdentityService>()
                        }

                        single<MonitoringService> {
                            NoOpMonitoringService().also {
                                Monitoring.service = it
                            }
                        } withOptions { createdAtStart() }
                    }
                )
            }.koin
        }

    }

}