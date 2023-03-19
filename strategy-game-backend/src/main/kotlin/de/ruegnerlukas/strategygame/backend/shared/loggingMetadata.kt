package de.ruegnerlukas.strategygame.backend.shared

fun mdcTraceId() = "traceId" to UUID.gen(12)

fun mdcGameId(gameId: String?) = "gameId" to (gameId ?: "?")

fun mdcUserId(userId: String?) = "userId" to (userId ?: "?")

fun mdcConnectionId(connectionId: Long?) = "connectionId" to (connectionId?.toString() ?: "?")