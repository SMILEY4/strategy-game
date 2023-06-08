package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.update

import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.ProductionQueueAddEntryCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.ProductionQueueRemoveEntryCommandData
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.core.update.BuildingCreationAction

interface TurnUpdateAction {

    suspend fun prepare(game: GameExtended)

    suspend fun globalUpdate(game: GameExtended)

    suspend fun commandCreateCity(game: GameExtended, command: Command<CreateCityCommandData>)

    suspend fun eventCreateBuilding(game: GameExtended, data: BuildingCreationAction.Companion.BuildingCreationData)

    suspend fun commandPlaceMarker(game: GameExtended, command: Command<PlaceMarkerCommandData>)

    suspend fun commandPlaceScout(game: GameExtended, command: Command<PlaceScoutCommandData>)

    suspend fun commandProductionQueueAdd(game: GameExtended, command: Command<ProductionQueueAddEntryCommandData>)

    suspend fun commandProductionQueueRemove(game: GameExtended, command: Command<ProductionQueueRemoveEntryCommandData>)

}