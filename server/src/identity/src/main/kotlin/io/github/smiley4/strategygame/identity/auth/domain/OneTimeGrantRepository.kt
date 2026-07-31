package io.github.smiley4.strategygame.identity.auth.domain

/**
 * Repository for storing [OneTimeGrant]s
 */
internal interface OneTimeGrantRepository {

    /**
     * Save (insert of update) the given grant
     */
    fun save(oneTimeGrant: OneTimeGrant)

    /**
     * Delete the given grant
     */
    fun delete(oneTimeGrant: OneTimeGrant)

    /**
     * @return the [OneTimeGrant] associated with the given token.
     */
    fun findByToken(token: OneTimeToken): OneTimeGrant?
}