package io.github.smiley4.strategygame.engine.tests

import io.github.smiley4.strategygame.engine.game.DeleteGameError
import io.github.smiley4.strategygame.engine.game.GameEngineService
import io.github.smiley4.strategygame.engine.game.SubmitTurnError
import io.github.smiley4.strategygame.engine.game.domain.GameRepository
import io.github.smiley4.strategygame.engine.testScope
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.UserId
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe

class GameManagementTests : FreeSpec({

    "game handling" - {

        "creating games should succeed" {
            testScope {
                val service = get<GameEngineService>()
                val repository = get<GameRepository>()

                val user1 = UserId()
                val user2 = UserId()
                val user3 = UserId()

                val gameId1 = service.create(MatchId(), listOf(user1, user2))
                val gameId2 = service.create(MatchId(), listOf(user2, user3))

                repository.findById(gameId1) shouldNotBe null
                repository.findById(gameId1)?.toSnapshot()?.also {
                    it.currentTurn shouldBe 0
                    it.pendingCommands shouldBe emptyMap()
                    it.players shouldContainExactlyInAnyOrder setOf(user1, user2)
                }

                repository.findById(gameId2) shouldNotBe null
                repository.findById(gameId2)?.toSnapshot()?.also {
                    it.currentTurn shouldBe 0
                    it.pendingCommands shouldBe emptyMap()
                    it.players shouldContainExactlyInAnyOrder setOf(user2, user3)
                }
            }
        }

        "deleting a game should succeed" {
            testScope {
                val service = get<GameEngineService>()
                val repository = get<GameRepository>()

                val user1 = UserId()
                val user2 = UserId()
                val gameId = service.create(MatchId(), listOf(user1, user2))

                repository.findById(gameId) shouldNotBe null

                service.delete(gameId)

                repository.findById(gameId) shouldBe null
            }
        }

        "deleting a not existing game should fail" {
            testScope {
                val service = get<GameEngineService>()

                shouldThrow<DeleteGameError.NotFound> {
                    service.delete(GameId())
                }
            }
        }

    }

    "submitting turns" - {

        "for unknown game should fail" {
            testScope {
                val service = get<GameEngineService>()

                shouldThrow<SubmitTurnError.NotFound> {
                    service.submitTurn(UserId(), GameId(), emptyList())
                }
            }
        }

        "by non-participant should fail" {
            testScope {
                val service = get<GameEngineService>()

                val player = UserId()
                val outsider = UserId()
                val gameId = service.create(MatchId(), listOf(player))

                shouldThrow<SubmitTurnError.NotParticipant> {
                    service.submitTurn(outsider, gameId, emptyList())
                }
            }
        }

        "when already submitted should fail" {
            testScope {
                val service = get<GameEngineService>()
                val repository = get<GameRepository>()

                val user1 = UserId()
                val user2 = UserId()
                val gameId = service.create(MatchId(), listOf(user1, user2))

                service.submitTurn(user1, gameId, emptyList())

                shouldThrow<SubmitTurnError.AlreadySubmitted> {
                    service.submitTurn(user1, gameId, emptyList())
                }

                repository.findById(gameId)?.toSnapshot()?.also {
                    it.pendingCommands.keys shouldContainExactlyInAnyOrder listOf(user1)
                    it.currentTurn shouldBe 0
                }
            }
        }

        "should end turn only when last player submitted their turn" {
            testScope {
                val service = get<GameEngineService>()
                val repository = get<GameRepository>()

                val user1 = UserId()
                val user2 = UserId()
                val gameId = service.create(MatchId(), listOf(user1, user2))

                val turnBefore = repository.findById(gameId)!!.toSnapshot().currentTurn
                repository.findById(gameId)?.toSnapshot()?.also {
                    it.pendingCommands.keys shouldContainExactlyInAnyOrder emptyList()
                }

                service.submitTurn(user1, gameId, emptyList())

                val turnAfter1 = repository.findById(gameId)!!.toSnapshot().currentTurn
                repository.findById(gameId)?.toSnapshot()?.also {
                    it.pendingCommands.keys shouldContainExactlyInAnyOrder listOf(user1)
                }

                service.submitTurn(user2, gameId, emptyList())

                val turnAfter2 = repository.findById(gameId)!!.toSnapshot().currentTurn
                repository.findById(gameId)?.toSnapshot()?.also {
                    it.pendingCommands.keys shouldContainExactlyInAnyOrder emptyList()
                }

                turnAfter1 shouldBe turnBefore
                turnAfter2 shouldBe (turnBefore + 1)
            }
        }

    }

})
