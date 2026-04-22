package io.github.smiley4.strategygame.platform.presence.domain

import io.github.smiley4.strategygame.platform.game.domain.Game
import io.github.smiley4.strategygame.platform.presence.PlayerPresenceError
import io.github.smiley4.strategygame.shared.GameId
import io.github.smiley4.strategygame.shared.UserId

internal class PlayerPresence private constructor(
    val player: UserId,
    var connectedGame: GameId?
) {

    constructor(player: UserId) : this(
        player = player,
        connectedGame = null
    )

    constructor(snapshot: PlayerPresenceSnapshot) : this(
        player = snapshot.player,
        connectedGame = snapshot.connectedGame
    )

    fun connectTo(game: Game) {
        if (connectedGame != null) {
            throw PlayerPresenceError.AlreadyConnected(player)
        }
        if (!game.isMember(player)) {
            throw PlayerPresenceError.NotMember(player, game.getId())
        }
        connectedGame = game.getId()
    }

    fun disconnect() {
        if(connectedGame == null) {
            throw PlayerPresenceError.NotConnected(player)
        }
        connectedGame = null
    }

    fun toSnapshot() = PlayerPresenceSnapshot(
        player = player,
        connectedGame = connectedGame
    )

}