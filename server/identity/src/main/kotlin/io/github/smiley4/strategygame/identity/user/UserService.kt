package io.github.smiley4.strategygame.identity.user

import io.github.smiley4.strategygame.identity.user.domain.UnsafePassword
import io.github.smiley4.strategygame.identity.user.domain.UserId
import io.github.smiley4.strategygame.identity.user.domain.Username

/**
 * Service responsible for user operations.
 */
interface UserService {
    fun register(username: Username, password: UnsafePassword): UserId
    suspend fun changePassword(userId: UserId, newPassword: UnsafePassword)
    suspend fun changeUsername(userId: UserId, newUsername: Username)
}