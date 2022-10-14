package de.ruegnerlukas.strategygame.backend.testutils

import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommand
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommand
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.CreateTownCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.shared.coApply
import io.kotest.common.runBlocking
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.floats.shouldBeWithinPercentageOf
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe

suspend fun gameTest(block: suspend GameTestContext.() -> Unit) {
    GameTestContext().coApply(block)
}


class GameTestContext {

    private val database = runBlocking { TestUtilsFactory.createTestDatabase() }

    private val gameConfig = GameConfig.default()

    fun gameCfg() = gameConfig


    private var gameId: String? = null

    private val countryIds = mutableMapOf<String, String>()

    fun getCountryId(userId: String) = countryIds[userId]!!


    private val commandResolutionErrors = mutableMapOf<Int, MutableList<CommandResolutionError>>()

    suspend fun getCityId(name: String) = TestUtils.getCities(database, gameId!!).find { it.name == name }!!.getKeyOrThrow()

    //=======================//
    //      CREATE GAME      //
    //=======================//

    suspend fun createGame(block: CreateGameConfig.() -> Unit) {
        val config = CreateGameConfig().apply(block)
        gameId = TestActions.gameCreateAction(database).perform(config.worldSettings)
        TestUtils.getGame(database, gameId!!).let {
            it.key shouldBe gameId
            it.turn shouldBe 0
        }
        config.getUsers().forEach { joinGame(it) }
    }

    class CreateGameConfig {

        var worldSettings = WorldSettings.default()

        private val users = mutableSetOf<String>()

        fun user(userId: String) {
            users.add(userId)
        }

        fun getUsers() = users
    }

    //=======================//
    //       JOIN GAME       //
    //=======================//

    suspend fun joinGame(userId: String) {
        joinGame { this.userId = userId }
    }

    suspend fun joinGame(block: JoinGameConfig.() -> Unit) {
        val config = JoinGameConfig().apply(block)
        TestActions.gameJoinAction(database).perform(config.userId!!, config.gameId ?: gameId!!).also {
            if (config.expectedError == null) {
                it shouldBeOk true
                countryIds[config.userId!!] = TestUtils.getCountry(database, gameId!!, config.userId!!).key!!
            } else {
                it shouldBeError config.expectedError
            }
        }
    }


    class JoinGameConfig {
        var gameId: String? = null
        var userId: String? = null
        var expectedError: GameJoinAction.GameJoinActionErrors? = null
    }

    //=======================//
    //     CONNECT GAME      //
    //=======================//

    suspend fun connectGame(block: ConnectGameConfig.() -> Unit) {
        val config = ConnectGameConfig().apply(block)
        TestActions.gameRequestConnectionAction(database).perform(config.userId!!, config.gameId ?: gameId!!)
            .also {
                if (config.expectedRequestError == null) {
                    it shouldBeOk true
                } else {
                    it shouldBeError config.expectedRequestError
                }
            }.also { result ->
                if (result.isRight()) {
                    TestActions.gameConnectAction(database).perform(config.userId!!, config.gameId ?: gameId!!, config.connectionId!!)
                        .also {
                            if (config.expectedConnectError == null) {
                                it shouldBeOk true
                            } else {
                                it shouldBeError config.expectedConnectError
                            }
                        }
                }
            }
    }

    class ConnectGameConfig {
        var gameId: String? = null
        var userId: String? = null
        var connectionId: Int? = null
        var expectedRequestError: GameRequestConnectionAction.GameRequestConnectionActionError? = null
        var expectedConnectError: GameConnectAction.GameConnectActionError? = null
    }

    //=======================//
    //   RESOLVE COMMANDS    //
    //=======================//

    suspend fun resolveCommands(block: suspend ResolveCommandsConfig.() -> Unit) {
        val config = ResolveCommandsConfig().coApply(block)
        TestUtils.withGameExtended(database, gameId!!) {
            it to TestActions.resolveCommandsAction(database).perform(it, config.getCommands())
        }.let { (game, result) ->
            if (config.expectedActionError != null) {
                result shouldBeError config.expectedActionError
            } else {
                result shouldBeOk true
            }
            commandResolutionErrors
                .computeIfAbsent(game.game.turn) { mutableListOf() }
                .addAll(result.getOrElse { emptyList() })
        }
    }

