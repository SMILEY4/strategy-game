package io.github.smiley4.strategygame.identity.auth.domain

import io.github.smiley4.strategygame.identity.auth.AuthError
import io.github.smiley4.strategygame.identity.auth.AuthService
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.user.UserError
import io.github.smiley4.strategygame.identity.user.domain.PasswordHasher
import io.github.smiley4.strategygame.identity.user.domain.UserRepository

internal class AuthServiceImpl(
    private val passwordHasher: PasswordHasher,
    private val sessionRepository: SessionRepository,
    private val userRepository: UserRepository,
) : AuthService {

    override fun login(username: Username, password: UnsafePassword): SessionToken {

        val user = userRepository.findByUsername(username)
            ?: throw AuthError.InvalidUsernameOrPassword()

        if (!user.isValidPassword(password, passwordHasher)) {
            throw AuthError.InvalidUsernameOrPassword()
        }

        val session = Session(user.getId())
        sessionRepository.save(session)

        return session.getToken()
    }

    override suspend fun logout(token: SessionToken) {

        val session = sessionRepository.findByToken(token)
            ?: throw AuthError.InvalidToken()

        session.revoke()

        sessionRepository.delete(session)
    }

    override suspend fun authenticate(token: SessionToken) {

        val session = sessionRepository.findByToken(token)
            ?: throw AuthError.InvalidToken()

        if (!session.isValid()) {
            sessionRepository.delete(session)
            throw AuthError.InvalidToken()
        }
    }
}