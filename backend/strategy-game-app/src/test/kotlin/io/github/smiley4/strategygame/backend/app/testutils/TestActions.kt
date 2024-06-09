package io.github.smiley4.strategygame.backend.app.testutils

import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.engine.core.DiscoverMapAreaImpl
import io.github.smiley4.strategygame.backend.engine.core.GameStepImpl
import io.github.smiley4.strategygame.backend.engine.core.InitializePlayerImpl
import io.github.smiley4.strategygame.backend.engine.core.InitializeWorldImpl
import io.github.smiley4.strategygame.backend.engine.core.common.PopFoodConsumption
import io.github.smiley4.strategygame.backend.engine.core.common.RouteGenerator
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENAddProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENCreateBuilding
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENCreateCity
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENDeleteMarker
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENPlaceMarker
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENPlaceScout
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENRemoveProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateCityGrowthProgress
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateCityInfluence
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateCityNetwork
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateCitySize
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateCityTileOwnership
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateEconomy
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateInfluenceOwnership
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateInfluenceVisibility
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateProductionQueue
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpdateScoutLifetime
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENUpgradeSettlementTier
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateAddProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateCreateCity
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidatePlaceMarker
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidatePlaceScout
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateRemoveProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.core.gamestep.GENValidateUpgradeSettlementTier
import io.github.smiley4.strategygame.backend.engine.core.playerview.POVBuilderImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.CountryInsertImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.GameExistsQueryImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.GameExtendedQueryImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.GameExtendedUpdateImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.ReservationInsertImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.TilesInsertImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.TilesQueryByGameAndPositionImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.TilesQueryByGameImpl
import io.github.smiley4.strategygame.backend.engine.external.persistence.TilesUpdateImpl
import io.github.smiley4.strategygame.backend.worldgen.core.WorldGeneratorImpl
import io.github.smiley4.strategygame.backend.worlds.core.ConnectToGameImpl
import io.github.smiley4.strategygame.backend.worlds.core.CreateGameImpl
import io.github.smiley4.strategygame.backend.worlds.core.JoinGameImpl
import io.github.smiley4.strategygame.backend.worlds.core.ListGamesImpl
import io.github.smiley4.strategygame.backend.worlds.core.RequestConnectionToGameImpl
import io.github.smiley4.strategygame.backend.worlds.core.TurnEndImpl
import io.github.smiley4.strategygame.backend.worlds.core.TurnSubmitActionImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.CommandsByGameQueryImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.CommandsInsertImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.GameInsertImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.GameQueryImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.GameUpdateImpl
import io.github.smiley4.strategygame.backend.worlds.external.persistence.GamesByUserQueryImpl
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
    val gameEventSystem: EventSystem,
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
                gameEventSystem = eventSystem,
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
                GENUpdateCityNetwork(ReservationInsertImpl(database), RouteGenerator(GameConfig.default()), eventSystem)
                GENUpdateCityTileOwnership(eventSystem)
                GENUpdateInfluenceOwnership(GameConfig.default(), eventSystem)
                GENUpdateInfluenceVisibility(eventSystem)
                GENValidateCreateCity(GameConfig.default(), eventSystem)
                GENValidatePlaceMarker(eventSystem)
                GENPlaceMarker(eventSystem)
                GENDeleteMarker(eventSystem)
                GENValidatePlaceScout(GameConfig.default(), eventSystem)
                GENPlaceScout(GameConfig.default(), eventSystem)
                GENValidateAddProductionQueueEntry(eventSystem)
                GENAddProductionQueueEntry(eventSystem)
                GENValidateRemoveProductionQueueEntry(eventSystem)
                GENRemoveProductionQueueEntry(GameConfig.default(), eventSystem)
                GENUpdateScoutLifetime(GameConfig.default(), eventSystem)
                GENUpdateEconomy(GameConfig.default(), popFoodConsumption, eventSystem)
                GENUpdateProductionQueue(eventSystem)
                GENCreateBuilding(eventSystem)
                GENUpdateCityGrowthProgress(popFoodConsumption, eventSystem)
                GENUpdateCitySize(eventSystem)
                GENValidateUpgradeSettlementTier(eventSystem)
                GENUpgradeSettlementTier(eventSystem)
                // test
                GENReportOperationInvalid(context, eventSystem)
            }
        }

        private fun gameCreateAction(database: ArangoDatabase) =
            CreateGameImpl(
                GameInsertImpl(database),
                InitializeWorldImpl(
                    WorldGeneratorImpl(),
                    TilesInsertImpl(database),
                    GameExistsQueryImpl(database)
                )
            )

        private fun gameJoinAction(database: ArangoDatabase) =
            JoinGameImpl(
                GameQueryImpl(database),
                GameUpdateImpl(database),
                InitializePlayerImpl(
                    GameConfig.default(),
                    CountryInsertImpl(database),
                    TilesQueryByGameImpl(database),
                    DiscoverMapAreaImpl(
                        TilesQueryByGameAndPositionImpl(database),
                        TilesUpdateImpl(database),
                        GameExistsQueryImpl(database)
                    ),
                    GameExistsQueryImpl(database)
                )
            )

        private fun gameConnectAction(database: ArangoDatabase) =
            ConnectToGameImpl(
                GameQueryImpl(database),
                GameUpdateImpl(database),
                POVBuilderImpl(
                    GameExtendedQueryImpl(database),
                    GameConfig.default()
                ),
                TestUtilsFactory.MockMessageProducer()
            )

        private fun turnSubmitAction(database: ArangoDatabase, eventSystem: EventSystem) =
            TurnSubmitActionImpl(
                TurnEndImpl(
                    CommandsByGameQueryImpl(database),
                    GameQueryImpl(database),
                    GameUpdateImpl(database),
                    GameStepImpl(
                        GameExtendedQueryImpl(database),
                        GameExtendedUpdateImpl(database),
                        eventSystem,
                        POVBuilderImpl(
                            GameExtendedQueryImpl(database),
                            GameConfig.default()
                        ),
                    ),
                    TestUtilsFactory.MockMessageProducer()
                ),
                GameQueryImpl(database),
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
                CommandsByGameQueryImpl(database),
                GameQueryImpl(database),
                GameUpdateImpl(database),
                GameStepImpl(
                    GameExtendedQueryImpl(database),
                    GameExtendedUpdateImpl(database),
                    eventSystem,
                    POVBuilderImpl(
                        GameExtendedQueryImpl(database),
                        GameConfig.default()
                    ),
                ),
                TestUtilsFactory.MockMessageProducer()
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