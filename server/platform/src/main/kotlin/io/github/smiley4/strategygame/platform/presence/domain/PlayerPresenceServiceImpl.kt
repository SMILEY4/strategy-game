package io.github.smiley4.strategygame.platform.presence.domain

import io.github.smiley4.strategygame.platform.game.domain.GameRepository
import io.github.smiley4.strategygame.platform.presence.PlayerPresenceError
import io.github.smiley4.strategygame.platform.presence.PlayerPresenceService
import io.github.smiley4.strategygame.shared.GameId
import io.github.smiley4.strategygame.shared.UserId

internal class PlayerPresenceServiceImpl(
    private val playerPresenceRepository: PlayerPresenceRepository,
    private val gameRepository: GameRepository
) : PlayerPresenceService {

    override fun connect(player: UserId, gameId: GameId) {

        val game = gameRepository.findById(gameId)
            ?: throw PlayerPresenceError.GameNotFound(player, gameId)

        val playerPresence = playerPresenceRepository.findByPlayer(player)
            ?: PlayerPresence(player)

        playerPresence.connectTo(game)

        playerPresenceRepository.save(playerPresence)
    }


    override fun disconnect(player: UserId) {

        val playerPresence = playerPresenceRepository.findByPlayer(player)
            ?: throw PlayerPresenceError.NotConnected(player)

        playerPresence.disconnect()

        playerPresenceRepository.save(playerPresence)
    }

}