package de.ruegnerlukas.strategygame.backend.shared

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.core.filter.Filter
import ch.qos.logback.core.spi.FilterReply


class LogSuppressor : Filter<ILoggingEvent>() {

    private val logger = Logging.create()

    override fun decide(event: ILoggingEvent): FilterReply {
        if (event.level == Level.WARN) {
            return getWarnReplacement(event).let { replacement ->
                if (replacement == null) {
                    FilterReply.NEUTRAL
                } else {
                    logger.warn(replacement)
                    FilterReply.DENY
                }
            }
        }
        return FilterReply.NEUTRAL
    }

    private fun getWarnReplacement(event: ILoggingEvent): String? {
        if (event.message.contains("Failed to select the application-level protocol")) {
            return "Failed to select the application-level protocol"
        }
        if (event.message.contains("An exceptionCaught() event was fired, and it reached at the tail of the pipeline")) {
            return "An exceptionCaught() event was fired, and it reached at the tail of the pipeline"
        }
        if (event.message.contains("TLS handshake failed")) {
            return "TLS handshake failed"
        }
        return null
    }

}

