package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.economy.core.EconomyUpdateImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.GameStepActionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.PopFoodConsumption
import de.ruegnerlukas.strategygame.backend.gameengine.core.TurnUpdateActionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENAddProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENCreateBuilding
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENCreateCity
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENPlaceMarker
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENPlaceScout
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENRemoveProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateCityGrowthProgress
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateCityInfluence
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateCityNetwork
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateCitySize
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateCityTileOwnership
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateEconomy
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateInfluenceOwnership
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateInfluenceVisibility
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateProductionQueue
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpdateScoutLifetime
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateAddProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateCreateCity
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidatePlaceMarker
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidatePlaceScout
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateRemoveProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.ReservationInsertImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.ConnectToGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.CreateGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.JoinGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.ListGamesImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.RequestConnectionToGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.SendGameStateActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.TurnEndImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.UncoverMapAreaActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CommandsInsertImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CountryByGameAndUserQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CountryInsertImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameExtendedQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameExtendedUpdateImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameUpdateImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GamesByUserQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.TilesQueryByGameAndPositionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.TilesQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.TilesUpdateImpl
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldBuilderImpl
import io.mockk.every
import io.mockk.mockk

data class TestActions(
    val context: TestActionContext,
    val gameCreate: CreateGameImpl,
    val gameJoin: JoinGameImpl,
    val gameRequestConnect: RequestConnectionToGameImpl,
    val gameConnect: ConnectToGameImpl,
    val gamesList: ListGamesImpl,
    val turnSubmit: TurnSubmitActionImpl,
    val turnEnd: TurnEndImpl,
    val turnUpdate: TurnUpdateActionImpl
) {

    companion object {

        class TestActionContext {
            val commandResolutionErrors = mutableMapOf<Int, List<String>>()
        }

        fun create(database: ArangoDatabase, fixedPopFoodConsumption: Int? = null): TestActions {
            val context = TestActionContext()
            val gameCreate = gameCreateAction(database)
            val gameJoin = gameJoinAction(database)
            val gameRequestConnect = gameRequestConnectionAction(database)
            val gameConnect = gameConnectAction(database)
            val gamesList = gamesListAction(database)
            val turnUpdate = turnUpdateAction(database, popFoodConsumption(fixedPopFoodConsumption))
            val eventSystem = gameEventSystem(context, database, popFoodConsumption(fixedPopFoodConsumption))
            val turnSubmit = turnSubmitAction(database, eventSystem)
            val turnEnd = turnEndAction(database, eventSystem)
            return TestActions(
                context = context,
                gameCreate = gameCreate,
                gameJoin = gameJoin,
                gameRequestConnect = gameRequestConnect,
                gameConnect = gameConnect,
                gamesList = gamesList,
                turnSubmit = turnSubmit,
                turnEnd = turnEnd,
                turnUpdate = turnUpdate
            )
        }

        private fun gameEventSystem(
            context: TestActionContext,
            database: ArangoDatabase,
            popFoodConsumption: PopFoodConsumption
        ): EventSystem {
            return EventSystem().also { eventSystem ->
                // game-engine
                GENCreateCity(ReservationInsertImpl(database), eventSystem)
                GENUpdateCityInfluence(GameConfig.default(), eventSystem)
                GENUpdateCityNetwork(GameConfig.default(), ReservationInsertImpl(database), eventSystem)
                GENUpdateCityTileOwnership(eventSystem)
                GENUpdateInfluenceOwnership(GameConfig.default(), eventSystem)
                GENUpdateInfluenceVisibility(eventSystem)
                GENValidateCreateCity(GameConfig.default(), eventSystem)
                GENValidatePlaceMarker(eventSystem)
                GENPlaceMarker(eventSystem)
                GENValidatePlaceScout(GameConfig.default(), eventSystem)
                GENPlaceScout(GameConfig.default(), eventSystem)
                GENValidateAddProductionQueueEntry(GameConfig.default(), eventSystem)
                GENAddProductionQueueEntry(eventSystem)
                GENValidateRemoveProductionQueueEntry(eventSystem)
                GENRemoveProductionQueueEntry(GameConfig.default(), eventSystem)
                GENUpdateScoutLifetime(GameConfig.default(), eventSystem)
                GENUpdateEconomy(GameConfig.default(), popFoodConsumption, eventSystem)
                GENUpdateProductionQueue(eventSystem)
                GENCreateBuilding(eventSystem)
                GENUpdateCityGrowthProgress(popFoodConsumption, eventSystem)
                GENUpdateCitySize(eventSystem)
                // test
                GENReportOperationInvalid(context, eventSystem)
            }
        }

        private fun gameCreateAction(database: ArangoDatabase) =
            CreateGameImpl(
                WorldBuilderImpl(),
                GameInsertImpl(database),
            )

        private fun gameJoinAction(database: ArangoDatabase) =
            JoinGameImpl(
                GameQueryImpl(database),
                GameUpdateImpl(database),
                CountryInsertImpl(database),
                TilesQueryByGameImpl(database),
                GameConfig(),
                UncoverMapAreaActionImpl(
                    TilesQueryByGameAndPositionImpl(database),
                    TilesUpdateImpl(database)
                )
            )

        private fun gameConnectAction(database: ArangoDatabase) =
            ConnectToGameImpl(
                GameQueryImpl(database),
                GameUpdateImpl(database),
                SendGameStateActionImpl(
                    GameConfig.default(),
                    GameExtendedQueryImpl(database),
                    GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
                ),
            )

        private fun turnSubmitAction(database: ArangoDatabase, eventSystem: EventSystem) =
            TurnSubmitActionImpl(
                TurnEndImpl(
                    SendGameStateActionImpl(
                        GameConfig.default(),
                        GameExtendedQueryImpl(database),
                        GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
                    ),
                    GameExtendedQueryImpl(database),
                    GameExtendedUpdateImpl(database),
                    CommandsByGameQueryImpl(database),
                    GameStepActionImpl(eventSystem)
                ),
                GameQueryImpl(database),
                CountryByGameAndUserQueryImpl(database),
                GameUpdateImpl(database),
                CommandsInsertImpl(database),
            )

        private fun gamesListAction(database: ArangoDatabase) =
            ListGamesImpl(
                GamesByUserQueryImpl(database)
            )

        private fun gameRequestConnectionAction(database: ArangoDatabase) =
            RequestConnectionToGameImpl(
                GameQueryImpl(database),
            )

        private fun turnEndAction(database: ArangoDatabase, eventSystem: EventSystem) =
            TurnEndImpl(
                SendGameStateActionImpl(
                    GameConfig.default(),
                    GameExtendedQueryImpl(database),
                    GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
                ),
                GameExtendedQueryImpl(database),
                GameExtendedUpdateImpl(database),
                CommandsByGameQueryImpl(database),
                GameStepActionImpl(eventSystem)
            )

        private fun turnUpdateAction(database: ArangoDatabase, popFoodConsumption: PopFoodConsumption) =
            TurnUpdateActionImpl(
                ReservationInsertImpl(database),
                GameConfig.default(),
                popFoodConsumption,
                EconomyUpdateImpl(
                    GameConfig.default(),
                    popFoodConsumption
                )
            )

        private fun popFoodConsumption(fixed: Int? = null): PopFoodConsumption {
            if (fixed == null) {
                return PopFoodConsumption()
            } else {
                return mockk<PopFoodConsumption>().also {
                    every { it.getRequiredFood(any()) } returns fixed.toFloat()
                }
            }
        }
    }

}