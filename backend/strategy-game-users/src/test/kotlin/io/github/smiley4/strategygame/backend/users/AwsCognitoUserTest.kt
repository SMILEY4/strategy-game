package io.github.smiley4.strategygame.backend.users

import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProvider
import com.amazonaws.services.cognitoidp.model.AdminInitiateAuthResult
import com.amazonaws.services.cognitoidp.model.AuthFlowType
import com.amazonaws.services.cognitoidp.model.AuthenticationResultType
import com.amazonaws.services.cognitoidp.model.CodeDeliveryFailureException
import com.amazonaws.services.cognitoidp.model.DeleteUserResult
import com.amazonaws.services.cognitoidp.model.InvalidParameterException
import com.amazonaws.services.cognitoidp.model.InvalidPasswordException
import com.amazonaws.services.cognitoidp.model.NotAuthorizedException
import com.amazonaws.services.cognitoidp.model.SignUpResult
import com.amazonaws.services.cognitoidp.model.UserNotConfirmedException
import com.amazonaws.services.cognitoidp.model.UserNotFoundException
import com.amazonaws.services.cognitoidp.model.UsernameExistsException
import com.auth0.jwk.GuavaCachedJwkProvider
import com.auth0.jwk.JwkProvider
import com.auth0.jwk.RateLimitedJwkProvider
import com.auth0.jwk.UrlJwkProvider
import io.github.smiley4.strategygame.backend.users.edge.CreateUser
import io.github.smiley4.strategygame.backend.users.edge.DeleteUser
import io.github.smiley4.strategygame.backend.users.edge.LoginUser
import io.github.smiley4.strategygame.backend.users.edge.RefreshUserToken
import io.github.smiley4.strategygame.backend.users.edge.UserIdentityService
import io.github.smiley4.strategygame.backend.users.module.iam.AwsCognitoService
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.shouldBe
import io.ktor.server.auth.jwt.JWTAuthenticationProvider
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.spyk
import io.mockk.verify
import org.koin.core.Koin
import org.koin.dsl.koinApplication
import org.koin.dsl.module

