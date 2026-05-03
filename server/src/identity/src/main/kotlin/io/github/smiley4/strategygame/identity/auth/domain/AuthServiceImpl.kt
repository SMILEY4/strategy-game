package io.github.smiley4.strategygame.identity.auth.domain

import io.github.smiley4.strategygame.identity.auth.AuthService
import io.github.smiley4.strategygame.identity.auth.AuthenticateUserError
import io.github.smiley4.strategygame.identity.auth.LogInUserError
import io.github.smiley4.strategygame.identity.auth.LogOutError
import io.github.smiley4.strategygame.identity.shared.PasswordHasher
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.user.domain.UserRepository
import io.github.smiley4.strategygame.shared.domain.UserId

/**
 * Implementation of an [AuthService]
 */
internal class AuthServiceImpl(
    private val passwordHasher: PasswordHasher,
    private val sessionRepository: SessionRepository,
    private val userRepository: UserRepository,
) : AuthService {

    override fun login(username: Username, password: UnsafePassword): SessionToken {
        val user = userRepository.findByUsername(username)
            ?: throw LogInUserError.InvalidUsernameOrPassword()

        if (!user.isValidPassword(password, passwordHasher)) {
            throw LogInUserError.InvalidUsernameOrPassword()
        }

        val session = Session(user.getId())
        sessionRepository.save(session)

        return session.getToken()
    }

    override fun logout(token: SessionToken) {

        val session = sessionRepository.findByToken(token)
            ?: throw LogOutError.InvalidToken()

        session.revoke()
        sessionRepository.delete(session)
    }

    override fun authenticate(token: SessionToken): UserId {

        val session = sessionRepository.findByToken(token)
            ?: throw AuthenticateUserError.InvalidToken()

        if (!session.isValid()) {
            sessionRepository.delete(session)
            throw AuthenticateUserError.InvalidToken()
        }

        return session.getUserId()
    }
}