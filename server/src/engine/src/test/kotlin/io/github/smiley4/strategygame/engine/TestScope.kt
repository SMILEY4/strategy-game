package io.github.smiley4.strategygame.engine

import org.koin.core.Koin
import org.koin.core.parameter.ParametersDefinition
import org.koin.core.qualifier.Qualifier

suspend fun testScope(block: suspend TestScope.() -> Unit) {
    TestScope(TestProjectConfig.testDependencies()).block()
}

class TestScope(val dependencies: Koin) {

    /**
     * Get an instance of a registered dependency.
     */
    inline fun <reified T : Any> get(qualifier: Qualifier? = null, noinline parameters: ParametersDefinition? = null): T =
        dependencies.get<T>(qualifier, parameters)

}