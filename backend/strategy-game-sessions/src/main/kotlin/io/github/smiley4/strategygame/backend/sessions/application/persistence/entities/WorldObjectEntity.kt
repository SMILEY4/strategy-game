package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent

internal class WorldObjectEntity(
    val id: String,
    val realmId: String,
    val gameId: String,
    val type: String,
    val tile: TileRefEntity,
    val components: List<WorldObjectComponentEntity>,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: WorldObject, gameId: String): WorldObjectEntity {
            return WorldObjectEntity(
                id = serviceModel.id.value,
                realmId = serviceModel.realmId.value,
                gameId = gameId,
                type = serviceModel.type,
                tile = TileRefEntity.of(serviceModel.tile),
                components = serviceModel.components.map {
                    when (it) {
                        is WorldObjectComponent.Movement -> WorldObjectComponentEntity.Movement(
                            maxMovement = it.maxMovement,
                        )
                        is WorldObjectComponent.Vision -> WorldObjectComponentEntity.Vision(
                            maxVisionDistance = it.maxVisionDistance
                        )
                    }
                }
            )
        }
    }

    fun asServiceModel(): WorldObject {
        return WorldObject(
            id = WorldObject.Id(this.id),
            realmId = Realm.Id(this.realmId),
            type = this.type,
            tile = this.tile.asServiceModel(),
            components = this.components.map {
                when (it) {
                    is WorldObjectComponentEntity.Movement -> WorldObjectComponent.Movement(
                        maxMovement = it.maxMovement,
                    )
                    is WorldObjectComponentEntity.Vision -> WorldObjectComponent.Vision(
                        maxVisionDistance = it.maxVisionDistance
                    )
                }
            }
        )
    }

}


@JsonTypeInfo(
    use = JsonTypeInfo.Id.SIMPLE_NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed interface WorldObjectComponentEntity {

    data class Movement(
        val maxMovement: Int
    ) : WorldObjectComponentEntity

    data class Vision(
        val maxVisionDistance: Int
    ) : WorldObjectComponentEntity

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