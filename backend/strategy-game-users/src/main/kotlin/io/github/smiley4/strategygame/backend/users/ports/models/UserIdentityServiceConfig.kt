package io.github.smiley4.strategygame.backend.users.ports.models

data class UserIdentityServiceConfig(
    val identityProvider: UserIdentityProvider,
    val aws: AwsCognitoConfig?
)

enum class UserIdentityProvider {
    DUMMY, AWS_COGNITO
}

data class AwsCognitoConfig(
    val clientId: String,
    val poolId: String,
    val accessKeyId: String,
    val secretAccessKey: String,
    val region: String
)