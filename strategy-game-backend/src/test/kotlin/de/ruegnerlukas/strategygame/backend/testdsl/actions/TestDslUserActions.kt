package de.ruegnerlukas.strategygame.backend.testdsl.actions

import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.common.utils.coApply
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.CommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueAddBuildingEntryCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueAddSettlerEntryCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueRemoveEntryCommandData
import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeError
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings


//=======================//
//      CREATE GAME      //
//=======================//

suspend fun GameTestContext.createGame() {
    createGame { }
}

suspend fun GameTestContext.createGame(block: CreateGameUserActionDsl.() -> Unit) {
    val dslConfig = CreateGameUserActionDsl().apply(block)
    val gameId = getActions().gameCreate.perform(dslConfig.worldSettings)
    dslConfig.users.forEachIndexed { index, userId ->
        getActions().gameJoin.perform(userId, gameId)
        getActions().gameConnect.perform(userId, gameId, index.toLong())
    }
    this.setActiveGame(gameId)
}


class CreateGameUserActionDsl {
    var worldSettings = WorldSettings.default()
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
    getActions().gameJoin.perform(dslConfig.userId, dslConfig.gameId ?: getActiveGame()).also {
        if (dslConfig.expectedError == null) {
            it shouldBeOk true
        } else {
            it shouldBeError dslConfig.expectedError
        }
    }
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
    getActions().gameRequestConnect.perform(dslConfig.userId, gameId)
        .also {
            if (dslConfig.expectedRequestError == null) {
                it shouldBeOk true
            } else {
                it shouldBeError dslConfig.expectedRequestError
            }
        }
        .also { result ->
            if (result.isRight()) {
                getActions().gameConnect.perform(dslConfig.userId, gameId, dslConfig.connectionId!!)
                    .also {
                        if (dslConfig.expectedConnectError == null) {
                            it shouldBeOk true
                        } else {
                            it shouldBeError dslConfig.expectedConnectError
                        }
                    }
            }
        }
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
    try {
        getActions().turnSubmit.perform(dslConfig.userId, dslConfig.gameId ?: getActiveGame(), dslConfig.commands).also {
            if (dslConfig.expectedError == null) {
                it shouldBeOk true
            } else {
                it shouldBeError dslConfig.expectedError
            }
        }
    } catch (ignore: Exception) {
    }
}

class SubmitTurnUserActionDsl(val userId: String) {
    var gameId: String? = null
    var commands: MutableList<CommandData> = mutableListOf()
    var expectedError: TurnSubmitAction.TurnSubmitActionError? = null

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

    fun placeMarker(block: PlaceMarkerCommandDsl.() -> Unit) {
        PlaceMarkerCommandDsl().apply(block).also {
            commands.add(
                PlaceMarkerCommandData(
                    q = it.q!!,
                    r = it.r!!,
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

