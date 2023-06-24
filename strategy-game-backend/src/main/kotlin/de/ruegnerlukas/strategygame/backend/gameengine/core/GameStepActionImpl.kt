package de.ruegnerlukas.strategygame.backend.gameengine.core

import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Province
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.AddProductionQueueEntryOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.BuildingProductionQueueEntryData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.CreateCityOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.PlaceMarkerOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.PlaceScoutOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.RemoveProductionQueueEntryOperationData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.SettlerProductionQueueEntryData
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerGlobalUpdate
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveAddProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveCreateCity
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolvePlaceMarker
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolvePlaceScout
import de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep.TriggerResolveRemoveProductionQueueEntry
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
                        TriggerResolveCreateCity,
                        CreateCityOperationData(
                            game = game,
                            country = getCountry(game, typedCommand.countryId),
                            targetName = typedCommand.data.name,
                            targetTile = getTile(game, typedCommand.data.q, typedCommand.data.r),
                            withNewProvince = typedCommand.data.withNewProvince,
                        )
                    )
                }
                is PlaceMarkerCommandData -> {
                    val typedCommand = command as Command<PlaceMarkerCommandData>
                    eventSystem.publish(
                        TriggerResolvePlaceMarker,
                        PlaceMarkerOperationData(
                            game = game,
                            country = getCountry(game, typedCommand.countryId),
                            targetTile = getTile(game, typedCommand.data.q, typedCommand.data.r),
                        )
                    )
                }
                is PlaceScoutCommandData -> {
                    val typedCommand = command as Command<PlaceScoutCommandData>
                    eventSystem.publish(
                        TriggerResolvePlaceScout,
                        PlaceScoutOperationData(
                            game = game,
                            country = getCountry(game, typedCommand.countryId),
                            targetTile = getTile(game, typedCommand.data.q, typedCommand.data.r),
                        )
                    )
                }
                is ProductionQueueAddBuildingEntryCommandData -> {
                    val typedCommand = command as Command<ProductionQueueAddBuildingEntryCommandData>
                    eventSystem.publish(
                        TriggerResolveAddProductionQueueEntry,
                        AddProductionQueueEntryOperationData(
                            game = game,
                            country = getCountry(game, typedCommand.countryId),
                            city = getCity(game, typedCommand.data.cityId),
                            entry = BuildingProductionQueueEntryData(
                                buildingType = typedCommand.data.buildingType
                            )
                        )
                    )
                }
                is ProductionQueueAddSettlerEntryCommandData -> {
                    val typedCommand = command as Command<ProductionQueueAddSettlerEntryCommandData>
                    eventSystem.publish(
                        TriggerResolveAddProductionQueueEntry,
                        AddProductionQueueEntryOperationData(
                            game = game,
                            country = getCountry(game, typedCommand.countryId),
                            city = getCity(game, typedCommand.data.cityId),
                            entry = SettlerProductionQueueEntryData()
                        )
                    )
                }
                is ProductionQueueRemoveEntryCommandData -> {
                    val typedCommand = command as Command<ProductionQueueRemoveEntryCommandData>
                    eventSystem.publish(
                        TriggerResolveRemoveProductionQueueEntry,
                        RemoveProductionQueueEntryOperationData(
                            game = game,
                            country = getCountry(game, typedCommand.countryId),
                            province = getProvince(game, typedCommand.data.cityId),
                            city = getCity(game, typedCommand.data.cityId),
                            entryId = typedCommand.data.queueEntryId
                        )
                    )
                }
            }
        }
    }

    private fun getCountry(game: GameExtended, countryId: String): Country {
        return game.countries.find { it.countryId == countryId } ?: throw Exception("Could not find country with id $countryId")
    }

    private fun getTile(game: GameExtended, q: Int, r: Int): Tile {
        return game.tiles.get(q, r) ?: throw Exception("Could not find tile at $q,$r")
    }

    private fun getProvince(game: GameExtended, cityId: String): Province {
        return game.provinces.find { it.cityIds.contains(cityId) } ?: throw Exception("Could not find province for city with id $cityId")
    }

    private fun getCity(game: GameExtended, cityId: String): City {
        return game.cities.find { it.cityId == cityId } ?: throw Exception("Could not find city with id $cityId")
    }

}