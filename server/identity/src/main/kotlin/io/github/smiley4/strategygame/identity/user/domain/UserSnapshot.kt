package io.github.smiley4.strategygame.identity.user.domain

import io.github.smiley4.strategygame.identity.shared.Username

internal data class UserSnapshot(
    val id: UserId,
    var username: Username,
    var password: HashedPassword
)