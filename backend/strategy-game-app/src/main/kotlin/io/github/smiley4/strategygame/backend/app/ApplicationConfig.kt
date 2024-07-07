package io.github.smiley4.strategygame.backend.app

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MicrometerMonitoringService
import io.github.smiley4.strategygame.backend.common.monitoring.MonitoringService
import io.github.smiley4.strategygame.backend.gateway.ktorGateway
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.metrics.micrometer.MicrometerMetrics
import io.ktor.server.routing.PathSegmentConstantRouteSelector
import io.ktor.server.routing.PathSegmentParameterRouteSelector
import io.ktor.server.routing.RootRouteSelector
import io.ktor.server.routing.Route
import io.ktor.server.routing.RoutingApplicationCall
import io.micrometer.core.instrument.binder.jvm.ClassLoaderMetrics
import io.micrometer.core.instrument.binder.jvm.JvmGcMetrics
import io.micrometer.core.instrument.binder.jvm.JvmMemoryMetrics
import io.micrometer.core.instrument.binder.jvm.JvmThreadMetrics
import io.micrometer.core.instrument.binder.system.FileDescriptorMetrics
import io.micrometer.core.instrument.binder.system.ProcessorMetrics
import io.micrometer.core.instrument.binder.system.UptimeMetrics
import org.koin.core.logger.Logger
import org.koin.core.logger.MESSAGE
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin

/**
 * The main-module for configuring Ktor. Referenced in "application.conf".
 */
fun Application.module() {

    // setup koin
    install(Koin) {
        modules(applicationDependencies)
        logger(object : Logger() {
            val logger = Logging.create("Koin")
            override fun log(level: org.koin.core.logger.Level, msg: MESSAGE) {
                when (level) {
                    org.koin.core.logger.Level.DEBUG -> logger.debug(msg)
                    org.koin.core.logger.Level.INFO -> logger.info(msg)
                    org.koin.core.logger.Level.ERROR -> logger.error(msg)
                    org.koin.core.logger.Level.NONE -> Unit
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
                if (call is RoutingApplicationCall) {
                    tag("route", call.route.toDisplayString())
                }
            }
        }
    }

    // setup gateway
    ktorGateway()
}

private fun Route.toDisplayString(): String {
    var strRoute = ""

    var current: Route? = this
    while (current != null) {
        when (current.selector) {
            is PathSegmentConstantRouteSelector -> {
                strRoute = if (strRoute.isEmpty()) {
                    (current.selector as PathSegmentConstantRouteSelector).value
                } else {
                    "${(current.selector as PathSegmentConstantRouteSelector).value}/$strRoute"
                }
            }
            is PathSegmentParameterRouteSelector -> {
                strRoute = if (strRoute.isEmpty()) {
                    (current.selector as PathSegmentParameterRouteSelector).name
                } else {
                    "{${(current.selector as PathSegmentParameterRouteSelector).name}}/$strRoute"
                }
            }
            is RootRouteSelector -> {
                strRoute = if (strRoute.isEmpty()) {
                    "/"
                } else {
                    "/$strRoute"
                }
            }
        }
        current = current.parent
    }

    return strRoute
}