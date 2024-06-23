package io.github.smiley4.strategygame.backend.app.testdsl.actions

import io.github.smiley4.strategygame.backend.app.testdsl.GameTestContext
import io.github.smiley4.strategygame.backend.app.testutils.shouldMatchError
import io.github.smiley4.strategygame.backend.common.models.BuildingType
import io.github.smiley4.strategygame.backend.common.utils.coApply
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenSettings
import io.github.smiley4.strategygame.backend.common.models.CommandData
import io.github.smiley4.strategygame.backend.common.models.CreateCityCommandData
import io.github.smiley4.strategygame.backend.common.models.PlaceMarkerCommandData
import io.github.smiley4.strategygame.backend.common.models.PlaceScoutCommandData
import io.github.smiley4.strategygame.backend.common.models.ProductionQueueAddBuildingEntryCommandData
import io.github.smiley4.strategygame.backend.common.models.ProductionQueueAddSettlerEntryCommandData
import io.github.smiley4.strategygame.backend.common.models.ProductionQueueRemoveEntryCommandData
import io.github.smiley4.strategygame.backend.common.models.UpgradeSettlementTierCommandData
import io.github.smiley4.strategygame.backend.worlds.ports.provided.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.edge.JoinGame
import io.github.smiley4.strategygame.backend.worlds.edge.RequestConnectionToGame
import io.github.smiley4.strategygame.backend.worlds.edge.TurnSubmit


//=======================//
//      CREATE GAME      //
//=======================//

suspend fun GameTestContext.createGame() {
    createGame { }
}

suspend fun GameTestContext.createGame(block: CreateGameUserActionDsl.() -> Unit) {
    val dslConfig = CreateGameUserActionDsl().apply(block)
    val gameId = getActions().gameCreate.perform("test-game", dslConfig.worldSettings)
    dslConfig.users.forEachIndexed { index, userId ->
        getActions().gameJoin.perform(userId, gameId)
        getActions().gameConnect.perform(userId, gameId, index.toLong())
    }
    this.setActiveGame(gameId)
}


class CreateGameUserActionDsl {
    var worldSettings = WorldGenSettings.default()
    val users = mutableSetOf<String>()
    fun user(userId: String) {
        users.add(userId)
    }
}

//=======================//
//       JOIN GAME       //
//=======================//

suspend fun GameTestContext.joinGame(userId: String) {
    joinGame(userId) {}
}

suspend fun GameTestContext.joinGame(userId: String, block: JoinGameUserActionDsl.() -> Unit) {
    val dslConfig = JoinGameUserActionDsl(userId).also(block)
    var actualError: JoinGame.GameJoinActionErrors? = null
    try {
        getActions().gameJoin.perform(dslConfig.userId, dslConfig.gameId ?: getActiveGame()).also {
        }
    } catch (e: JoinGame.GameJoinActionErrors) {
        actualError = e
    }
    actualError shouldMatchError dslConfig.expectedError
}

class JoinGameUserActionDsl(val userId: String) {
    var gameId: String? = null
    var expectedError: JoinGame.GameJoinActionErrors? = null
}

//=======================//
//     CONNECT GAME      //
//=======================//

suspend fun GameTestContext.connectGame(userId: String, block: ConnectGameUserActionDsl.() -> Unit) {
    val dslConfig = ConnectGameUserActionDsl(userId).also(block)
    val gameId = dslConfig.gameId ?: getActiveGame()

    var actualRequestError: RequestConnectionToGame.GameRequestConnectionActionError? = null
    var actualConnectError: ConnectToGame.GameConnectActionError? = null

    try {
        getActions().gameRequestConnect.perform(dslConfig.userId, gameId)
        getActions().gameConnect.perform(dslConfig.userId, gameId, dslConfig.connectionId!!)
    } catch (e: RequestConnectionToGame.GameRequestConnectionActionError) {
        actualRequestError = e
    } catch (e: ConnectToGame.GameConnectActionError) {
        actualConnectError = e
    }
    actualRequestError shouldMatchError dslConfig.expectedRequestError
    actualConnectError shouldMatchError dslConfig.expectedConnectError
}


class ConnectGameUserActionDsl(val userId: String) {
    var gameId: String? = null
    var connectionId: Long? = null
    var expectedRequestError: RequestConnectionToGame.GameRequestConnectionActionError? = null
    var expectedConnectError: ConnectToGame.GameConnectActionError? = null

}

//=======================//
//     SUBMIT TURN       //
//=======================//

