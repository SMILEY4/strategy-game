package de.ruegnerlukas.strategygame.backend.integration

import de.ruegnerlukas.strategygame.backend.app.applicationDependencies
import org.junit.jupiter.api.Test
import org.koin.dsl.koinApplication
import org.koin.test.KoinTest
import org.koin.test.check.checkModules

class KoinCheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {
        koinApplication {
            modules(applicationDependencies)
            checkModules()
        }
    }

}