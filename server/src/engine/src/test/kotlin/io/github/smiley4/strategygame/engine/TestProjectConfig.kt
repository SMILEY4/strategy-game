package io.github.smiley4.strategygame.engine

import io.github.smiley4.strategygame.engine.gameplay.GameplayEngine
import io.mockk.mockk
import org.koin.core.Koin
import org.koin.dsl.koinApplication
import org.koin.dsl.module

object TestProjectConfig {

    fun testDependencies(): Koin {

        val testDependencies = module {
            single<GameplayEngine> { mockk<GameplayEngine>() }
        }

        return koinApplication {
            modules(
                module { dependenciesEngine() },
                testDependencies
            )
        }.koin
    }

}