    class ResolveCommandsConfig {

        var expectedActionError: ResolveCommandsAction.TileNotFoundError? = null

        private val commands = mutableListOf<Command<*>>()

        fun getCommands() = commands

        fun createCity(countryId: String, turn: Int = 0, block: CommandCreateCityConfig.() -> Unit) {
            val config = CommandCreateCityConfig().apply(block)
            commands.add(
                Command(
                    countryId = countryId,
                    turn = turn,
                    data = CreateCityCommandData(
                        q = config.q!!,
                        r = config.r!!,
                        name = config.name!!,
                    )
                )
            )
        }

        class CommandCreateCityConfig {
            var q: Int? = null
            var r: Int? = null
            var name: String? = null
        }

        suspend fun createTown(countryId: String, turn: Int = 0, block: suspend CommandCreateTownConfig.() -> Unit) {
            val config = CommandCreateTownConfig().coApply(block)
            commands.add(
                Command(
                    countryId = countryId,
                    turn = turn,
                    data = CreateTownCommandData(
                        q = config.q!!,
                        r = config.r!!,
                        name = config.name!!,
                        parentCity = config.parentCity!!
                    )
                )
            )
        }

        class CommandCreateTownConfig {
            var q: Int? = null
            var r: Int? = null
            var name: String? = null
            var parentCity: String? = null
        }

        suspend fun placeMarker(countryId: String, turn: Int = 0, block: suspend CommandPlaceMarkerConfig.() -> Unit) {
            val config = CommandPlaceMarkerConfig().coApply(block)
            commands.add(
                Command(
                    countryId = countryId,
                    turn = turn,
                    data = PlaceMarkerCommandData(
                        q = config.q!!,
                        r = config.r!!,
                    )
                )
            )
        }

        class CommandPlaceMarkerConfig {
            var q: Int? = null
            var r: Int? = null
        }


    }

    //=======================//
    //     SUBMIT TURN       //
    //=======================//

    suspend fun submitTurn(userId: String, block: suspend ResolveCommandsConfig.() -> Unit) {
        val config = ResolveCommandsConfig().coApply(block)
        TestActions.turnSubmitAction(database).perform(userId, gameId!!, config.getCommands().map { cmd ->
            when (cmd.data) {
                is CreateCityCommandData -> CreateCityCommand(
                    q = (cmd.data as CreateCityCommandData).q,
                    r = (cmd.data as CreateCityCommandData).r,
                    name = (cmd.data as CreateCityCommandData).name,
                    parentCity = null,
                )
                is CreateTownCommandData -> CreateCityCommand(
                    q = (cmd.data as CreateTownCommandData).q,
                    r = (cmd.data as CreateTownCommandData).r,
                    name = (cmd.data as CreateTownCommandData).name,
                    parentCity = (cmd.data as CreateTownCommandData).parentCity,
                )
                is PlaceMarkerCommandData -> PlaceMarkerCommand(
                    q = (cmd.data as PlaceMarkerCommandData).q,
                    r = (cmd.data as PlaceMarkerCommandData).r,
                )
                is PlaceScoutCommandData -> PlaceScoutCommand(
                    q = (cmd.data as PlaceScoutCommandData).q,
                    r = (cmd.data as PlaceScoutCommandData).r,
                )
                is CreateBuildingCommandData -> CreateBuildingCommand(
                    cityId = (cmd.data as CreateBuildingCommandData).cityId,
                    buildingType = (cmd.data as CreateBuildingCommandData).buildingType,
                )
            }
        })
    }

    //=======================//
    //      END TURN         //
    //=======================//

    suspend fun endTurn() {
        TestActions.turnEndAction(database).perform(gameId!!) shouldBeOk true
    }

    //=======================//
    //       UTILITIES       //
    //=======================//

    suspend fun setCountryMoney(countryId: String, amount: Float) {
        TestUtils.getCountry(database, countryId).let { country ->
            country.resources.money = amount
            TestUtils.updateCountry(database, country)
        }
    }

    //=======================//
    //      ASSERTIONS       //
    //=======================//

