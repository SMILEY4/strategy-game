package de.ruegnerlukas.strategygame.backend.ports.provided.update

import de.ruegnerlukas.strategygame.backend.core.actions.update.BuildingCreationAction.Companion.BuildingCreationData
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueAddEntryCommandData

interface TurnUpdateAction {

    suspend fun prepare(game: GameExtended)

    suspend fun globalUpdate(game: GameExtended)

    suspend fun commandCreateCity(game: GameExtended, command: Command<CreateCityCommandData>)

    suspend fun eventCreateBuilding(game: GameExtended, data: BuildingCreationData)

    suspend fun commandPlaceMarker(game: GameExtended, command: Command<PlaceMarkerCommandData>)

    suspend fun commandPlaceScout(game: GameExtended, command: Command<PlaceScoutCommandData>)

    suspend fun commandProductionQueueAdd(game: GameExtended, command: Command<ProductionQueueAddEntryCommandData>)

}