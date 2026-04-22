package io.github.smiley4.strategygame.identity.user.domain

import io.github.smiley4.strategygame.identity.user.UserError
import io.github.smiley4.strategygame.identity.user.UserService
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.concurrent.ConcurrentHashMap

/**
 * Implementation of the [UserService].
 */
internal class UserServiceImpl(
    private val passwordHasher: PasswordHasher,
    private val userRepository: UserRepository
) : UserService {

    private val userLocks = ConcurrentHashMap<UserId, Mutex>()

    override fun register(username: Username, password: UnsafePassword): UserId {

        if (existsUsername(username)) {
            throw UserError.UsernameNotUnique(username)
        }

        val hashedPassword = passwordHasher.hash(password)

        val user = User(
            id = UserId(),
            username = username,
            password = hashedPassword
        )

        userRepository.save(user)

        return user.getId()
    }


    override suspend fun changePassword(userId: UserId, newPassword: UnsafePassword) = locked(userId) {

        val user = userRepository.getById(userId)
            ?: throw UserError.NotFound(userId)

        val hashedPassword = passwordHasher.hash(newPassword)

        user.changePassword(hashedPassword)

        userRepository.save(user)
    }


    override suspend fun changeUsername(userId: UserId, newUsername: Username) = locked(userId) {

        val user = userRepository.getById(userId)
            ?: throw UserError.NotFound(userId)

        if (user.getUsername() != newUsername && existsUsername(newUsername)) {
            throw UserError.UsernameNotUnique(newUsername)
        }

        user.changeUsername(newUsername)

        userRepository.save(user)
    }


    private fun existsUsername(username: Username): Boolean {
        return userRepository.getByUsername(username) != null
    }


    private suspend fun locked(userId: UserId, block: () -> Unit) {
        val lock = userLocks.computeIfAbsent(userId) { Mutex() }
        lock.withLock {
            block()
        }
    }
}