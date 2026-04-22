package io.github.smiley4.strategygame.identity.auth.domain

internal interface SessionRepository {
    fun save(session: Session)
    fun delete(session: Session)
    fun findByToken(token: SessionToken): Session?
}