package io.github.smiley4.strategygame.platform.game.domain

import kotlin.uuid.Uuid

@JvmInline
value class GameId(val value: Uuid = Uuid.random())