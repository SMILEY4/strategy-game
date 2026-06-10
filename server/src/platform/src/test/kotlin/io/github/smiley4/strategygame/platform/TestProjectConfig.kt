package io.github.smiley4.strategygame.platform

import io.github.smiley4.strategygame.platform.match.domain.GameEngineClient
import io.mockk.mockk
import org.koin.core.Koin
import org.koin.dsl.koinApplication
import org.koin.dsl.module

object TestProjectConfig {

    fun testDependencies(): Koin {

        val testDependencies = module {
            single<GameEngineClient> { mockk<GameEngineClient>() }
        }

        return koinApplication {
            modules(
                module { dependenciesPlatform() },
                testDependencies
            )
        }.koin
    }

}