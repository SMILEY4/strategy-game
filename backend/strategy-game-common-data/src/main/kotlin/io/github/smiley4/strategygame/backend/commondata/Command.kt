package io.github.smiley4.strategygame.backend.commondata


class Command<T : CommandData>(
    val id: Id,
    val game: Game.Id,
    val user: User.Id,
    val turn: Int,
    val data: T
) {

    @JvmInline
    value class Id(val value: String)

}

sealed class CommandData {

    /**
     * Move the given world object along the given path.
     */
    class Move(
        val worldObject: WorldObject.Id,
        val path: List<Tile.Ref>
    ) : CommandData()


    /**
     * Disband / Delete the given world object.
     */
    class Disband(
        val worldObject: WorldObject.Id,
    ) : CommandData()


    /**
     * Use the given world object to construct a tile improvement.
     */
    class ConstructTileImprovement(
        val worldObject: WorldObject.Id,
        val improvement: TileImprovementType,
    ) : CommandData()

    /**
     * Use the given world object to spawn a new settlement.
     */
    class SpawnSettlement(
        val worldObject: WorldObject.Id,
        val tile: Tile.Ref,
        val settlementName: String
    ) : CommandData()

}
