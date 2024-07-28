package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.ScoutWorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObject

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = ScoutWorldObjectEntity::class),
)
internal sealed class WorldObjectEntity(
    val type: String,
    val gameId: String,
    val tile: TileRefEntity,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: WorldObject, gameId: String): WorldObjectEntity {
            return when (serviceModel) {
                is ScoutWorldObject -> ScoutWorldObjectEntity(
                    gameId = gameId,
                    key = DbId.asDbId(serviceModel.id),
                    tile = TileRefEntity.of(serviceModel.tile),
                )
            }
        }
    }

    fun asServiceModel(): WorldObject {
        return when (this) {
            is ScoutWorldObjectEntity -> ScoutWorldObject(
                id = this.getKeyOrThrow(),
                tile = this.tile.asServiceModel(),
            )
        }
    }

}


@JsonTypeName(ScoutWorldObjectEntity.TYPE)
internal class ScoutWorldObjectEntity(
    key: String?,
    gameId: String,
    tile: TileRefEntity,
) : WorldObjectEntity(TYPE, gameId, tile, key) {
    companion object {
        internal const val TYPE = "scout"
    }
}