package io.github.smiley4.strategygame.identity.user.domain

import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.user.UserError
import io.github.smiley4.strategygame.identity.user.UserService

/**
 * Implementation of the [UserService].
 */
internal class UserServiceImpl(
    private val passwordHasher: PasswordHasher,
    private val userRepository: UserRepository
) : UserService {

    override fun register(username: Username, password: UnsafePassword): UserId {

        if (existsUsername(username)) {
            throw UserError.UsernameNotUnique(username.value)
        }

        val hashedPassword = passwordHasher.hash(password)

        val user = User(
            username = username,
            password = hashedPassword
        )

        userRepository.save(user)

        return user.getId()
    }


    override suspend fun changePassword(userId: UserId, newPassword: UnsafePassword) {

        val user = userRepository.findById(userId)
            ?: throw UserError.NotFound(userId.id.toString())

        val hashedPassword = passwordHasher.hash(newPassword)

        user.changePassword(hashedPassword)

        userRepository.save(user)
    }


    override suspend fun changeUsername(userId: UserId, newUsername: Username) {

        val user = userRepository.findById(userId)
            ?: throw UserError.NotFound(userId.id.toString())

        if (user.getUsername() != newUsername && existsUsername(newUsername)) {
            throw UserError.UsernameNotUnique(newUsername.value)
        }

        user.changeUsername(newUsername)

        userRepository.save(user)
    }


    private fun existsUsername(username: Username): Boolean {
        return userRepository.findByUsername(username) != null
    }

}