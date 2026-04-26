package io.github.smiley4.strategygame.platform.match.infrastructure
import io.github.smiley4.strategygame.platform.match.domain.Match
import io.github.smiley4.strategygame.platform.match.domain.MatchRepository
import io.github.smiley4.strategygame.platform.match.domain.MatchSnapshot
import io.github.smiley4.strategygame.platform.match.domain.MatchId
import io.github.smiley4.strategygame.shared.domain.UserId

internal class InMemoryMatchRepository : MatchRepository {

    private val matches = mutableListOf<MatchSnapshot>()

    override fun save(match: Match) {
        matches.removeIf { it.id == match.getId() }
        matches.add(match.toSnapshot())
    }

    override fun delete(match: Match) {
        matches.removeIf { it.id == match.getId() }
    }

    override fun findById(id: MatchId): Match? {
        return matches
            .find { it.id == id }
            ?.let { Match(it) }
    }

    override fun findByPlayer(id: UserId): List<Match> {
        return matches
            .filter { match -> match.participants.any { it.userId == id } }
            .map { Match(it) }
    }

}