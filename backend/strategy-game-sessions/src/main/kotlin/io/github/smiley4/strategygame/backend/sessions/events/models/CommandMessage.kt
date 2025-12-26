@file:OptIn(ExperimentalSerializationApi::class)

package io.github.smiley4.strategygame.backend.sessions.events.models

import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileImprovementType
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonClassDiscriminator

@Serializable
@JsonClassDiscriminator("commandType")
sealed interface CommandMessage {

    fun convert(): CommandData


    @Serializable
    @SerialName("move")
    class Move(
        val worldObject: String,
        val path: List<TileRefDto>,
    ) : CommandMessage {

        override fun convert() = CommandData.Move(
            worldObject = WorldObject.Id(this.worldObject),
            path = this.path.map { Tile.Ref(Tile.Id(it.id), Tile.Position(it.q, it.r)) },
        )

    }


    @Serializable
    @SerialName("disband")
    class Disband(
        val worldObject: String,
    ) : CommandMessage {

        override fun convert() = CommandData.Disband(
            worldObject = WorldObject.Id(this.worldObject),
        )

    }


    @Serializable
    @SerialName("construct-tile-improvement")
    class ConstructTileImprovement(
        val worldObject: String,
        val improvement: String,
    ) : CommandMessage {

        override fun convert() = CommandData.ConstructTileImprovement(
            worldObject = WorldObject.Id(this.worldObject),
            improvement = TileImprovementType.valueOf(this.improvement)
        )

    }


    @Serializable
    @SerialName("construct-settlement")
    class ConstructSettlement(
        val worldObject: String,
        val tile: TileRefDto,
        val settlementName: String
    ) : CommandMessage {

        override fun convert() = CommandData.SpawnSettlement(
            worldObject = WorldObject.Id(this.worldObject),
            tile = Tile.Ref(Tile.Id(this.tile.id), Tile.Position(this.tile.q, this.tile.r)),
            settlementName = this.settlementName,
        )

    }


    @Serializable
    @SerialName("add-production-queue-item")
    class AddProductionQueueItem(
        val worldObject: String,
        val item: String
    ) : CommandMessage {

        override fun convert() = CommandData.AddProductionQueueItem(
            worldObject = WorldObject.Id(this.worldObject),
            item = when(this.item) {
                "worker" -> WorldObjectComponent.Production.ProductionQueueEntry.Worker()
                "scout" -> WorldObjectComponent.Production.ProductionQueueEntry.Scout()
                else -> throw Exception("Invalid production queue item type")
            }
        )

    }

}


@Serializable
data class TileRefDto(
    val id: String,
    val q: Int,
    val r: Int,
)

