package de.ruegnerlukas.strategygame.backend.ports.provided.update

import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData

interface TurnUpdateAction {

    suspend fun prepare(game: GameExtended)

    suspend fun globalUpdate(game: GameExtended)

    suspend fun commandCreateCity(game: GameExtended, command: Command<CreateCityCommandData>)

    suspend fun commandCreateBuilding(game: GameExtended, command: Command<CreateBuildingCommandData>)

    suspend fun commandPlaceMarker(game: GameExtended, command: Command<PlaceMarkerCommandData>)

    suspend fun commandPlaceScout(game: GameExtended, command: Command<PlaceScoutCommandData>)

}