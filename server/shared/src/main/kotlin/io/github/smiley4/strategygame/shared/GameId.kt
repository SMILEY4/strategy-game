package io.github.smiley4.strategygame.shared

import kotlin.uuid.Uuid

@JvmInline
value class GameId(val value: Uuid = Uuid.Companion.random())