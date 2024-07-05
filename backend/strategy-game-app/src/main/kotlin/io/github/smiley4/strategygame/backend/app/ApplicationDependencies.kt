package io.github.smiley4.strategygame.backend.app

import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.gateway.dependenciesGateway
import io.github.smiley4.strategygame.backend.users.dependenciesUsers
import io.github.smiley4.strategygame.backend.worldgen.dependenciesWorldGen
import io.github.smiley4.strategygame.backend.ecosim.dependenciesEcoSim
import io.github.smiley4.strategygame.backend.engine.dependenciesEngine
import io.github.smiley4.strategygame.backend.pathfinding.dependenciesPathfinding
import io.github.smiley4.strategygame.backend.playerpov.dependenciesPlayerPoV
import io.github.smiley4.strategygame.backend.worlds.dependenciesWorlds
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
}