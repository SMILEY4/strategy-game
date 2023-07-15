package de.ruegnerlukas.strategygame.testing.lib.run

import de.ruegnerlukas.strategygame.testing.lib.build.TestCase
import de.ruegnerlukas.strategygame.testing.lib.build.TestCaseContext
import de.ruegnerlukas.strategygame.testing.lib.build.TestGroup

class TestRunner(private val groups: List<TestGroup>) {

    suspend fun runAll() {
        groups.forEach { group ->
            println("\n======== ${group.name} ========\n")
            group.testcases.forEach { test ->
                run(test)
                println()
            }
        }
    }

    private suspend fun run(testCase: TestCase) {
        println("RUN: ${testCase.name}")
        var error: Throwable? = null
        try {
            testCase.test(TestCaseContext())
        } catch (e: Exception) {
            e.printStackTrace()
            error = e
        }
        if(error == null) {
            println("Test finished successfully")
        } else {
            println("Test failed: $error")
        }
    }

}