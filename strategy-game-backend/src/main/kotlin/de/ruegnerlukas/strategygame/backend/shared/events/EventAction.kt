package de.ruegnerlukas.strategygame.backend.shared.events

class EventAction<CONTEXT, PAYLOAD, RESULT>(private val action: suspend (context: CONTEXT, payload: PAYLOAD) -> RESULT) {

    suspend fun run(context: CONTEXT, payload: PAYLOAD): RESULT {
        return action(context, payload)
    }

}