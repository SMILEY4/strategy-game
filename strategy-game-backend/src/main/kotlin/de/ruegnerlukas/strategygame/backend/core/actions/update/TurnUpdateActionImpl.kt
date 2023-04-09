package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.actions.update.BuildingCreationAction.Companion.BuildingCreationData
import de.ruegnerlukas.strategygame.backend.core.actions.update.CityCreationAction.Companion.CityCreationResult
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueAddEntryCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueRemoveEntryCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.provided.update.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.ReservationInsert
import de.ruegnerlukas.strategygame.backend.shared.events.EventAction
import de.ruegnerlukas.strategygame.backend.shared.events.EventSystem

class TurnUpdateActionImpl(
    private val reservationInsert: ReservationInsert,
    private val gameConfig: GameConfig,
) : TurnUpdateAction {

    private val eventSystem = EventSystem<GameExtended>()

    init {
        val eventBuildingCreation = EventAction<GameExtended, BuildingCreationData, Unit> { game, data ->
            BuildingCreationAction().perform(game, data)
        }

        val eventAddProductionQueueEntry = EventAction<GameExtended, Command<ProductionQueueAddEntryCommandData>, Unit> { game, command ->
            ProductionQueueAddAction().perform(game, command)
        }

        val eventRemoveProductionQueueEntry =
            EventAction<GameExtended, Command<ProductionQueueRemoveEntryCommandData>, Unit> { game, command ->
                ProductionQueueRemoveAction(gameConfig).perform(game, command)
            }

        val eventProductionQueueUpdate = EventAction<GameExtended, Unit, Unit> { game, _ ->
            ProductionQueueUpdateAction(this).perform(game)
        }

        val eventCityCreation = EventAction<GameExtended, Command<CreateCityCommandData>, CityCreationResult> { game, command ->
            CityCreationAction(reservationInsert).perform(game, command)
        }

        val eventCityInfluence = EventAction<GameExtended, CityCreationResult, Collection<Tile>> { game, creationResult ->
            CityInfluenceAction(gameConfig).perform(game, creationResult)
        }

        val eventCityNetworkUpdate = EventAction<GameExtended, CityCreationResult, Unit> { game, creationResult ->
            CityNetworkUpdateAction(gameConfig, reservationInsert).perform(game, creationResult)
        }

        val eventCityTileOwnership = EventAction<GameExtended, CityCreationResult, Unit> { game, creationResult ->
            CityTileOwnershipAction().perform(game, creationResult)
        }

        val eventEconomyUpdate = EventAction<GameExtended, Unit, Unit> { game, _ ->
            EconomyUpdateAction(gameConfig).perform(game)
        }

        val eventInfluenceOwnership = EventAction<GameExtended, Collection<Tile>, Unit> { _, tiles ->
            InfluenceOwnershipAction(gameConfig).perform(tiles)
        }

        val eventInfluenceVisibility = EventAction<GameExtended, Collection<Tile>, Unit> { game, tiles ->
            InfluenceVisibilityAction().perform(game, tiles)
        }

        val eventMarkerPlace = EventAction<GameExtended, Command<PlaceMarkerCommandData>, Unit> { game, command ->
            MarkerPlaceAction().perform(game, command)
        }

        val eventScoutLifetime = EventAction<GameExtended, Unit, Unit> { game, _ ->
            ScoutLifetimeAction(gameConfig).perform(game)
        }

        val eventScoutPlace = EventAction<GameExtended, Command<PlaceScoutCommandData>, Unit> { game, command ->
            ScoutPlaceAction(gameConfig).perform(game, command)
        }

        val eventWorldPrepare = EventAction<GameExtended, Unit, Unit> { game, _ ->
            WorldPrepareAction().perform(game)
        }

        val eventCityGrowthProgressUpdate = EventAction<GameExtended, Unit, Unit> { game, _ ->
            CityGrowthUpdateAction(gameConfig).perform(game)
        }

        val eventCitySizeUpdate = EventAction<GameExtended, Unit, Unit> { game, _ ->
            CitySizeUpdateAction().perform(game)
        }

        eventSystem.atTrigger<Unit>("preparation")
            .thenRun(eventWorldPrepare)

        eventSystem.atTrigger<Command<CreateCityCommandData>>("command.create-city")
            .thenRun(eventCityCreation)

        eventSystem.atTrigger<BuildingCreationData>("event.create-building")
            .thenRun(eventBuildingCreation)

        eventSystem.atTrigger<Command<ProductionQueueAddEntryCommandData>>("command.add-production-queue-entry")
            .thenRun(eventAddProductionQueueEntry)

        eventSystem.atTrigger<Command<ProductionQueueRemoveEntryCommandData>>("command.remove-production-queue-entry")
            .thenRun(eventRemoveProductionQueueEntry)

        eventSystem.atTrigger<Command<PlaceMarkerCommandData>>("command.place-marker")
            .thenRun(eventMarkerPlace)

        eventSystem.atTrigger<Command<PlaceScoutCommandData>>("command.place-scout")
            .thenRun(eventScoutPlace)

        eventSystem.atTrigger<Unit>("global-update")
            .thenRun(eventScoutLifetime)
            .thenRun(eventEconomyUpdate)

        eventSystem.after(eventEconomyUpdate)
            .thenRun(eventProductionQueueUpdate)
            .thenRun(eventCityGrowthProgressUpdate)

        eventSystem.after(eventCityGrowthProgressUpdate)
            .thenRun(eventCitySizeUpdate)

        eventSystem.after(eventCityCreation)
            .thenRun(eventCityInfluence)
            .thenRun(eventCityTileOwnership)
            .thenRun(eventCityNetworkUpdate)

        eventSystem.after(eventCityInfluence)
            .thenRun(eventInfluenceVisibility)
            .thenRun(eventInfluenceOwnership)
    }

    override suspend fun prepare(game: GameExtended) {
        eventSystem.trigger("preparation", game, Unit)
    }

    override suspend fun globalUpdate(game: GameExtended) {
        eventSystem.trigger("global-update", game, Unit)
    }

    override suspend fun commandCreateCity(game: GameExtended, command: Command<CreateCityCommandData>) {
        eventSystem.trigger("command.create-city", game, command)
    }

    override suspend fun eventCreateBuilding(game: GameExtended, data: BuildingCreationData) {
        eventSystem.trigger("event.create-building", game, data)
    }

    override suspend fun commandPlaceMarker(game: GameExtended, command: Command<PlaceMarkerCommandData>) {
        eventSystem.trigger("command.place-marker", game, command)
    }

    override suspend fun commandPlaceScout(game: GameExtended, command: Command<PlaceScoutCommandData>) {
        eventSystem.trigger("command.place-scout", game, command)
    }

    override suspend fun commandProductionQueueAdd(game: GameExtended, command: Command<ProductionQueueAddEntryCommandData>) {
        eventSystem.trigger("command.add-production-queue-entry", game, command)
    }

    override suspend fun commandProductionQueueRemove(game: GameExtended, command: Command<ProductionQueueRemoveEntryCommandData>) {
        eventSystem.trigger("command.remove-production-queue-entry", game, command)
    }

}