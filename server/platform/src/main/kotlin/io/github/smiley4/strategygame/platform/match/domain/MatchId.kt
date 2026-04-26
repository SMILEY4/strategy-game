package io.github.smiley4.strategygame.platform.match.domain

import kotlin.uuid.Uuid

@JvmInline
value class MatchId(val value: Uuid = Uuid.random())