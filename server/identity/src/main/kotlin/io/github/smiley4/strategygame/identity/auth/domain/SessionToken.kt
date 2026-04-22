package io.github.smiley4.strategygame.identity.auth.domain

import kotlin.uuid.Uuid

@JvmInline
value class SessionToken(val value: Uuid = Uuid.random())