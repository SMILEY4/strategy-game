package io.github.smiley4.strategygame.identity.user.domain

import io.github.smiley4.strategygame.identity.shared.Username

/**
 * Repository for user access.
 */
internal interface UserRepository {
    fun save(user: User)
    fun findById(id: UserId): User?
    fun findByUsername(username: Username): User?
}