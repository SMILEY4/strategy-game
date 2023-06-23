package de.ruegnerlukas.strategygame.backend.gameengine.core

import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.CreateCityOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerGlobalUpdate
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveCreateCity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueAddBuildingEntryCommandData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueAddSettlerEntryCommandData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueRemoveEntryCommandData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.GameStepAction

class GameStepActionImpl(
    private val eventSystem: EventSystem
) : GameStepAction {

    override suspend fun perform(game: GameExtended, commands: List<Command<*>>) {
        handleCommands(game, commands)
        eventSystem.publish(TriggerGlobalUpdate, game)
    }


    @Suppress("UNCHECKED_CAST")
    private suspend fun handleCommands(game: GameExtended, commands: List<Command<*>>) {
        commands.forEach { command ->
            when (command.data) {
                is CreateCityCommandData -> {
                    val typedCommand = command as Command<CreateCityCommandData>
                    eventSystem.publish(
                        TriggerResolveCreateCity, CreateCityOperationData(
                            game = game,
                            country = getCountry(game, typedCommand.countryId),
                            targetName = typedCommand.data.name,
                            targetTile = getTile(game, typedCommand.data.q, typedCommand.data.r),
                            withNewProvince = typedCommand.data.withNewProvince,
                        )
                    )
                }
                is PlaceMarkerCommandData -> TODO()
                is PlaceScoutCommandData -> TODO()
                is ProductionQueueAddBuildingEntryCommandData -> TODO()
                is ProductionQueueAddSettlerEntryCommandData -> TODO()
                is ProductionQueueRemoveEntryCommandData -> TODO()
            }
        }
    }

    private fun getCountry(game: GameExtended, countryId: String): Country {
        return game.countries.find { it.countryId == countryId } ?: throw Exception("Could not find country with id $countryId")
    }

    private fun getTile(game: GameExtended, q: Int, r: Int): Tile {
        TODO()
    }

}