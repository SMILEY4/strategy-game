package io.github.smiley4.strategygame.engine.tests

import io.github.smiley4.strategygame.engine.game.domain.GameNotificationService
import io.github.smiley4.strategygame.engine.game.infrastructure.WebsocketSessionManager
import io.github.smiley4.strategygame.engine.testScope
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.shouldBe

class WebsocketSessionTests : FreeSpec({

    "open and close connection should register correct users with games for notifications" {
        testScope {
            val sessionManager = get<WebsocketSessionManager>()
            val notificationService = get<GameNotificationService>()

            val userId = UserId()
            val gameId = GameId()

            notificationService.isReachable(gameId, userId) shouldBe false

            sessionManager.connect(userId, gameId)

            notificationService.isReachable(gameId, userId) shouldBe true

            sessionManager.disconnect(userId, gameId)

            notificationService.isReachable(gameId, userId) shouldBe false

        }
    }

    "user should only be able to connect to one game at a time" {
        testScope {
            val sessionManager = get<WebsocketSessionManager>()
            val notificationService = get<GameNotificationService>()

            val userId = UserId()
            val gameId1 = GameId()
            val gameId2 = GameId()

            notificationService.isReachable(gameId1, userId) shouldBe false
            notificationService.isReachable(gameId2, userId) shouldBe false

            sessionManager.connect(userId, gameId1)

            notificationService.isReachable(gameId1, userId) shouldBe true
            notificationService.isReachable(gameId2, userId) shouldBe false

            sessionManager.connect(userId, gameId2)

            notificationService.isReachable(gameId1, userId) shouldBe false
            notificationService.isReachable(gameId2, userId) shouldBe true

            sessionManager.disconnect(userId, gameId2)

            notificationService.isReachable(gameId1, userId) shouldBe false
            notificationService.isReachable(gameId2, userId) shouldBe false
        }
    }

})