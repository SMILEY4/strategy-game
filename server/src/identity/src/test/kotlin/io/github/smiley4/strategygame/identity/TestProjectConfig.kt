package io.github.smiley4.strategygame.identity

import org.koin.core.Koin
import org.koin.dsl.koinApplication
import org.koin.dsl.module

object TestProjectConfig {

    fun testDependencies(): Koin {

        val testDependencies = module {
            // ...
        }

        return koinApplication {
            modules(
                module { dependenciesIdentity() },
                testDependencies
            )
        }.koin
    }

}