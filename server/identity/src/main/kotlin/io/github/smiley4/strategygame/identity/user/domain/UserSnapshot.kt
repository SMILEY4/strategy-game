package io.github.smiley4.strategygame.identity.user.domain

data class UserSnapshot(
    val id: UserId,
    var username: Username,
    var password: HashedPassword
)