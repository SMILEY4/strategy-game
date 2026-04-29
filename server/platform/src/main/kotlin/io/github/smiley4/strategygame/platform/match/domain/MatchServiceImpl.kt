package io.github.smiley4.strategygame.platform.match.domain

import io.github.smiley4.strategygame.platform.match.MatchError
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.utils.KeyedMutex

internal class MatchServiceImpl(
    private val gameEngineClient: GameEngineClient,
    private val matchRepository: MatchRepository
) : MatchService {

    companion object {
        val keyedMutex = KeyedMutex()
    }

    override fun create(user: UserId, name: String): MatchId {

        val match = Match(
            name = name,
            owner = user
        )

        matchRepository.save(match)

        return match.getId()
    }


    override suspend fun join(user: UserId, matchId: MatchId) {
        keyedMutex.withLock(matchId) {

            val match = matchRepository.findById(matchId)
                ?: throw MatchError.NotFound(matchId.value.toString())

            match.join(user)

            matchRepository.save(match)
        }
    }


    override suspend fun delete(user: UserId, matchId: MatchId) {
        keyedMutex.withLock(matchId) {

            val match = matchRepository.findById(matchId)
                ?: throw MatchError.NotFound(matchId.value.toString())

            match.delete(user)

            matchRepository.delete(match)

            match.getGameId()?.also {
                gameEngineClient.deleteGame(it)
            }
        }
    }

    override suspend fun generateGame(user: UserId, matchId: MatchId) {
        keyedMutex.withLock(matchId) {

            val match = matchRepository.findById(matchId)
                ?: throw MatchError.NotFound(matchId.value.toString())

            match.generateGame(user, gameEngineClient)

            matchRepository.save(match)
        }
    }


    override fun listMatches(user: UserId): List<MatchId> {
        return matchRepository
            .findByPlayer(user)
            .map { it.getId() }
    }

}