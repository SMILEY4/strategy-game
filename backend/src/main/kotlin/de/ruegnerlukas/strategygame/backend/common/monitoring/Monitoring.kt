package de.ruegnerlukas.strategygame.backend.common.monitoring

object Monitoring {

    lateinit var service: MonitoringService

    inline fun <T> time(id: MetricId, block: () -> T): T {
        val ts = service.currentTime()
        try {
            return block()
        } finally {
            val te = service.currentTime()
            service.recordTimer(id, te - ts)
        }
    }

    fun gauge(id: MetricId, block: () -> Number) {
        service.recordGauge(id, block)
    }

}