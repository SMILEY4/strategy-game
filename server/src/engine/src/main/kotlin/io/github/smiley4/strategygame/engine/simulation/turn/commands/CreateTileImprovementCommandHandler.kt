package io.github.smiley4.strategygame.engine.simulation.turn.commands

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.PlayerCommand
import io.github.smiley4.strategygame.engine.simulation.gamestate.Route
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.distance
import io.github.smiley4.strategygame.engine.simulation.gamestate.iterateCircle
import io.github.smiley4.strategygame.engine.simulation.turn.tools.Pathfinder
import io.github.smiley4.strategygame.engine.simulation.turn.tools.TileImprovementValidation

internal class CreateTileImprovementCommandHandler : CommandHandler<PlayerCommand.CreateTileImprovement> {

    override val commandType = PlayerCommand.CreateTileImprovement::class

    val pathfinder = Pathfinder({ current, target ->
        if (target.world.biome == Tile.Biome.OCEAN) {
            return@Pathfinder 99999f
        }
        if (target.world.elevation == Tile.Elevation.MOUNTAINS) {
            return@Pathfinder 5f
        }
        if (target.world.elevation == Tile.Elevation.HILLS) {
            return@Pathfinder 3f
        }
        if (target.world.feature == Tile.Feature.FOREST) {
            return@Pathfinder 1.25f
        }
        1f;
    })

    override fun handle(gameState: GameStateContext, command: PlayerCommand.CreateTileImprovement) {

        val realm = gameState.realms.first { it.user == command.playerId }
        val targetTile = gameState.tiles.first { it.position == command.location }
        val settlement = gameState.entities.first { it.id == command.settlement && it.hasComponent<EntityComponent.Settlement>() }

        // validate
        if (!TileImprovementValidation.validate(gameState, command.location, realm.id, command.improvementKey)) {
            throw IllegalArgumentException("Invalid tile-improvement command")
        }

        // find route to settlement
        val pathResult = pathfinder.find(
            gameState.tiles,
            settlement.getComponent<EntityComponent.Position>().tile,
            targetTile.ref()
        )
        if (pathResult == null) {
            throw IllegalArgumentException("No valid route could be found.")
        }

        // create tile improvement
        val tileImprovement = Entity(
            id = Entity.Id(),
            owner = realm.id,
            components = listOf(
                EntityComponent.Position(tile = targetTile.ref()),
                EntityComponent.Vision(radius = 2),
                EntityComponent.Control(amount = 2f),
                EntityComponent.TileImprovement(
                    key = command.improvementKey,
                    administeringSettlement = settlement.id,
                ),
            )
        )
        gameState.entities.add(tileImprovement)

        // create route
        gameState.routes.add(
            Route(
                id = Route.Id(),
                from = settlement.id,
                to = tileImprovement.id,
                tiles = pathResult.tiles.map { it.ref() },
                cost = pathResult.cost,
            )
        )

        // mark tiles as discovered
        val vision = tileImprovement.getComponent<EntityComponent.Vision>();
        targetTile.position.iterateCircle(vision.radius) { pos ->
            gameState.tiles.find { it.position == pos }?.also {
                it.political.discoveredBy.add(realm.id)
            }
        }

        // mark tile immediately as owned
        targetTile.political.ownerRealm = realm.id

    }
}
