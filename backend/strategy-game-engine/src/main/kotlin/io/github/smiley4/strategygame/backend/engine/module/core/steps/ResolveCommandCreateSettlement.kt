package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.Id
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementDirectCommandData
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementWithSettlerCommandData
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.RGBColor
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.edge.GameValidations

internal class ResolveCommandCreateSettlement(private val gameValidations: GameValidations) : Logging {

    @JvmName("resolveWithSettler")
    fun resolve(game: GameExtended, command: Command<CreateSettlementWithSettlerCommandData>) {
        log().debug("Resolving create settlement with settler command for object ${command.data.worldObjectId} with name ${command.data.name}")

        val country = game.findCountryByUser(command.userId)
        val settler = game.findWorldObject(command.data.worldObjectId)
        val tile = game.findTile(settler.tile)

        gameValidations.validateSettlementName(command.data.name)
        gameValidations.validateSettlementLocationSettler(game, tile, country.countryId)

        val settlement = Settlement(
            settlementId = Id.gen(),
            countryId = country.countryId,
            tile = settler.tile,
            name = command.data.name,
            viewDistance = 1,
            color = RGBColor.random(),
            productionQueue = mutableListOf()
        )

        val province = Province(
            provinceId = Id.gen(),
            settlementIds = mutableSetOf(settlement.settlementId),
            color = RGBColor.random()
        )

        game.settlements.add(settlement)
        game.provinces.add(province)
        game.worldObjects.remove(settler)
    }


    @JvmName("resolveDirect")
    fun resolve(game: GameExtended, command: Command<CreateSettlementDirectCommandData>) {
        log().debug("Resolving create settlement direct command at tile ${command.data.tile} with name ${command.data.name}")

        val country = game.findCountryByUser(command.userId)
        val tile = game.findTile(command.data.tile)

        gameValidations.validateSettlementName(command.data.name)
        gameValidations.validateSettlementLocationDirect(game, tile, country.countryId)

        val settlement = Settlement(
            settlementId = Id.gen(),
            countryId = country.countryId,
            tile = tile.ref(),
            name = command.data.name,
            viewDistance = 1,
            color = RGBColor.random(),
            productionQueue = mutableListOf()
        )

        val province = tile.dataPolitical.controlledBy?.provinceId?.let { game.findProvince(it) }

        if (province == null || tile.dataPolitical.controlledBy?.countryId != country.countryId) {
            throw Exception("Can not create direct settlement on tile not owned by country.")
        }

        province.settlementIds.add(settlement.settlementId)
        game.settlements.add(settlement)
    }

}