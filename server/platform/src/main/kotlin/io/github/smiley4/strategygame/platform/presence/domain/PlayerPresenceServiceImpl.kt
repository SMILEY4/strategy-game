package io.github.smiley4.strategygame.platform.presence.domain

import io.github.smiley4.strategygame.platform.game.domain.GameRepository
import io.github.smiley4.strategygame.platform.presence.PlayerPresenceError
import io.github.smiley4.strategygame.platform.presence.PlayerPresenceService
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.utils.KeyedMutex

internal class PlayerPresenceServiceImpl(
    private val playerPresenceRepository: PlayerPresenceRepository,
    private val gameRepository: GameRepository
) : PlayerPresenceService {

    val keyedMutex = KeyedMutex()

    override suspend fun connect(player: UserId, gameId: GameId) {
        keyedMutex.withLock(player) {

            val game = gameRepository.findById(gameId)
                ?: throw PlayerPresenceError.GameNotFound(player, gameId)

            val playerPresence = playerPresenceRepository.findByPlayer(player)
                ?: PlayerPresence(player)

            playerPresence.connectTo(game)

            playerPresenceRepository.save(playerPresence)
        }
    }


    override suspend fun disconnect(player: UserId) {
        keyedMutex.withLock(player) {

            val playerPresence = playerPresenceRepository.findByPlayer(player)
                ?: throw PlayerPresenceError.NotConnected(player)

            playerPresence.disconnect()

            playerPresenceRepository.save(playerPresence)
        }
    }

}