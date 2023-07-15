package de.ruegnerlukas.strategygame.testing.lib

import de.ruegnerlukas.strategygame.testing.lib.build.TestGroup
import de.ruegnerlukas.strategygame.testing.lib.run.TestRunner

class TestManager {

    private val tests = mutableListOf<TestGroup>()

    fun register(test: TestGroup) {
        tests.add(test)
    }

    suspend fun runAll() {
        TestRunner(tests).runAll()
    }

}