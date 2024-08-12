package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.Id
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CreateSettlementWithSettlerCommandData
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.engine.edge.GameValidations

internal class ResolveCommandCreateSettlement(private val gameValidations: GameValidations) : Logging {

    fun resolve(game: GameExtended, command: Command<CreateSettlementWithSettlerCommandData>) {
        log().debug("Resolving create settlement command for object ${command.data.worldObjectId} with name ${command.data.name}")

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

        game.settlements.add(settlement)
        game.worldObjects.remove(settler)

        positionsCircle(settlement.tile, settlement.viewDistance).forEach { pos ->
            game.findTileOrNull(pos)?.discoveredByCountries?.add(settlement.countryId)
        }
    }

}