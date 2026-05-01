package io.github.smiley4.strategygame.identity.auth

import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.shared.domain.UserId

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
     * Validates the token and returns the user's id
     */
    fun authenticate(token: SessionToken): UserId
}