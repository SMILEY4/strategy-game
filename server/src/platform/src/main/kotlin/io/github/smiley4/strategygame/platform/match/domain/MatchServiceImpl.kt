package io.github.smiley4.strategygame.platform.match.domain

import io.github.smiley4.strategygame.platform.match.DeleteMatchError
import io.github.smiley4.strategygame.platform.match.GenerateGameError
import io.github.smiley4.strategygame.platform.match.JoinMatchError
import io.github.smiley4.strategygame.platform.match.MatchService
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.UserId
import io.github.smiley4.strategygame.shared.eventbus.WritableEventBus
import io.github.smiley4.strategygame.shared.utils.KeyedMutex

internal class MatchServiceImpl(
    private val matchRepository: MatchRepository,
    private val eventBus: WritableEventBus
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
                ?: throw JoinMatchError.NotFound(matchId.value.toString())

            match.join(user)

            matchRepository.save(match)
        }
    }


    override suspend fun delete(user: UserId, matchId: MatchId) {
        keyedMutex.withLock(matchId) {

            val match = matchRepository.findById(matchId)
                ?: throw DeleteMatchError.NotFound(matchId.value.toString())

            match.delete(user, eventBus)

            matchRepository.delete(match)
        }
    }

    override suspend fun generateGame(user: UserId, matchId: MatchId) {
        keyedMutex.withLock(matchId) {

            val match = matchRepository.findById(matchId)
                ?: throw GenerateGameError.NotFound(matchId.value.toString())

            match.requestGameGeneration(user, eventBus)

            matchRepository.save(match)
        }
    }

    override suspend fun attachGame(matchId: MatchId, gameId: GameId) {
        keyedMutex.withLock(matchId) {

            val match = matchRepository.findById(matchId)
                ?: throw GenerateGameError.NotFound(matchId.value.toString())

            match.attachGeneratedGame(gameId)

            matchRepository.save(match)
        }
    }


    override fun listMatches(user: UserId): List<MatchId> {
        return matchRepository
            .findByPlayer(user)
            .map { it.getId() }
    }

}