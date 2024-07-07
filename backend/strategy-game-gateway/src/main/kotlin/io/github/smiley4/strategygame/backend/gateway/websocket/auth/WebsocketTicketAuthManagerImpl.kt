package io.github.smiley4.strategygame.backend.gateway.websocket.auth

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import io.github.smiley4.strategygame.backend.gateway.websocket.auth.WebsocketTicketAuthManager
import mu.KotlinLogging
import java.security.SecureRandom
import java.time.Instant
import java.util.Base64
import kotlin.time.Duration

internal class WebsocketTicketAuthManagerImpl(private val ticketTTL: Duration) : WebsocketTicketAuthManager {

    companion object {
        const val KEY_TOKEN = "token"
        const val KEY_VALID_UNTIL = "validUntil"
        const val TICKET_ID_LENGTH = 32
    }

    private val logger = KotlinLogging.logger(WebsocketTicketAuthManagerImpl::class.java.name)
    private val json = ObjectMapper()
    private val validTickets = mutableSetOf<String>()


    override fun generateTicket(additionalData: Map<String, Any?>): String {
        if (additionalData.containsKey(KEY_TOKEN)) {
            throw Exception("Additional data may not contain key '$KEY_TOKEN'")
        }
        if (additionalData.containsKey(KEY_VALID_UNTIL)) {
            throw Exception("Additional data may not contain key '$KEY_VALID_UNTIL'")
        }
        val ticketData = mutableMapOf<String, Any?>().also { data ->
            data.putAll(additionalData)
            data[KEY_TOKEN] = generateTicketId()
            data[KEY_VALID_UNTIL] = Instant.now().toEpochMilli() + ticketTTL.inWholeMilliseconds
        }
        return Base64.getUrlEncoder().encodeToString(json.writeValueAsString(ticketData).toByteArray()).also {
            validTickets.add(it)
        }
    }


    private fun generateTicketId(): String {
        val bytes = ByteArray(TICKET_ID_LENGTH)
        SecureRandom().nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }


    override fun validateAndConsumeTicket(ticket: String): Boolean {
        try {
            if (!validTickets.contains(ticket)) {
                return false
            }
            return extractData(ticket)[KEY_VALID_UNTIL]
                ?.let { it as Long }
                ?.let { it >= Instant.now().toEpochMilli() }
                ?: false
        } catch (e: Throwable) {
            logger.warn("Error during ticket-validation", e)
            return false
        } finally {
            validTickets.remove(ticket)
        }
    }


    override fun extractData(ticket: String): Map<String, Any?> {
        return json.readValue(String(Base64.getUrlDecoder().decode(ticket)), object : TypeReference<HashMap<String, Any?>>() {})
    }

}