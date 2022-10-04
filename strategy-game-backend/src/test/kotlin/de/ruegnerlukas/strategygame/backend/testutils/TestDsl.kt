package de.ruegnerlukas.strategygame.backend.testutils

import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import io.kotest.common.runBlocking
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.floats.shouldBeWithinPercentageOf
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe

inline fun gameTest(block: GameTestContext.() -> Unit) {
    GameTestContext().apply(block)
}


class GameTestContext {

    private val database = runBlocking { TestUtilsFactory.createTestDatabase() }

    private val gameConfig = GameConfig.default()

    fun getGameConfig() = gameConfig


    private var gameId: String? = null

    private val countryIds = mutableMapOf<String, String>()

    fun getCountryId(userId: String) = countryIds[userId]!!


    private val commandResolutionErrors = mutableMapOf<Int, MutableList<CommandResolutionError>>()

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
        TestActions.gameJoinAction(database).perform(userId, gameId!!).also {
            it shouldBeOk true
            countryIds[userId] = TestUtils.getCountry(database, gameId!!, userId).key!!
        }
    }

    //=======================//
    //   RESOLVE COMMANDS    //
    //=======================//

    suspend fun resolveCommands(block: ResolveCommandsConfig.() -> Unit) {
        val config = ResolveCommandsConfig().apply(block)
        TestUtils.withGameExtended(database, gameId!!) {
            it to TestActions.resolveCommandsAction(database).perform(it, config.getCommands())
        }.let { (game, result) ->
            result shouldBeOk true
            commandResolutionErrors
                .computeIfAbsent(game.game.turn) { mutableListOf() }
                .addAll(result.getOrElse { emptyList() })
        }
    }

    class ResolveCommandsConfig {

        private val commands = mutableListOf<CommandEntity<*>>()

        fun getCommands() = commands

        fun createCity(countryId: String, turn: Int = 0, block: CommandCreateCityConfig.() -> Unit) {
            val config = CommandCreateCityConfig().apply(block)
            commands.add(
                CommandEntity(
                    countryId = countryId,
                    turn = turn,
                    data = CreateCityCommandDataEntity(
                        q = config.q!!,
                        r = config.r!!,
                        name = config.name!!,
                    )
                )
            )
        }

    }

    class CommandCreateCityConfig {
        var q: Int? = null
        var r: Int? = null
        var name: String? = null
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

    suspend fun expectCity(block: CityAssertion.() -> Unit) {
        expectCities { city(block) }
    }

    suspend fun expectCities(block: ExpectCitiesAssertion.() -> Unit) {
        val expectedCities = ExpectCitiesAssertion().apply(block).getCities()
        TestUtils.getCities(database, gameId!!).let { actualCities ->
            actualCities shouldHaveSize expectedCities.size
            expectedCities.forEach { expected ->
                actualCities.find { actual ->
                    actual.tile.q == expected.q
                            && actual.tile.r == expected.r
                            && actual.name == expected.name
                            && actual.countryId == expected.countryId
                }.shouldNotBeNull()
            }
        }
    }

    class ExpectCitiesAssertion {

        private val cities = mutableListOf<CityAssertion>()

        fun getCities() = cities

        fun city(block: CityAssertion.() -> Unit) {
            cities.add(CityAssertion().apply(block))
        }
    }

    class CityAssertion {
        var q: Int? = null
        var r: Int? = null
        var name: String? = null
        var countryId: String? = null
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


}


