package io.github.smiley4.strategygame.identity.user.infrastructure

import io.github.smiley4.strategygame.identity.user.domain.User
import io.github.smiley4.strategygame.identity.user.domain.UserId
import io.github.smiley4.strategygame.identity.user.domain.UserRepository
import io.github.smiley4.strategygame.identity.user.domain.UserSnapshot

/**
 * "Fake", in-memory implementation of a [UserRepository].
 */
internal class InMemoryUserRepository : UserRepository {

    val users = mutableListOf<UserSnapshot>()

    override fun getById(id: UserId): User? {
        return users
            .find { it.id == id }
            ?.let { User(it) }
    }

    override fun save(user: User) {
        users.removeIf { it.id == user.getId() }
        users.add(user.toSnapshot())
    }

    fun getSnapshot(id: UserId): UserSnapshot? {
        return users.find { it.id == id }
    }
}