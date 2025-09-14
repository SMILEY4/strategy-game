package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.WorldObject

@JsonTypeInfo(
    use = JsonTypeInfo.Id.SIMPLE_NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal class WorldObjectEntity(
    val id: String,
    val gameId: String,
    val tile: TileRefEntity,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: WorldObject, gameId: String): WorldObjectEntity {
            return WorldObjectEntity(
                id = serviceModel.id.value,
                gameId = gameId,
                tile = TileRefEntity.of(serviceModel.tile),
            )
        }
    }

    fun asServiceModel(): WorldObject {
        return WorldObject(
            id = WorldObject.Id(this.id),
            tile = this.tile.asServiceModel()
        )
    }

}

/**
 * Required to retain type information (i.e. data from JsonTypeInfo) of otherwise generic list during serialization.
 * "type"-field will be missing otherwise if serialized as elements of a generic list.
 * See https://github.com/FasterXML/jackson-databind/pull/1309
 */
internal class WorldObjectEntityCollection : ArrayList<WorldObjectEntity>() {
    companion object {
        fun Collection<WorldObjectEntity>.toTypedCollection(): WorldObjectEntityCollection {
            return WorldObjectEntityCollection().also { it.addAll(this) }
        }
    }
}