suspend fun GameTestContext.submitTurn(userId: String) {
    submitTurn(userId) {}
}


suspend fun GameTestContext.submitTurn(userId: String, block: suspend SubmitTurnUserActionDsl.() -> Unit) {
    val dslConfig = SubmitTurnUserActionDsl(userId).coApply(block)
    var actualError: TurnSubmit.TurnSubmitActionError? = null
    try {
        getActions().turnSubmit.perform(dslConfig.userId, dslConfig.gameId ?: getActiveGame(), dslConfig.commands)
    } catch (e: TurnSubmit.TurnSubmitActionError) {
        actualError = e
    }
    actualError shouldMatchError dslConfig.expectedError
}

class SubmitTurnUserActionDsl(val userId: String) {
    var gameId: String? = null
    var commands: MutableList<CommandData> = mutableListOf()
    var expectedError: TurnSubmit.TurnSubmitActionError? = null

    fun createCity(block: CreateCityCommandDsl.() -> Unit) {
        CreateCityCommandDsl().apply(block).also {
            commands.add(
                CreateCityCommandData(
                    q = it.q!!,
                    r = it.r!!,
                    name = it.name!!,
                    withNewProvince = true,
                )
            )
        }
    }

    fun createTown(block: CreateTownCommandDsl.() -> Unit) {
        CreateTownCommandDsl().apply(block).also {
            commands.add(
                CreateCityCommandData(
                    q = it.q!!,
                    r = it.r!!,
                    name = it.name!!,
                    withNewProvince = false,
                )
            )
        }
    }

    suspend fun upgradeSettlementTier(block: suspend UpgradeSettlementTierCommandDsl.() -> Unit) {
        UpgradeSettlementTierCommandDsl().coApply(block).also {
            commands.add(
                UpgradeSettlementTierCommandData(
                    cityId = it.cityId!!
                )
            )
        }
    }

    fun placeMarker(block: PlaceMarkerCommandDsl.() -> Unit) {
        PlaceMarkerCommandDsl().apply(block).also {
            commands.add(
                PlaceMarkerCommandData(
                    q = it.q!!,
                    r = it.r!!,
                    label = "test-marker"
                )
            )
        }
    }

    fun placeScout(block: PlaceScoutCommandDsl.() -> Unit) {
        PlaceScoutCommandDsl().apply(block).also {
            commands.add(
                PlaceScoutCommandData(
                    q = it.q!!,
                    r = it.r!!,
                )
            )
        }
    }

    suspend fun constructBuilding(block: suspend ProductionQueueAddBuildingEntryCommandDsl.() -> Unit) {
        ProductionQueueAddBuildingEntryCommandDsl().coApply(block).also {
            commands.add(
                ProductionQueueAddBuildingEntryCommandData(
                    cityId = it.cityId!!,
                    buildingType = it.building!!,
                )
            )
        }
    }

    suspend fun constructSettler(block: suspend ProductionQueueAddSettlerEntryCommandDsl.() -> Unit) {
        ProductionQueueAddSettlerEntryCommandDsl().coApply(block).also {
            commands.add(
                ProductionQueueAddSettlerEntryCommandData(
                    cityId = it.cityId!!,
                )
            )
        }
    }

    fun cancelProductionQueueEntry(block: ProductionQueueRemoveEntryCommandDsl.() -> Unit) {
        ProductionQueueRemoveEntryCommandDsl().apply(block).also {
            commands.add(
                ProductionQueueRemoveEntryCommandData(
                    cityId = it.cityId!!,
                    queueEntryId = it.entryId!!,
                )
            )
        }
    }

}

class CreateCityCommandDsl {
    var q: Int? = null
    var r: Int? = null
    var name: String? = null
}

class CreateTownCommandDsl {
    var q: Int? = null
    var r: Int? = null
    var name: String? = null
}

class UpgradeSettlementTierCommandDsl {
    var cityId: String? = null
}

class PlaceMarkerCommandDsl {
    var q: Int? = null
    var r: Int? = null
}

class PlaceScoutCommandDsl {
    var q: Int? = null
    var r: Int? = null
}

class ProductionQueueAddBuildingEntryCommandDsl {
    var cityId: String? = null
    var building: BuildingType? = null
}

class ProductionQueueAddSettlerEntryCommandDsl {
    var cityId: String? = null
}

class ProductionQueueRemoveEntryCommandDsl {
    var cityId: String? = null
    var entryId: String? = null
}

