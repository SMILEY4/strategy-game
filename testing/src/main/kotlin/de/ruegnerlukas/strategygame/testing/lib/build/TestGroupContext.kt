package de.ruegnerlukas.strategygame.testing.lib.build

class TestGroupContext {

    private val testcases = mutableListOf<TestCase>()

    fun getTestCases(): List<TestCase> = testcases
    
    operator fun String.invoke(test: suspend TestCaseContext.() -> Unit) {
        testcases.add(TestCase(this, test))
    }
    
}
