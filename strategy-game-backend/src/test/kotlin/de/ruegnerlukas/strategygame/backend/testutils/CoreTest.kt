package de.ruegnerlukas.strategygame.backend.testutils

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.PlayerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.floats.shouldBeWithinPercentageOf
import io.kotest.matchers.shouldBe


internal suspend fun coreTest(block: suspend CoreTest.() -> Unit) {
	val database = TestUtilsFactory.createTestDatabase()
	CoreTest(database).apply { block() }
}

internal suspend fun coreTestWithGame(settings: WorldSettings = WorldSettings.default(), block: suspend CoreTest.(gameId: String) -> Unit) {
	val database = TestUtilsFactory.createTestDatabase()
	CoreTest(database).apply {
		val gameId = createGame(settings)
		block(gameId)
	}
}




internal class CoreTest(
	private val database: ArangoDatabase
) {

	private var connectionIdCounter: Int = 1


	/**
	 * create a new game, return the game-id
	 */
	suspend fun createGame(settings: WorldSettings = WorldSettings.default()): String {
		return TestActions.gameCreateAction(database).perform(settings).also { gameId ->
			TestUtils.getGame(database, gameId).let {
				it.key shouldBe gameId
				it.turn shouldBe 0
			}
		}
	}


	/**
	 * create a new game with only land-tiles, return the game-id
	 */
	suspend fun createGameOnlyLand(): String {
		return createGame(WorldSettings(seed = 42, singleTileType = TileType.LAND))
	}


	/**
	 * create a new game with only water-tiles, return the game-id
	 */
	suspend fun createGameOnlyWater(): String {
		return createGame(WorldSettings(seed = 42, singleTileType = TileType.WATER))
	}


	/**
	 * join the game as the user and return the country-id of the player
	 */
	suspend fun joinGame(userId: String, gameId: String): String {
		TestActions.gameJoinAction(database).perform(userId, gameId).also {
			it shouldBeOk true
		}
		return TestUtils.getCountry(database, gameId, userId).key!!
	}


	/**
	 * join the game as the user. Expect [GameJoinAction.UserAlreadyPlayerError]
	 */
	suspend fun joinGame_expectAlreadyPlayer(userId: String, gameId: String) {
		TestActions.gameJoinAction(database).perform(userId, gameId).also {
			it shouldBeError GameJoinAction.UserAlreadyPlayerError
		}
	}


	/**
	 * join the game as the user. Expect [GameJoinAction.GameNotFoundError]
	 */
	suspend fun joinGame_expectGameNotFound(userId: String, gameId: String) {
		TestActions.gameJoinAction(database).perform(userId, gameId).also {
			it shouldBeError GameJoinAction.GameNotFoundError
		}
	}


	/**
	 * Create a new game with default settings and join the game as the user
	 */
	suspend fun createAndJoinGame(userId: String): String {
		return createGame().also { gameId ->
			joinGame(userId, gameId)
		}
	}


	/**
	 * Request to connect to the game
	 */
	suspend fun requestConnect_expectOk(userId: String, gameId: String) {
		TestActions.gameRequestConnectionAction(database)
			.perform(userId, gameId) shouldBeOk true
	}


	/**
	 * Request to connect to the game, expect [GameRequestConnectionAction.NotParticipantError]
	 */
	suspend fun requestConnect_expectNotParticipant(userId: String, gameId: String) {
		TestActions.gameRequestConnectionAction(database)
			.perform(userId, gameId) shouldBeError GameRequestConnectionAction.NotParticipantError
	}


	/**
	 * Request to connect to the game, expect [GameRequestConnectionAction.AlreadyConnectedError]
	 */
	suspend fun requestConnect_expectAlreadyConnected(userId: String, gameId: String) {
		TestActions.gameRequestConnectionAction(database)
			.perform(userId, gameId) shouldBeError GameRequestConnectionAction.AlreadyConnectedError
	}


	/**
	 * Request to connect to the game, expect [GameRequestConnectionAction.GameNotFoundError]
	 */
	suspend fun requestConnect_expectGameNotFound(userId: String, gameId: String) {
		TestActions.gameRequestConnectionAction(database)
			.perform(userId, gameId) shouldBeError GameRequestConnectionAction.GameNotFoundError
	}


	/**
	 * Connect to the given game
	 */
	suspend fun connect(userId: String, gameId: String) {
		TestActions.gameConnectAction(database).perform(userId, gameId, connectionIdCounter++)
	}


	/**
	 * Join and connect to the game. Return the country-id of the player.
	 */
	suspend fun joinAndConnect(userId: String, gameId: String): String {
		joinGame(userId, gameId)
		connect(userId, gameId)
		return TestUtils.getCountry(database, gameId, userId).getKeyOrThrow()
	}


	/**
	 * List all games of the user and expect the given game-ids
	 */
	suspend fun listGames_expect(userId: String, gameIds: List<String>) {
		TestActions.gamesListAction(database).perform(userId).let {
			it shouldHaveSize gameIds.size
			it shouldContainExactlyInAnyOrder gameIds
		}
	}


	/**
	 * Submit the turn/commands
	 */
	suspend fun submitTurn(userId: String, gameId: String, commands: List<PlayerCommand>) {
		TestActions.turnSubmitAction(database).perform(userId, gameId, commands) shouldBeOk true
	}


	/**
	 * Resolve the given commands
	 */
	suspend fun resolveCommands(gameId: String, commands: List<CommandEntity<*>>) {
		TestUtils.withGameExtended(database, gameId) {
			TestActions.resolveCommandsAction(database).perform(it, commands)
		}.let { result ->
			result shouldBeOk true
			(result as Either.Right).value shouldHaveSize 0
		}
	}


	/**
	 * Resolve the given commands and expect the given (command resolution) error messages
	 */
	suspend fun resolveCommands_expectOkWithErrors(gameId: String, commands: List<CommandEntity<*>>, expectedErrors: List<String>) {
		TestUtils.withGameExtended(database, gameId) {
			TestActions.resolveCommandsAction(database).perform(it, commands)
		}.let { result ->
			result shouldBeOk true
			(result as Either.Right).value.let { errors ->
				errors shouldHaveSize expectedErrors.size
				errors.map { it.errorMessage } shouldContainExactlyInAnyOrder expectedErrors
			}
		}
	}


	/**
	 * Resolve the given commands and expect [ResolveCommandsAction.TileNotFoundError]
	 */
	suspend fun resolveCommands_expectTileNotFoundError(gameId: String, commands: List<CommandEntity<*>>) {
		TestUtils.withGameExtended(database, gameId) {
			TestActions.resolveCommandsAction(database).perform(it, commands)
		} shouldBeError ResolveCommandsAction.TileNotFoundError
	}


	/**
	 * manually end the turn of the given game
	 */
	suspend fun endTurn(gameId: String) {
		TestActions.turnEndAction(database).perform(gameId) shouldBeOk true
	}


	/**
	 * manually set the amount of money the country has
	 * */
	suspend fun setCountryMoney(countryId: String, amount: Float) {
		TestUtils.getCountry(database, countryId).let { country ->
			country.resources.money = amount
			TestUtils.updateCountry(database, country)
		}
	}


	/**
	 * expect the game to have all players with the given user-ids
	 */
	suspend fun expectPlayers(gameId: String, userIds: List<String>) {
		TestUtils.getPlayers(database, gameId).let { players ->
			players shouldHaveSize userIds.size
			players.map { it.userId } shouldContainExactlyInAnyOrder userIds
			players.forEach { player ->
				player.connectionId shouldBe null
				player.state shouldBe PlayerEntity.STATE_PLAYING
			}
		}
	}


	/**
	 * expect the given turn of the game to have all given commands. A command here is a pair of "command-type" and "countryId"
	 */
	suspend fun expectCommands(gameId: String, turn: Int, commandTypeAndCountry: List<Pair<String, String>>) {
		TestUtils.getCommands(database, gameId, turn).let { commands ->
			commands shouldHaveSize commandTypeAndCountry.size
			commands.map { it.countryId } shouldContainExactlyInAnyOrder commandTypeAndCountry.map { it.second }
			commands.map { it.data.type } shouldContainExactlyInAnyOrder commandTypeAndCountry.map { it.first }
		}
	}


	/**
	 * expect the given game to (only) have cities on the given tile-locations
	 */
	suspend fun expectCities(gameId: String, cityPositions: List<Pair<Int, Int>>) {
		TestUtils.getCities(database, gameId) shouldHaveSize cityPositions.size
		cityPositions.forEach { pos ->
			TestUtils.getCitiesAt(database, gameId, pos.first, pos.second).size shouldBe 1
		}
	}


	/**
	 * expect the given country to have the given amount of money
	 */
	suspend fun expectCountryMoney(countryId: String, amountMoney: Float) {
		TestUtils.getCountry(database, countryId).resources.money.shouldBeWithinPercentageOf(amountMoney, 0.01)
	}


	/**
	 * expect the given game to (only) have markers on the given tile-locations
	 */
	suspend fun expectMarkers(gameId: String, markerPositions: List<Pair<Int, Int>>) {
		TestUtils.getMarkers(database, gameId) shouldHaveSize markerPositions.size
		markerPositions.forEach { pos ->
			TestUtils.getMarkersAt(database, gameId, pos.first, pos.second).size shouldBe 1
		}
	}


	/**
	 * expect the current turn of the game to be the given turn
	 */
	suspend fun expectTurn(gameId: String, turn: Int) {
		TestUtils.getGame(database, gameId).turn shouldBe turn
	}


}