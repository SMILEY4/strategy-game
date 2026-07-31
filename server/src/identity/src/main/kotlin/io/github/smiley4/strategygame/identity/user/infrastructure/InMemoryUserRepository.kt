package io.github.smiley4.strategygame.identity.user.infrastructure

import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.user.domain.User
import io.github.smiley4.strategygame.identity.user.domain.UserRepository
import io.github.smiley4.strategygame.identity.user.domain.UserSnapshot
import io.github.smiley4.strategygame.shared.values.UserId

/**
 * In-memory implementation of a [UserRepository].
 */
internal class InMemoryUserRepository : UserRepository {

    val users = mutableListOf<UserSnapshot>()

    override fun save(user: User) {
        users.removeIf { it.id == user.getId() }
        users.add(user.toSnapshot())
    }

    override fun findById(id: UserId): User? {
        return users
            .find { it.id == id }
            ?.let { User(it) }
    }

    override fun findByUsername(username: Username): User? {
        return users
            .find { it.username == username }
            ?.let { User(it) }
    }

    fun getSnapshot(id: UserId): UserSnapshot? {
        return users.find { it.id == id }
    }
}