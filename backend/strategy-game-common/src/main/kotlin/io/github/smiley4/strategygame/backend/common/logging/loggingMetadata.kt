package io.github.smiley4.strategygame.backend.common.logging

import io.github.smiley4.strategygame.backend.common.utils.Id


fun mdcTraceId() = "traceId" to Id.gen(12)

fun mdcGameId(gameId: String?) = "gameId" to (gameId ?: "?")

fun mdcUserId(userId: String?) = "userId" to (userId ?: "?")

fun mdcConnectionId(connectionId: Long?) = "connectionId" to (connectionId?.toString() ?: "?")