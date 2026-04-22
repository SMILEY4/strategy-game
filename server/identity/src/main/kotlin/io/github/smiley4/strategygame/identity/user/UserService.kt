package io.github.smiley4.strategygame.identity.user

import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.shared.UserId

/**
 * Service responsible for user operations.
 */
interface UserService {
    fun register(username: Username, password: UnsafePassword): UserId
    suspend fun changePassword(userId: UserId, newPassword: UnsafePassword)
    suspend fun changeUsername(userId: UserId, newUsername: Username)
}