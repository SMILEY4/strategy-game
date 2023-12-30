package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gameengine.core.DiscoverMapAreaImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.GameStepImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.InitializePlayerImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.InitializeWorldImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.common.PopFoodConsumption
import de.ruegnerlukas.strategygame.backend.gameengine.core.common.RouteGenerator
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENAddProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENCreateBuilding
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENCreateCity
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENDeleteMarker
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
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENUpgradeSettlementTier
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateAddProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateCreateCity
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidatePlaceMarker
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidatePlaceScout
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateRemoveProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.GENValidateUpgradeSettlementTier
import de.ruegnerlukas.strategygame.backend.gameengine.core.playerview.PlayerViewCreatorImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.preview.PreviewCityCreationImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.CountryInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GameExistsQueryImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GameExtendedQueryImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.GameExtendedUpdateImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.ReservationInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesInsertImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesQueryByGameAndPositionImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.TilesUpdateImpl
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation
import de.ruegnerlukas.strategygame.backend.gamesession.core.ConnectToGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.CreateGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.JoinGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.ListGamesImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.RequestConnectionToGameImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.TurnEndImpl
import de.ruegnerlukas.strategygame.backend.gamesession.core.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.CommandsInsertImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GameUpdateImpl
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.GamesByUserQueryImpl
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
    val gameEventSystem: EventSystem,
    val previewCityCreation: PreviewCityCreation
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
            val previewCityCreation = previewCityCreation(database)
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
                previewCityCreation = previewCityCreation
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
                    WorldBuilderImpl(),
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
                PlayerViewCreatorImpl(
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
                        PlayerViewCreatorImpl(
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
                    PlayerViewCreatorImpl(
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

        private fun previewCityCreation(database: ArangoDatabase): PreviewCityCreation {
            return PreviewCityCreationImpl(
                GameExtendedQueryImpl(database),
                RouteGenerator(GameConfig.default()),
                GameConfig.default()
            )
        }

    }

}