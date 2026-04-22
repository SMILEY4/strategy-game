package io.github.smiley4.strategygame.platform.game.domain

import io.github.smiley4.strategygame.shared.GameId
import io.github.smiley4.strategygame.shared.UserId

internal interface GameRepository {
    fun save(game: Game)
    fun delete(game: Game)
    fun findById(id: GameId): Game?
    fun findByPlayer(id: UserId): List<Game>
}