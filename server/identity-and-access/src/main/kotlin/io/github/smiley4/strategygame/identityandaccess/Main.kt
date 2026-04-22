package io.github.smiley4.io.github.smiley4.strategygame.identityandaccess

import io.github.oshai.kotlinlogging.KotlinLogging

val logger = KotlinLogging.logger {}

fun main() {
    logger.info { "Hello World starts" }
    for (i in 1..5) {
        logger.debug { "log at index $i" }
    }
}