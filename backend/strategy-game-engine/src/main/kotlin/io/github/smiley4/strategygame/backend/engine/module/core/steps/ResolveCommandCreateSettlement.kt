package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.Id
import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementDirectCommandData
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementWithSettlerCommandData
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Province
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
        gameValidations.validateSettlementLocation(game, tile)

        val settlement = Settlement(
            settlementId = Id.gen(),
            countryId = country.countryId,
            tile = settler.tile,
            name = command.data.name,
            viewDistance = 1
        )

        val province = Province(
            provinceId = Id.gen(),
            settlementIds = mutableSetOf(settlement.settlementId),
        )

        game.settlements.add(settlement)
        game.provinces.add(province)
        game.worldObjects.remove(settler)

        positionsCircle(settlement.tile, settlement.viewDistance).forEach { pos ->
            game.findTileOrNull(pos)?.dataPolitical?.discoveredByCountries?.add(settlement.countryId)
        }
    }

    @JvmName("resolveDirect")
    fun resolve(game: GameExtended, command: Command<CreateSettlementDirectCommandData>) {
        log().debug("Resolving create settlement direct command at tile ${command.data.tile} with name ${command.data.name}")

        val country = game.findCountryByUser(command.userId)
        val tile = game.findTile(command.data.tile)

        gameValidations.validateSettlementName(command.data.name)
        gameValidations.validateSettlementLocation(game, tile)

        val settlement = Settlement(
            settlementId = Id.gen(),
            countryId = country.countryId,
            tile = tile.ref(),
            name = command.data.name,
            viewDistance = 1
        )

        val closestSettlement = game.settlements // todo: province assignment temporary until territory is implemented -> SG-191
            .minByOrNull { it.tile.distance(settlement.tile) }
            ?: throw Exception("Validation: settlement requires host province")

        game.findProvinceBySettlement(closestSettlement.settlementId).settlementIds.add(settlement.settlementId)
        game.settlements.add(settlement)

        positionsCircle(settlement.tile, settlement.viewDistance).forEach { pos ->
            game.findTileOrNull(pos)?.dataPolitical?.discoveredByCountries?.add(settlement.countryId)
        }
    }

}