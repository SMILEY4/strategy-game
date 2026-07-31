package io.github.smiley4.strategygame.shared.infrastructure

import io.github.smiley4.strategygame.shared.values.UserId

data class UserPrincipal(
    val userId: UserId,
    val token: String,
)