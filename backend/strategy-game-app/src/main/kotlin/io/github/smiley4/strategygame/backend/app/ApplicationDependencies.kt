package io.github.smiley4.strategygame.backend.app

import io.github.smiley4.strategygame.backend.common.monitoring.MicrometerMonitoringService
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring
import io.github.smiley4.strategygame.backend.common.monitoring.MonitoringService
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.gateway.dependenciesGateway
import io.github.smiley4.strategygame.backend.users.dependenciesUsers
import io.github.smiley4.strategygame.backend.worldgen.dependenciesWorldGen
import io.github.smiley4.strategygame.backend.ecosim.dependenciesEcoSim
import io.github.smiley4.strategygame.backend.engine.dependenciesEngine
import io.github.smiley4.strategygame.backend.pathfinding.dependenciesPathfinding
import io.github.smiley4.strategygame.backend.playerpov.dependenciesPlayerPoV
import io.github.smiley4.strategygame.backend.worlds.dependenciesWorlds
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.dsl.module

val applicationDependencies = module {
    dependenciesEcoSim()
    dependenciesEngine()
    dependenciesGateway()
    dependenciesPathfinding()
    dependenciesPlayerPoV()
    dependenciesUsers()
    dependenciesWorldGen()
    dependenciesWorlds()
    single<GameConfig> { GameConfig.default() }
    single<MonitoringService> { MicrometerMonitoringService(get()).also { Monitoring.service = it } } withOptions { createdAtStart() }
}