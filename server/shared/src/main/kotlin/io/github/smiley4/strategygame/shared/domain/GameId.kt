package io.github.smiley4.strategygame.shared.domain

import kotlin.uuid.Uuid

/**
 * Id of a game.
 */
@JvmInline
value class GameId(val id: Uuid = Uuid.random())