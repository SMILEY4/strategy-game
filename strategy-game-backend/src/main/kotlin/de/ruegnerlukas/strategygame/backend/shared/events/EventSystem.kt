package de.ruegnerlukas.strategygame.backend.shared.events

import de.ruegnerlukas.strategygame.backend.core.actions.update.BuildingCreationAction
import de.ruegnerlukas.strategygame.backend.core.actions.update.CityCreationAction
import de.ruegnerlukas.strategygame.backend.core.actions.update.CityCreationAction.Companion.CityCreationResult
import de.ruegnerlukas.strategygame.backend.core.actions.update.CityInfluenceAction
import de.ruegnerlukas.strategygame.backend.core.actions.update.CityNetworkUpdateAction
import de.ruegnerlukas.strategygame.backend.core.actions.update.CityTileOwnershipAction
import de.ruegnerlukas.strategygame.backend.core.actions.update.CountryResourcesAction
import de.ruegnerlukas.strategygame.backend.core.actions.update.InfluenceOwnershipAction
import de.ruegnerlukas.strategygame.backend.core.actions.update.InfluenceVisibilityAction
import de.ruegnerlukas.strategygame.backend.core.actions.update.MarkerPlaceAction
import de.ruegnerlukas.strategygame.backend.core.actions.update.ScoutLifetimeAction
import de.ruegnerlukas.strategygame.backend.core.actions.update.ScoutPlaceAction
import de.ruegnerlukas.strategygame.backend.core.actions.update.WorldPrepareAction
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.ReservationInsert
import de.ruegnerlukas.strategygame.backend.shared.Logging

class EventSystem<CONTEXT> : Logging {

    private val conditions: MutableList<EventCondition<CONTEXT, *>> = mutableListOf()

    fun <PAYLOAD> atTrigger(triggerName: String): EventCondition<CONTEXT, PAYLOAD> {
        return AtTriggerEventCondition<CONTEXT, PAYLOAD>(triggerName).also { conditions.add(it) }
    }

    fun <PAYLOAD> after(event: EventAction<CONTEXT, *, PAYLOAD>): EventCondition<CONTEXT, PAYLOAD> {
        return AfterEventCondition(event).also { conditions.add(it) }
    }

    suspend fun trigger(triggerName: String, context: CONTEXT, payload: Any) {
        log().info("Start trigger '$triggerName'")
        conditions
            .filterIsInstance<AtTriggerEventCondition<CONTEXT, *>>()
            .filter { it.triggerName == triggerName }
            .flatMap { it.getFollowingEvents() }
            .forEach { runAction(it, context, payload) }
    }

    private suspend fun <PAYLOAD, RESULT> runAction(eventAction: EventAction<CONTEXT, PAYLOAD, RESULT>, context: CONTEXT, payload: Any) {
        log().info("Run event action ${eventAction::class.simpleName}")
        val result: RESULT = eventAction.run(context, payload as PAYLOAD)
        conditions
            .filterIsInstance<AfterEventCondition<CONTEXT, *>>()
            .filter { it.afterEvent == eventAction }
            .flatMap { it.getFollowingEvents() }
            .forEach { runAction(it, context, result as Any) }
    }


}

suspend fun main() {

    val reservationInsert: ReservationInsert = null as ReservationInsert
    val gameConfig: GameConfig = null as GameConfig

    val eventBuildingCreation = EventAction<GameExtended, Command<CreateBuildingCommandData>, Unit> { game, command ->
        BuildingCreationAction().perform(game, command)
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

    val eventCountryResources = EventAction<GameExtended, Unit, Unit> { game, _ ->
        CountryResourcesAction(gameConfig).perform(game)
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

    val eventSystem = EventSystem<GameExtended>()

    eventSystem.atTrigger<Unit>("preparation")
        .thenRun(eventWorldPrepare)

    eventSystem.atTrigger<Command<CreateCityCommandData>>("command.create-city")
        .thenRun(eventCityCreation)

    eventSystem.atTrigger<Command<CreateBuildingCommandData>>("command.create-building")
        .thenRun(eventBuildingCreation)

    eventSystem.atTrigger<Command<PlaceMarkerCommandData>>("command.place-marker")
        .thenRun(eventMarkerPlace)

    eventSystem.atTrigger<Command<PlaceScoutCommandData>>("command.place-scout")
        .thenRun(eventScoutPlace)

    eventSystem.atTrigger<Unit>("global-update")
        .thenRun(eventScoutLifetime)
        .thenRun(eventCountryResources)

    eventSystem.after(eventCityCreation)
        .thenRun(eventCityInfluence)
        .thenRun(eventCityTileOwnership)
        .thenRun(eventCityNetworkUpdate)

    eventSystem.after(eventCityInfluence)
        .thenRun(eventInfluenceVisibility)
        .thenRun(eventInfluenceOwnership)

}
