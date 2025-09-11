package io.github.smiley4.strategygame.backend.app

import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MicrometerMonitoringService
import io.github.smiley4.strategygame.backend.common.monitoring.MonitoringService
import io.github.smiley4.strategygame.backend.gateway.ktorGateway
import io.ktor.server.application.Application
import io.ktor.server.application.PipelineCall
import io.ktor.server.application.install
import io.ktor.server.metrics.micrometer.MicrometerMetrics
import io.ktor.server.request.path
import io.micrometer.core.instrument.binder.jvm.ClassLoaderMetrics
import io.micrometer.core.instrument.binder.jvm.JvmGcMetrics
import io.micrometer.core.instrument.binder.jvm.JvmMemoryMetrics
import io.micrometer.core.instrument.binder.jvm.JvmThreadMetrics
import io.micrometer.core.instrument.binder.system.FileDescriptorMetrics
import io.micrometer.core.instrument.binder.system.ProcessorMetrics
import io.micrometer.core.instrument.binder.system.UptimeMetrics
import org.koin.core.logger.Level
import org.koin.core.logger.Logger
import org.koin.core.logger.MESSAGE
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin

/**
 * The main-module for configuring Ktor. Referenced in "application.conf".
 */
fun Application.module() {

    Config.load(APPLICATION_MODE)

    // setup koin
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

    // setup monitoring
    val monitoring by inject<MonitoringService>()
    if (monitoring is MicrometerMonitoringService) {
        install(MicrometerMetrics) {
            registry = (monitoring as MicrometerMonitoringService).getRegistry()
            meterBinders = listOf(
                ClassLoaderMetrics(),
                JvmMemoryMetrics(),
                JvmGcMetrics(),
                ProcessorMetrics(),
                JvmThreadMetrics(),
                FileDescriptorMetrics(),
                UptimeMetrics()
            )
            timers { call, _ ->
                if (call is PipelineCall) {
                    tag("route", call.request.path())
                }
            }
        }
    }

    // setup gateway
    ktorGateway()
}
