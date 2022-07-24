package de.ruegnerlukas.strategygame.backend.core

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.world.WorldSettings
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.UUID
import de.ruegnerlukas.strategygame.backend.testutils.TestActions
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize

class CommandResolutionTest : StringSpec({

	"place marker" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)
		val resolveCommands = TestActions.resolveCommandsAction(database)

		// create a new game
		val gameId = createGame.perform(WorldSettings(seed = 42, singleTileType = TileType.LAND))
		val worldId = TestUtils.getGame(database, gameId).worldId
		joinGame.perform("test-user", gameId)
		val playerId = TestUtils.getPlayer(database, "test-user", gameId).id

		// resolve commands
		val result = resolveCommands.perform(gameId, worldId, listOf(cmdPlaceMarker(playerId, 4, 2)))
		result shouldBeOk true
		(result as Either.Right).value shouldHaveSize 0
		TestUtils.getMarkers(database, gameId) shouldHaveSize 1
		TestUtils.getMarkersAt(database, gameId, 4, 2) shouldHaveSize 1
	}

	"place multiple markers on same tile, reject all but the first one" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)
		val resolveCommands = TestActions.resolveCommandsAction(database)

		// create a new game
		val gameId = createGame.perform(WorldSettings(seed = 42, singleTileType = TileType.LAND))
		val worldId = TestUtils.getGame(database, gameId).worldId
		joinGame.perform("test-user", gameId)
		val playerId = TestUtils.getPlayer(database, "test-user", gameId).id

		// resolve commands
		val commands = listOf(cmdPlaceMarker(playerId, 4, 2), cmdPlaceMarker(playerId, 4, 2))
		val result = resolveCommands.perform(gameId, worldId, commands)
		result shouldBeOk true
		(result as Either.Right).value.let { errors ->
			errors shouldHaveSize 1
			errors shouldContainExactlyInAnyOrder listOf(
				CommandResolutionError(
					command = commands[1],
					errorMessage = "already another marker at position"
				)
			)
		}
		TestUtils.getMarkers(database, gameId) shouldHaveSize 1
		TestUtils.getMarkersAt(database, gameId, 4, 2) shouldHaveSize 1
	}

	"create city" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)
		val resolveCommands = TestActions.resolveCommandsAction(database)

		// create a new game
		val gameId = createGame.perform(WorldSettings(seed = 42, singleTileType = TileType.LAND))
		val worldId = TestUtils.getGame(database, gameId).worldId
		joinGame.perform("test-user", gameId)
		val playerId = TestUtils.getPlayer(database, "test-user", gameId).id

		// resolve commands
		val result = resolveCommands.perform(gameId, worldId, listOf(cmdCreateCity(playerId, 4, 2)))
		result shouldBeOk true
		(result as Either.Right).value shouldHaveSize 0
		TestUtils.getCities(database, gameId) shouldHaveSize 1
		TestUtils.getCitiesAt(database, gameId, 4, 2) shouldHaveSize 1
	}

	"create city on water, reject" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)
		val resolveCommands = TestActions.resolveCommandsAction(database)

		// create a new game
		val gameId = createGame.perform(WorldSettings(seed = 42, singleTileType = TileType.WATER))
		val worldId = TestUtils.getGame(database, gameId).worldId
		joinGame.perform("test-user", gameId)
		val playerId = TestUtils.getPlayer(database, "test-user", gameId).id

		// resolve commands
		val command = cmdCreateCity(playerId, 4, 2)
		val result = resolveCommands.perform(gameId, worldId, listOf(command))
		result shouldBeOk true
		(result as Either.Right).value.let { errors ->
			errors shouldHaveSize 1
			errors shouldContainExactlyInAnyOrder listOf(
				CommandResolutionError(
					command = command,
					errorMessage = "invalid tile type"
				)
			)
		}
		TestUtils.getCities(database, gameId) shouldHaveSize 0
		TestUtils.getCitiesAt(database, gameId, 4, 2) shouldHaveSize 0
	}

	"create two cities too close together, reject" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)
		val resolveCommands = TestActions.resolveCommandsAction(database)

		// create a new game
		val gameId = createGame.perform(WorldSettings(seed = 42, singleTileType = TileType.LAND))
		val worldId = TestUtils.getGame(database, gameId).worldId
		joinGame.perform("test-user", gameId)
		val playerId = TestUtils.getPlayer(database, "test-user", gameId).id

		// resolve commands
		val commands = listOf(cmdCreateCity(playerId, 4, 2), cmdCreateCity(playerId, 5, 2))
		val result = resolveCommands.perform(gameId, worldId, commands)
		result shouldBeOk true
		(result as Either.Right).value.let { errors ->
			errors shouldHaveSize 1
			errors shouldContainExactlyInAnyOrder listOf(
				CommandResolutionError(
					command = commands[1],
					errorMessage = "too close to another city"
				)
			)
		}
		TestUtils.getCities(database, gameId) shouldHaveSize 1
		TestUtils.getCitiesAt(database, gameId, 4, 2) shouldHaveSize 1
	}

}) {
	companion object {
		internal fun cmdPlaceMarker(playerId: String, q: Int, r: Int) = CommandEntity(
			id = UUID.gen(),
			playerId = playerId,
			turn = 0,
			type = PlaceMarkerCommand.TYPE,
			data = Base64.toBase64(
				Json.asString(
					PlaceMarkerCommandData(
						q = q,
						r = r
					)
				)
			)
		)

		internal fun cmdCreateCity(playerId: String, q: Int, r: Int) = CommandEntity(
			id = UUID.gen(),
			playerId = playerId,
			turn = 0,
			type = CreateCityCommand.TYPE,
			data = Base64.toBase64(
				Json.asString(
					CreateCityCommandData(
						q = q,
						r = r
					)
				)
			)
		)
	}
}