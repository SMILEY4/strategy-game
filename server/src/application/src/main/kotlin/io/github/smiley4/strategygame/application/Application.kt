package io.github.smiley4.strategygame.application

import io.github.oshai.kotlinlogging.KotlinLogging
import io.github.smiley4.strategygame.application.plugins.setupAuthentication
import io.github.smiley4.strategygame.application.plugins.setupContentNegotiation
import io.github.smiley4.strategygame.application.plugins.setupDependencyInjection
import io.github.smiley4.strategygame.application.plugins.setupKtorPlus
import io.github.smiley4.strategygame.application.plugins.setupOpenApi
import io.github.smiley4.strategygame.application.plugins.setupRouting
import io.github.smiley4.strategygame.application.plugins.setupWebSockets
import io.ktor.server.application.Application
import io.ktor.server.netty.EngineMain

/**
 * Entry point of the application
 */
fun main(args: Array<String>) {
    EngineMain.main(
        args
            .toMutableSet()
            .also {
                it.add("-config=application.conf")
            }
            .toTypedArray()
    )
}

/**
 * The main-module for configuring the application. Referenced in "resources/application.conf".
 */
@Suppress("unused")
fun Application.module() {

    val logger = KotlinLogging.logger(this.javaClass.name)
    logger.info { "Starting Server..." }

    setupDependencyInjection()
    setupAuthentication()
    val json = setupContentNegotiation()
    setupKtorPlus(json)
    setupOpenApi(json)
    setupWebSockets()
    setupRouting()
}
