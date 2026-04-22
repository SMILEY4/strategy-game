package io.github.smiley4.strategygame.identity.auth.infrastructure

import io.github.smiley4.strategygame.identity.auth.domain.Session
import io.github.smiley4.strategygame.identity.auth.domain.SessionRepository
import io.github.smiley4.strategygame.identity.auth.domain.SessionSnapshot
import io.github.smiley4.strategygame.identity.auth.domain.SessionToken

internal class InMemorySessionRepository : SessionRepository {

    private val sessions = mutableListOf<SessionSnapshot>()

    override fun save(session: Session) {
        sessions.removeIf { it.token == session.getToken() }
        sessions.add(session.toSnapshot())
    }

    override fun delete(session: Session) {
        sessions.removeIf { it.token == session.getToken() }
    }

    override fun findByToken(token: SessionToken): Session? {
        return sessions
            .find { it.token == token }
            ?.let { Session(it) }
    }
}