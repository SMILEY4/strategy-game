package io.github.smiley4.strategygame.identity.auth.infrastructure

import io.github.smiley4.strategygame.identity.auth.domain.OneTimeGrant
import io.github.smiley4.strategygame.identity.auth.domain.OneTimeGrantRepository
import io.github.smiley4.strategygame.identity.auth.domain.OneTimeGrantSnapshot
import io.github.smiley4.strategygame.identity.auth.domain.OneTimeToken

/**
 * Implementation of a [OneTimeGrantRepository]
 */
internal class InMemoryOneTimeGrantRepository : OneTimeGrantRepository {

    private val grants = mutableListOf<OneTimeGrantSnapshot>()

    override fun save(oneTimeGrant: OneTimeGrant) {
        grants.removeIf { it.token == oneTimeGrant.getToken() }
        grants.add(oneTimeGrant.toSnapshot())
    }

    override fun delete(oneTimeGrant: OneTimeGrant) {
        grants.removeIf { it.token == oneTimeGrant.getToken() }
    }

    override fun findByToken(token: OneTimeToken): OneTimeGrant? {
        return grants
            .find { it.token == token }
            ?.let { OneTimeGrant(it) }
    }
}