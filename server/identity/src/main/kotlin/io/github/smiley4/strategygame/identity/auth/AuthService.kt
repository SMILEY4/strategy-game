package io.github.smiley4.strategygame.identity.auth

import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username

interface AuthService {
    /**
     * Authenticates credentials and returns a new session token.
     */
    fun login(username: Username, password: UnsafePassword): SessionToken


    /**
     * Revokes the given session.
     */
    fun logout(token: SessionToken)


    /**
     * Validates the token
     */
    fun authenticate(token: SessionToken)
}