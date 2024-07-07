package io.github.smiley4.strategygame.backend.app

import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.test.KoinTest
import org.koin.test.check.checkModules

class KoinCheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {

        System.setProperty("ADMIN_PASSWORD", "password")
        Config.load("dev")

        val overwriteDependencies = module {
            single<ArangoDatabase> { mockk<ArangoDatabase>() }
        }

        koinApplication {
            modules(applicationDependencies, overwriteDependencies)
            createEagerInstances()
            checkModules()
        }
    }

}