package io.github.smiley4.strategygame.identity.user.domain

/**
 * Repository for user access.
 */
internal interface UserRepository {
    fun getById(id: UserId): User?
    fun save(user: User)
}