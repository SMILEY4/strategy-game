package io.github.smiley4.strategygame.identity.user.domain

import io.github.smiley4.strategygame.identity.shared.PasswordHasher
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.user.ChangePasswordError
import io.github.smiley4.strategygame.identity.user.ChangeUsernameError
import io.github.smiley4.strategygame.identity.user.RegisterUserError
import io.github.smiley4.strategygame.identity.user.UserService
import io.github.smiley4.strategygame.shared.values.UserId
import io.github.smiley4.strategygame.shared.utils.KeyedMutex

/**
 * Implementation of the [UserService].
 */
internal class UserServiceImpl(
    private val passwordHasher: PasswordHasher,
    private val userRepository: UserRepository
) : UserService {

    companion object {
        val keyedMutex = KeyedMutex()
    }

    override suspend fun register(username: Username, password: UnsafePassword): UserId {
        return keyedMutex.withLock(username) {

            if (existsUsername(username)) {
                throw RegisterUserError.AlreadyTaken(username.value)
            }

            val hashedPassword = passwordHasher.hash(password)

            val user = User(
                username = username,
                password = hashedPassword
            )

            userRepository.save(user)

            return@withLock user.getId()
        }
    }


    override fun changePassword(userId: UserId, newPassword: UnsafePassword) {

        val user = userRepository.findById(userId)
            ?: throw ChangePasswordError.UserNotFound(userId)

        val hashedPassword = passwordHasher.hash(newPassword)

        user.changePassword(hashedPassword)

        userRepository.save(user)
    }


    override suspend fun changeUsername(userId: UserId, newUsername: Username) {
        keyedMutex.withLock(newUsername) {

            val user = userRepository.findById(userId)
                ?: throw ChangeUsernameError.UserNotFound(userId)

            if (user.getUsername() != newUsername && existsUsername(newUsername)) {
                throw ChangeUsernameError.AlreadyTaken(newUsername.value)
            }

            user.changeUsername(newUsername)

            userRepository.save(user)
        }
    }


    private fun existsUsername(username: Username): Boolean {
        return userRepository.findByUsername(username) != null
    }

}