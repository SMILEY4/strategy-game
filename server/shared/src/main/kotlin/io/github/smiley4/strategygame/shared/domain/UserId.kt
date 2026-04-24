package io.github.smiley4.strategygame.shared.domain

import kotlin.uuid.Uuid

/**
 * Id of a user.
 */
@JvmInline
value class UserId(val id: Uuid = Uuid.Companion.random())