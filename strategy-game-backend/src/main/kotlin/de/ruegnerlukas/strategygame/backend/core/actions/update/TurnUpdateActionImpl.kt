package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.actions.update.CityCreationAction.Companion.CityCreationResult
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueAddEntryCommandData
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
        val eventBuildingCreation = EventAction<GameExtended, Command<CreateBuildingCommandData>, Unit> { game, command ->
            BuildingCreationAction().perform(game, command)
        }

        val eventAddProductionQueueEntry = EventAction<GameExtended, Command<ProductionQueueAddEntryCommandData>, Unit> { game, command ->
            ProductionQueueAddAction().perform(game, command)
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

        eventSystem.atTrigger<Unit>("preparation")
            .thenRun(eventWorldPrepare)

        eventSystem.atTrigger<Command<CreateCityCommandData>>("command.create-city")
            .thenRun(eventCityCreation)

        eventSystem.atTrigger<Command<CreateBuildingCommandData>>("command.create-building")
            .thenRun(eventBuildingCreation)

        eventSystem.atTrigger<Command<ProductionQueueAddEntryCommandData>>("command.add-production-queue-entry")
            .thenRun(eventAddProductionQueueEntry)

        eventSystem.atTrigger<Command<PlaceMarkerCommandData>>("command.place-marker")
            .thenRun(eventMarkerPlace)

        eventSystem.atTrigger<Command<PlaceScoutCommandData>>("command.place-scout")
            .thenRun(eventScoutPlace)

        eventSystem.atTrigger<Unit>("global-update")
            .thenRun(eventScoutLifetime)
            .thenRun(eventEconomyUpdate)

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

    override suspend fun commandCreateBuilding(game: GameExtended, command: Command<CreateBuildingCommandData>) {
        eventSystem.trigger("command.create-building", game, command)
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

}