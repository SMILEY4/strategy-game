package io.github.smiley4.strategygame.identity.user.domain

import kotlin.uuid.Uuid

/**
 * Id of a user.
 */
@JvmInline
value class UserId(val id: Uuid = Uuid.random())