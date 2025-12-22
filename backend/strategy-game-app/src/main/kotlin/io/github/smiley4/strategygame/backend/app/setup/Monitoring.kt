package io.github.smiley4.strategygame.backend.app.setup

import io.github.smiley4.strategygame.backend.common.monitoring.MicrometerMonitoringService
import io.github.smiley4.strategygame.backend.common.monitoring.MonitoringService
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
import org.koin.ktor.ext.inject

/**
 * Configure monitoring.
 */
fun Application.setupMonitoring() {
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
}