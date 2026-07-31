package io.github.smiley4.strategygame.identity.auth.domain

/**
 * Repository for storing [Session]s
 */
internal interface SessionRepository {

    /**
     * Save (insert of update) the given session
     */
    fun save(session: Session)

    /**
     * Delete the given session
     */
    fun delete(session: Session)

    /**
     * @return the [Session] associated with the given token.
     */
    fun findByToken(token: SessionToken): Session?
}