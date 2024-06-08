package io.github.smiley4.strategygame.backend.app.testdsl.assertions

import io.github.smiley4.strategygame.backend.app.testdsl.GameTestContext
import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getPlayers
import io.github.smiley4.strategygame.backend.common.models.PlayerState
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe


suspend fun GameTestContext.expectPlayers(
    expectation: ElementExpectation = ElementExpectation.EXACTLY,
    block: PlayersAssertionDsl.() -> Unit
) {
    val dslConfig = PlayersAssertionDsl().apply(block)
    val expectedPlayers = dslConfig.players
    getPlayers().also { actualPlayers ->
        when (expectation) {
            ElementExpectation.EXACTLY -> {
                actualPlayers shouldHaveSize expectedPlayers.size
                actualPlayers.map { it.userId } shouldContainExactlyInAnyOrder expectedPlayers.map { it.userId }
            }
            ElementExpectation.AT_LEAST -> {
                actualPlayers.map { it.userId } shouldContain expectedPlayers.map { it.userId }
            }
        }
        expectedPlayers.forEach { expectedPlayer ->
            val actualPlayer = actualPlayers.find { it.userId == expectedPlayer.userId }!!
            actualPlayer.connectionId shouldBe expectedPlayer.connectionId
            actualPlayer.state shouldBe expectedPlayer.state
        }
    }
}

suspend fun GameTestContext.expectPlayer(block: PlayerAssertionDsl.() -> Unit) {
    val dslConfig = PlayerAssertionDsl().apply(block)
    getPlayers().also { actualPlayers ->
        actualPlayers.map { it.userId } shouldContain dslConfig.userId
        actualPlayers.find { it.userId == dslConfig.userId }?.also { actualPlayer ->
            actualPlayer.connectionId shouldBe dslConfig.connectionId
            actualPlayer.state shouldBe dslConfig.state
        }
    }
}

class PlayersAssertionDsl {
    val players = mutableListOf<PlayerAssertionDsl>()
    fun player(block: PlayerAssertionDsl.() -> Unit) {
        players.add(PlayerAssertionDsl().apply(block))
    }
}

class PlayerAssertionDsl {
    var userId: String? = null
    var connectionId: Long? = null
    var state: PlayerState? = null
}