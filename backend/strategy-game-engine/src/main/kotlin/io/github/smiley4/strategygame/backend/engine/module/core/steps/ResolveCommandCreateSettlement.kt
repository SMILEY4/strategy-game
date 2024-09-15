package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.commondata.Building
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.DetailLog
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.RGBColor
import io.github.smiley4.strategygame.backend.commondata.ResourceLedger
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.edge.GameValidations

internal class ResolveCommandCreateSettlement(private val gameValidations: GameValidations) : Logging {

    @JvmName("resolveWithSettler")
    fun resolve(game: GameExtended, command: Command<CommandData.CreateSettlementWithSettler>) {
        log().debug("Resolving create settlement with world-object command for object ${command.data.worldObject} with name ${command.data.name}")

        val country = game.findCountryByUser(command.user)
        val worldObject = game.findWorldObject(command.data.worldObject)
        val tile = game.findTile(worldObject.tile)

        gameValidations.validateSettlementSettler(worldObject)
        gameValidations.validateSettlementName(command.data.name)
        gameValidations.validateSettlementLocationSettler(game, tile, country.id)

        val settlement = Settlement(
            id = Settlement.Id.gen(),
            country = country.id,
            tile = worldObject.tile,
            attributes = Settlement.Attributes(
                name = command.data.name,
                color = RGBColor.random(),
                viewDistance = 1,
            ),
            infrastructure = Settlement.Infrastructure(
                productionQueue = mutableListOf(),
                buildings = mutableListOf<Building>().also {
                    it.add(Building(
                        type = BuildingType.DEV_FACTORY,
                        workedTile = null,
                        active = true,
                        details = DetailLog()
                    ))
                },
            ),
            resourceLedger = ResourceLedger.empty()
        )

        val province = Province(
            id = Province.Id.gen(),
            country = country.id,
            settlements = mutableSetOf(settlement.id),
            color = RGBColor.random(),
        )

        game.settlements.add(settlement)
        game.provinces.add(province)
        game.worldObjects.remove(worldObject)
    }


    @JvmName("resolveDirect")
    fun resolve(game: GameExtended, command: Command<CommandData.CreateSettlementDirect>) {
        log().debug("Resolving create settlement direct command at tile ${command.data.tile} with name ${command.data.name}")

        val country = game.findCountryByUser(command.user)
        val tile = game.findTile(command.data.tile)

        gameValidations.validateSettlementName(command.data.name)
        gameValidations.validateSettlementLocationDirect(game, tile, country.id)

        val settlement = Settlement(
            id = Settlement.Id.gen(),
            country = country.id,
            tile = tile.ref(),
            attributes = Settlement.Attributes(
                name = command.data.name,
                color = RGBColor.random(),
                viewDistance = 1,
            ),
            infrastructure = Settlement.Infrastructure(
                productionQueue = mutableListOf(),
                buildings = mutableListOf<Building>().also {
                    it.add(Building(
                        type = BuildingType.DEV_FACTORY,
                        workedTile = null,
                        active = true,
                        details = DetailLog()
                    ))
                },
            ),
            resourceLedger = ResourceLedger.empty()
        )

        val province = tile.dataPolitical.controlledBy?.province?.let { game.findProvince(it) }

        if (province == null || tile.dataPolitical.controlledBy?.country != country.id) {
            throw Exception("Can not create direct settlement on tile not owned by country.")
        }

        province.settlements.add(settlement.id)
        game.settlements.add(settlement)
    }
}