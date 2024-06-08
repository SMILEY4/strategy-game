package io.github.smiley4.strategygame.backend.app.application

import io.github.smiley4.ktorwebsocketsextended.WSExtended
import io.github.smiley4.ktorwebsocketsextended.auth.WebsocketTicketAuthManager
import io.github.smiley4.ktorwebsocketsextended.session.WebSocketConnectionHandler
import io.mockk.mockk
import org.koin.test.KoinTest

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