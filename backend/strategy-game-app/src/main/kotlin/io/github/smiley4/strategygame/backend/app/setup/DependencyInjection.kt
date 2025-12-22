package io.github.smiley4.strategygame.backend.app.setup

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MicrometerMonitoringService
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring
import io.github.smiley4.strategygame.backend.common.monitoring.MonitoringService
import io.github.smiley4.strategygame.backend.engine.dependenciesEngine
import io.github.smiley4.strategygame.backend.playerpov.dependenciesPlayerPoV
import io.github.smiley4.strategygame.backend.sessions.dependenciesSessions
import io.github.smiley4.strategygame.backend.users.dependenciesUsers
import io.github.smiley4.strategygame.backend.worldgen.dependenciesWorldGen
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.micrometer.prometheusmetrics.PrometheusConfig
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry
import org.koin.core.logger.Level
import org.koin.core.logger.Logger
import org.koin.core.logger.MESSAGE
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin

val applicationDependencies = module {
    dependenciesEngine()
    dependenciesPlayerPoV()
    dependenciesUsers()
    dependenciesWorldGen()
    dependenciesSessions()
    single<PrometheusMeterRegistry> { PrometheusMeterRegistry(PrometheusConfig.DEFAULT) }
    single<MonitoringService> { MicrometerMonitoringService(get()).also { Monitoring.service = it } } withOptions { createdAtStart() }
}

/**
 * Configure dependency injection.
 */
fun Application.setupDependencyInjection() {
    install(Koin) {
        modules(applicationDependencies)
        logger(object : Logger() {
            val logger = Logging.create("Koin")
            override fun display(level: Level, msg: MESSAGE) {
                when (level) {
                    Level.DEBUG -> logger.debug(msg)
                    Level.INFO -> logger.info(msg)
                    Level.ERROR -> logger.error(msg)
                    Level.WARNING -> logger.warn(msg)
                    Level.NONE -> Unit
                }
            }
        })
    }
}