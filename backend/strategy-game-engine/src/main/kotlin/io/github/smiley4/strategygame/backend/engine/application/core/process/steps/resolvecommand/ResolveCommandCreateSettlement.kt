package io.github.smiley4.strategygame.backend.engine.application.core.process.steps.resolvecommand

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.RGBColor
import io.github.smiley4.strategygame.backend.commondata.ResourceLedger
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.CreatedSettlementEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessEventPublisher
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameValidations

internal class ResolveCommandCreateSettlement(
    private val gameValidations: GameValidations,
    private val publisher: ProcessEventPublisher
) : Logging {

    suspend fun resolve(game: GameExtended, command: Command<CommandData.CreateSettlement>) {
        log().debug("Resolving create settlement with world-object command for object ${command.data.worldObject} with name ${command.data.name}")

        val country = game.findCountryByUser(command.user)
        val worldObject = game.findWorldObject(command.data.worldObject)
        val tile = game.findTile(worldObject.tile)

        gameValidations.validateSettler(worldObject)
        gameValidations.validateSettlementName(command.data.name)
        gameValidations.validateSettlementLocation(game, tile, country.id)

        val settlement = Settlement(
            id = Settlement.Id.gen(),
            country = country.id,
            tile = worldObject.tile,
            attributes = Settlement.Attributes(
                name = command.data.name,
                color = RGBColor.random(),
                viewDistance = 1,
            ),
            population = Settlement.Population(
                size = 1,
                growthProgress = 0f,
                growthAmount = 0f,
                growthDetails = mutableMapOf()
            ),
            infrastructure = Settlement.Infrastructure(
                productionQueue = mutableListOf(),
                buildings = mutableListOf(),
            ),
            resourceLedger = ResourceLedger.empty()
        )

        game.settlements.add(settlement)
        game.worldObjects.remove(worldObject)

        publisher.publish(CreatedSettlementEvent(game, settlement))
    }

}