package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import io.github.smiley4.strategygame.backend.commondata.WorldObjectType

internal class WorldObjectEntity(
    val realmId: String,
    val gameId: String,
    val type: WorldObjectTypeEntity,
    val tile: TileRefEntity,
    val components: List<WorldObjectComponentEntity>,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: WorldObject, gameId: String): WorldObjectEntity {
            return WorldObjectEntity(
                key = serviceModel.id.value,
                realmId = serviceModel.realm.value,
                gameId = gameId,
                type = WorldObjectTypeEntity(
                    group = serviceModel.type.group,
                    name = serviceModel.type.name
                ),
                tile = TileRefEntity.of(serviceModel.tile),
                components = serviceModel.components.map {
                    when (it) {
                        is WorldObjectComponent.Movement -> WorldObjectComponentEntity.Movement(
                            maxMovement = it.maxMovement,
                        )
                        is WorldObjectComponent.Vision -> WorldObjectComponentEntity.Vision(
                            radius = it.radius
                        )
                    }
                }
            )
        }
    }

    fun asServiceModel(): WorldObject {
        return WorldObject(
            id = WorldObject.Id(this.getKeyOrThrow()),
            realm = Realm.Id(this.realmId),
            type = WorldObjectType(
                group = this.type.group,
                name = this.type.name
            ),
            tile = this.tile.asServiceModel(),
            components = this.components.map {
                when (it) {
                    is WorldObjectComponentEntity.Movement -> WorldObjectComponent.Movement(
                        maxMovement = it.maxMovement,
                    )
                    is WorldObjectComponentEntity.Vision -> WorldObjectComponent.Vision(
                        radius = it.radius
                    )
                }
            }
        )
    }

}

data class WorldObjectTypeEntity(
    val group: String,
    val name: String,
)

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
        val radius: Int
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