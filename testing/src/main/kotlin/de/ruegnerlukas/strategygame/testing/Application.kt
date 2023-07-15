package de.ruegnerlukas.strategygame.testing

import de.ruegnerlukas.strategygame.testing.lib.Config
import de.ruegnerlukas.strategygame.testing.lib.TestManager
import de.ruegnerlukas.strategygame.testing.tests.UserTest
import java.io.File

suspend fun main() {
    Config.load(File("./src/main/resources/config.local.json"))
    TestManager()
        .also {
            it.register(UserTest())
        }
        .runAll()
}