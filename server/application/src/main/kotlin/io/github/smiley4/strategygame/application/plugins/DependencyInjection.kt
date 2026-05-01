package io.github.smiley4.strategygame.application.plugins

import io.github.oshai.kotlinlogging.KotlinLogging
import io.github.smiley4.strategygame.identity.dependenciesIdentity
import io.ktor.server.application.Application
import io.ktor.server.application.install
import org.koin.core.logger.Level
import org.koin.core.logger.Logger
import org.koin.core.logger.MESSAGE
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin

fun Application.setupDependencyInjection() {
    install(Koin) {
        modules(dependencies())
        logger(object : Logger() {
            val logger = KotlinLogging.logger("Koin")
            override fun display(level: Level, msg: MESSAGE) {
                when (level) {
                    Level.DEBUG -> logger.debug { msg }
                    Level.INFO -> logger.info { msg }
                    Level.ERROR -> logger.error { msg }
                    Level.WARNING -> logger.warn { msg }
                    Level.NONE -> Unit
                }
            }
        })
    }
}

fun dependencies() = module {
    dependenciesIdentity()
}
