package de.ruegnerlukas.strategygame.backend.application

import de.ruegnerlukas.strategygame.backend.ArangoDbContainer
import de.ruegnerlukas.strategygame.backend.app.applicationDependencies
import io.github.smiley4.ktorwebsocketsextended.WSExtended
import io.github.smiley4.ktorwebsocketsextended.auth.WebsocketTicketAuthManager
import io.github.smiley4.ktorwebsocketsextended.session.WebSocketConnectionHandler
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.koin.dsl.koinApplication
import org.koin.test.KoinTest
import org.koin.test.check.checkModules

class KoinCheckModulesTest : KoinTest {

//    @Test
//    fun verifyKoinApp() {
//        val container = ArangoDbContainer.start()
//        try {
//            initWebsocketsExtended()
//            koinApplication {
//                modules(applicationDependencies)
//                checkModules()
//            }
//        } finally {
//            container.stop()
//        }
//    }

    private fun initWebsocketsExtended() {
        WSExtended::class.members.find { it.name == "initialize" }?.call(
            WSExtended::class.objectInstance,
            mockk<WebsocketTicketAuthManager>(),
            mockk<WebSocketConnectionHandler>()
        )
    }

}