    suspend fun expectNoCities() {
        expectCities {}
    }

    suspend fun expectCity(block: suspend CityAssertion.() -> Unit) {
        expectCities { city(block) }
    }

    suspend fun expectCities(block: suspend ExpectCitiesAssertion.() -> Unit) {
        val expectedCities = ExpectCitiesAssertion().coApply(block).getCities()
        TestUtils.getCities(database, gameId!!).let { actualCities ->
            actualCities shouldHaveSize expectedCities.size
            expectedCities.forEach { expected ->
                actualCities.find { actual ->
                    actual.tile.q == expected.q
                            && actual.tile.r == expected.r
                            && actual.name == expected.name
                            && actual.countryId == expected.countryId
                            && actual.parentCity == expected.parentCity
                }.shouldNotBeNull()
            }
        }
    }

    class ExpectCitiesAssertion {

        private val cities = mutableListOf<CityAssertion>()

        fun getCities() = cities

        suspend fun city(block: suspend CityAssertion.() -> Unit) {
            cities.add(CityAssertion().coApply(block))
        }

    }

    class CityAssertion {
        var q: Int? = null
        var r: Int? = null
        var name: String? = null
        var countryId: String? = null
        var parentCity: String? = null
    }


    suspend fun expectCountryMoney(block: CountryMoneyAssertion.() -> Unit) {
        val config = CountryMoneyAssertion().apply(block)
        TestUtils.getCountry(database, config.countryId!!).resources.money.shouldBeWithinPercentageOf(config.amount!!, 0.01)
    }

    class CountryMoneyAssertion {
        var countryId: String? = null
        var amount: Float? = null
    }


    fun expectCommandResolutionErrors(turn: Int, vararg errors: String) {
        commandResolutionErrors
            .getOrDefault(turn, mutableListOf())
            .map { it.errorMessage } shouldContainExactlyInAnyOrder errors.toList()
    }

    suspend fun expectNoMarkers() {
        expectMarkers { }
    }

    suspend fun expectMarkers(block: suspend ExpectMarkersAssertion.() -> Unit) {
        val expectedMarkers = ExpectMarkersAssertion().coApply(block).getMarkers()
        TestUtils.getMarkers(database, gameId!!).let { actualMarkers ->
            actualMarkers shouldHaveSize expectedMarkers.size
        }
        expectedMarkers.forEach { expected ->
            val actual = TestUtils.getMarkersAt(database, gameId!!, expected.q!!, expected.r!!)
            actual shouldHaveSize 1
            actual[0].second.countryId shouldBe expected.countryId
        }
    }

    class ExpectMarkersAssertion {

        private val markers = mutableListOf<MarkerAssertion>()

        fun getMarkers() = markers

        suspend fun marker(block: suspend MarkerAssertion.() -> Unit) {
            markers.add(MarkerAssertion().coApply(block))
        }

    }

    class MarkerAssertion {
        var q: Int? = null
        var r: Int? = null
        var countryId: String? = null
    }


    suspend fun expectNoPlayers() {
        expectPlayers { }
    }

    suspend fun expectPlayers(block: suspend ExpectPlayerAssertion.() -> Unit) {
        val expectedPlayers = ExpectPlayerAssertion().coApply(block).getPlayers()
        TestUtils.getPlayers(database, gameId!!).let { actualPlayers ->
            actualPlayers shouldHaveSize expectedPlayers.size
            expectedPlayers.forEach { expected ->
                actualPlayers.find { actual ->
                    actual.userId == expected.userId
                            && actual.state == expected.state
                            && actual.connectionId == expected.connectionId
                }.shouldNotBeNull()

            }
        }
    }

    class ExpectPlayerAssertion {

        private val players = mutableListOf<PlayerAssertion>()

        fun getPlayers() = players

        suspend fun player(block: suspend PlayerAssertion.() -> Unit) {
            players.add(PlayerAssertion().coApply(block))
        }

    }

    class PlayerAssertion {
        var userId: String? = null
        var connectionId: Int? = null
        var state: String? = null
    }


    suspend fun expectTurn(turn: Int) {
        TestUtils.getGame(database, gameId!!).turn shouldBe turn
    }

}


