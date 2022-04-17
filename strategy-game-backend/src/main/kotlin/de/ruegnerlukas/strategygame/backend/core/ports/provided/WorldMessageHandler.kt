package de.ruegnerlukas.strategygame.backend.core.ports.provided

import de.ruegnerlukas.strategygame.backend.core.ports.models.JoinWorldPayload

interface WorldMessageHandler {

	suspend fun handleJoinWorld(connectionId: Int, payload: JoinWorldPayload);

}