package io.github.smiley4.strategygame.backend.gateway.websocket.auth

/**
 * Handles tickets used for authenticating websocket requests.
 * Authentication Process:
 * - client calls (authenticated) rest-endpoint to obtain authorization ticket
 * - server generates this ticket ([WebsocketTicketAuthManager.generateTicket])
 * - server stores this ticket and returns it to the client
 * - the client opens the websocket connection and sends the ticket as part of the url (e.g... as query-parameter)
 * - the server checks if the ticket is known, not already used and still valid ([WebsocketTicketAuthManager.validateAndConsumeTicket])
 * - server forgets ticket -> ticket is only valid once
 */
interface WebsocketTicketAuthManager {

    /**
     * Generate a new valid ticket containing the given additional data
     */
    fun generateTicket(additionalData: Map<String, Any?>): String

    /**
     * Validate the given ticket and invalidates it
     */
    fun validateAndConsumeTicket(ticket: String): Boolean

    /**
     * Extract the additional data from the given valid ticket
     */
    fun extractData(ticket: String): Map<String,Any?>

}