class AwsCognitoUserTest : FreeSpec({

    "create user" - {

        "with valid data, expect no error" {
            val koin = createKoin()
            val cognito = koin.get<AWSCognitoIdentityProvider>()
            val createUser = koin.get<CreateUser>()
            createUser.perform(UNKNOWN_EMAIL, UNKNOWN_PASSWORD, UNKNOWN_USERNAME)
            verify(exactly = 1) {
                cognito.signUp(match { request ->
                    request.clientId == CLIENT_ID
                            && request.username == UNKNOWN_EMAIL
                            && request.password == UNKNOWN_PASSWORD
                            && request.userAttributes.size == 1
                            && request.userAttributes.find { it.name == "nickname" }?.value == UNKNOWN_USERNAME
                })
            }
        }

        "with duplicate id, expect error" {
            val koin = createKoin()
            val createUser = koin.get<CreateUser>()
            shouldThrow<CreateUser.UserAlreadyExistsError> {
                createUser.perform(EXISTING_EMAIL, UNKNOWN_PASSWORD, UNKNOWN_USERNAME)
            }
        }

        "with invalid user data, expect error" {
            val koin = createKoin()
            val createUser = koin.get<CreateUser>()
            shouldThrow<CreateUser.InvalidEmailOrPasswordError> {
                createUser.perform(INVALID_EMAIL, UNKNOWN_PASSWORD, UNKNOWN_USERNAME)
            }
        }

        "with invalid password, expect error" {
            val koin = createKoin()
            val createUser = koin.get<CreateUser>()
            shouldThrow<CreateUser.InvalidEmailOrPasswordError> {
                createUser.perform(UNKNOWN_EMAIL, INVALID_PASSWORD, UNKNOWN_USERNAME)
            }
        }

        "with failed code delivery, expect error" {
            val koin = createKoin()
            val createUser = koin.get<CreateUser>()
            shouldThrow<CreateUser.CodeDeliveryError> {
                createUser.perform(UNREACHABLE_EMAIL, UNKNOWN_PASSWORD, UNKNOWN_USERNAME)
            }
        }

    }

    "delete" - {

        "with valid data, expect no errors" {
            val koin = createKoin()
            val cognito = koin.get<AWSCognitoIdentityProvider>()
            val deleteUser = koin.get<DeleteUser>()
            deleteUser.perform(EXISTING_EMAIL, EXISTING_PASSWORD)
            verify(exactly = 1) {
                cognito.adminInitiateAuth(match { request ->
                    request.authFlow == AuthFlowType.ADMIN_NO_SRP_AUTH.toString()
                            && request.userPoolId == POOL_ID
                            && request.clientId == CLIENT_ID
                            && request.authParameters.size == 2
                            && request.authParameters["USERNAME"] == EXISTING_EMAIL
                            && request.authParameters["PASSWORD"] == EXISTING_PASSWORD
                })
            }
            verify(exactly = 1) {
                cognito.deleteUser(match { request ->
                    request.accessToken == VALID_ACCESS_TOKEN
                })
            }
        }

        "non-existing user, expect error" {
            val koin = createKoin()
            val deleteUser = koin.get<DeleteUser>()
            shouldThrow<DeleteUser.UserNotFoundError> {
                deleteUser.perform(UNKNOWN_EMAIL, UNKNOWN_PASSWORD)
            }
        }

        "user with invalid credentials, expect error" {
            val koin = createKoin()
            val deleteUser = koin.get<DeleteUser>()
            shouldThrow<DeleteUser.NotAuthorizedError> {
                deleteUser.perform(EXISTING_EMAIL, INVALID_PASSWORD)
            }
        }

        "unconfirmed user, expect error" {
            val koin = createKoin()
            val deleteUser = koin.get<DeleteUser>()
            shouldThrow<DeleteUser.UserNotConfirmedError> {
                deleteUser.perform(UNCONFIRMED_EMAIL, EXISTING_PASSWORD)
            }
        }

    }

    "login" - {

        "as valid user, expect success" {
            val koin = createKoin()
            val cognito = koin.get<AWSCognitoIdentityProvider>()
            val loginUser = koin.get<LoginUser>()
            loginUser.perform(EXISTING_EMAIL, EXISTING_PASSWORD).also {
                it.idToken shouldBe VALID_ID_TOKEN
                it.refreshToken shouldBe VALID_REFRESH_TOKEN
                it.accessToken shouldBe VALID_ACCESS_TOKEN
            }
            verify(exactly = 1) {
                cognito.adminInitiateAuth(match { request ->
                    request.authFlow == AuthFlowType.ADMIN_NO_SRP_AUTH.toString()
                            && request.userPoolId == POOL_ID
                            && request.clientId == CLIENT_ID
                            && request.authParameters.size == 2
                            && request.authParameters["USERNAME"] == EXISTING_EMAIL
                            && request.authParameters["PASSWORD"] == EXISTING_PASSWORD
                })
            }
        }

        "as non-existing user, expect error" {
            val koin = createKoin()
            val loginUser = koin.get<LoginUser>()
            shouldThrow<LoginUser.UserNotFoundError> {
                loginUser.perform(UNKNOWN_EMAIL, UNKNOWN_PASSWORD)
            }
        }

        "with invalid credentials, expect error" {
            val koin = createKoin()
            val loginUser = koin.get<LoginUser>()
            shouldThrow<LoginUser.NotAuthorizedError> {
                loginUser.perform(EXISTING_EMAIL, UNKNOWN_PASSWORD)
            }
        }

        "unconfirmed user, expect error" {
            val koin = createKoin()
            val loginUser = koin.get<LoginUser>()
            shouldThrow<LoginUser.UserNotConfirmedError> {
                loginUser.perform(UNCONFIRMED_EMAIL, EXISTING_PASSWORD)
            }
        }

    }

    "refresh" - {

        "with valid refresh token, expect success" {
            val koin = createKoin()
            val cognito = koin.get<AWSCognitoIdentityProvider>()
            val refreshToken = koin.get<RefreshUserToken>()
            refreshToken.perform(VALID_REFRESH_TOKEN).also {
                it.idToken shouldBe VALID_ID_TOKEN
                it.refreshToken shouldBe VALID_REFRESH_TOKEN
            }
            verify(exactly = 1) {
                cognito.adminInitiateAuth(match { request ->
                    request.authFlow == AuthFlowType.REFRESH_TOKEN_AUTH.toString()
                            && request.userPoolId == POOL_ID
                            && request.clientId == CLIENT_ID
                            && request.authParameters.size == 1
                            && request.authParameters["REFRESH_TOKEN"] == VALID_REFRESH_TOKEN
                })
            }
        }

        "with invalid refresh token, expect error" {
            val koin = createKoin()
            val refreshToken = koin.get<RefreshUserToken>()
            shouldThrow<RefreshUserToken.NotAuthorizedError> {
                refreshToken.perform(INVALID_REFRESH_TOKEN)
            }
        }
    }

    "authenticate request" - {

        "configuration" {
            val koin = createKoin()
            val service = koin.get<UserIdentityService>()

            val jwtConfig = mockJwtConfig()
            val jwkProvider = slot<JwkProvider>()
            val issuer = slot<String>()
            every { jwtConfig.verifier(capture(jwkProvider), capture(issuer), any()) } returns Unit

            service.configureAuthentication(jwtConfig)

            jwtConfig.realm shouldBe "strategy-game"
            issuer.captured shouldBe "https://cognito-idp.$REGION_ID.amazonaws.com/$POOL_ID"
            jwkProvider.captured.extractUrl() shouldBe "https://cognito-idp.$REGION_ID.amazonaws.com/$POOL_ID/.well-known/jwks.json"
        }

    }

}) {

    companion object {

        private const val CLIENT_ID = "testClient"
        private const val POOL_ID = "testPool"
        private const val REGION_ID = "testRegion"

        private const val EXISTING_EMAIL = "existing-email"
        private const val EXISTING_PASSWORD = "existing-username"

        private const val INVALID_EMAIL = "invalid-email"
        private const val INVALID_PASSWORD = "invalid-username"

        private const val UNKNOWN_EMAIL = "unknown-email"
        private const val UNKNOWN_USERNAME = "unknown-username"
        private const val UNKNOWN_PASSWORD = "unknown-username"

        private const val UNCONFIRMED_EMAIL = "unconfirmed-email"

        private const val UNREACHABLE_EMAIL = "unreachable-email"

        private const val VALID_ID_TOKEN = "valid-id-token"
        private const val VALID_REFRESH_TOKEN = "valid-refresh-token"
        private const val VALID_ACCESS_TOKEN = "valid-access-token"

        private const val INVALID_REFRESH_TOKEN = "invalid-refresh-token"

        private fun createKoin(): Koin {
            return koinApplication {
                modules(
                    module { dependenciesUsers() },
                    module {
                        single<AWSCognitoIdentityProvider> {
                            mockk<AWSCognitoIdentityProvider>().also {

                                // signup
                                every { it.signUp(any()) } returns SignUpResult()

                                every {
                                    it.signUp(match { request -> request.username == EXISTING_EMAIL || request.username == UNCONFIRMED_EMAIL || request.username == UNREACHABLE_EMAIL })
                                } throws UsernameExistsException("")

                                every {
                                    it.signUp(match { request -> request.username == INVALID_EMAIL })
                                } throws InvalidParameterException("")

                                every {
                                    it.signUp(match { request -> request.password == INVALID_PASSWORD })
                                } throws InvalidPasswordException("")

                                every {
                                    it.signUp(match { request -> request.username == UNREACHABLE_EMAIL })
                                } throws CodeDeliveryFailureException("")

                                // authenticate (default)
                                every { it.adminInitiateAuth(any()) } throws NotAuthorizedException("")

                                // login
                                every {
                                    it.adminInitiateAuth(match { request -> request.authFlow == AuthFlowType.ADMIN_NO_SRP_AUTH.toString() && request.authParameters["PASSWORD"] == EXISTING_PASSWORD && request.authParameters["USERNAME"] == EXISTING_EMAIL })
                                } returns AdminInitiateAuthResult()
                                    .withAuthenticationResult(
                                        AuthenticationResultType()
                                            .withIdToken(VALID_ID_TOKEN)
                                            .withRefreshToken(VALID_REFRESH_TOKEN)
                                            .withAccessToken(VALID_ACCESS_TOKEN)
                                    )
                                every {
                                    it.adminInitiateAuth(match { request -> request.authFlow == AuthFlowType.ADMIN_NO_SRP_AUTH.toString() && request.authParameters["USERNAME"] == UNKNOWN_EMAIL })
                                } throws UserNotFoundException("")

                                every {
                                    it.adminInitiateAuth(match { request -> request.authFlow == AuthFlowType.ADMIN_NO_SRP_AUTH.toString() && request.authParameters["USERNAME"] == UNCONFIRMED_EMAIL })
                                } throws UserNotConfirmedException("")

                                // refresh
                                every {
                                    it.adminInitiateAuth(match { request -> request.authFlow == AuthFlowType.REFRESH_TOKEN_AUTH.toString() && request.authParameters["REFRESH_TOKEN"] == VALID_REFRESH_TOKEN })
                                } returns AdminInitiateAuthResult()
                                    .withAuthenticationResult(
                                        AuthenticationResultType()
                                            .withIdToken(VALID_ID_TOKEN)
                                            .withRefreshToken(VALID_REFRESH_TOKEN)
                                    )

                                // delete
                                every { it.deleteUser(any()) } returns DeleteUserResult()

                            }
                        }
                        single<UserIdentityService> {
                            AwsCognitoService(
                                provider = get(),
                                clientId = CLIENT_ID,
                                poolId = POOL_ID,
                                region = REGION_ID
                            )
                        }
                    }
                )
            }.koin
        }

        private fun mockJwtConfig(): JWTAuthenticationProvider.Config {
            val config = JWTAuthenticationProvider.Config::class.java.getDeclaredConstructor(String::class.java).newInstance("user")
            return spyk<JWTAuthenticationProvider.Config>(config)
        }

        private fun JwkProvider.extractUrl(): String {
            val cachedProvider = GuavaCachedJwkProvider::class.java.getDeclaredField("provider").also { it.isAccessible=true }.get(this) as RateLimitedJwkProvider
            val urlProvider = RateLimitedJwkProvider::class.java.getDeclaredField("provider").also { it.isAccessible = true }.get(cachedProvider) as UrlJwkProvider
            val url = UrlJwkProvider::class.java.getDeclaredField("url").also { it.isAccessible = true }.get(urlProvider)
            return url.toString()
        }

    }
}