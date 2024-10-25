package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.WorldObject

@JsonTypeInfo(
    use = JsonTypeInfo.Id.MINIMAL_CLASS,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed class WorldObjectEntity(
    val gameId: String,
    val tile: TileRefEntity,
    val countryId: String,
    val maxMovement: Int,
    val viewDistance: Int,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: WorldObject, gameId: String): WorldObjectEntity {
            return when (serviceModel) {
                is WorldObject.Scout -> ScoutWorldObjectEntity(
                    gameId = gameId,
                    key = DbId.asDbId(serviceModel.id.value),
                    tile = TileRefEntity.of(serviceModel.tile),
                    countryId = serviceModel.country.value,
                    maxMovement = serviceModel.maxMovement,
                    viewDistance = serviceModel.viewDistance
                )
                is WorldObject.Settler -> SettlerWorldObjectEntity(
                    gameId = gameId,
                    key = DbId.asDbId(serviceModel.id.value),
                    tile = TileRefEntity.of(serviceModel.tile),
                    countryId = serviceModel.country.value,
                    maxMovement = serviceModel.maxMovement,
                    viewDistance = serviceModel.viewDistance
                )
            }
        }
    }

    fun asServiceModel(): WorldObject {
        return when (this) {
            is ScoutWorldObjectEntity -> WorldObject.Scout(
                id = WorldObject.Id(this.getKeyOrThrow()),
                tile = this.tile.asServiceModel(),
                country = Country.Id(this.countryId),
                maxMovement = this.maxMovement,
                viewDistance = this.viewDistance
            )
            is SettlerWorldObjectEntity -> WorldObject.Settler(
                id = WorldObject.Id(this.getKeyOrThrow()),
                tile = this.tile.asServiceModel(),
                country = Country.Id(this.countryId),
                maxMovement = this.maxMovement,
                viewDistance = this.viewDistance
            )
        }
    }

}


internal class ScoutWorldObjectEntity(
    key: String?,
    gameId: String,
    tile: TileRefEntity,
    countryId: String,
    maxMovement: Int,
    viewDistance: Int,
) : WorldObjectEntity(
    gameId = gameId,
    tile = tile,
    countryId = countryId,
    maxMovement = maxMovement,
    viewDistance = viewDistance,
    key = key
)


internal class SettlerWorldObjectEntity(
    key: String?,
    gameId: String,
    tile: TileRefEntity,
    countryId: String,
    maxMovement: Int,
    viewDistance: Int,
) : WorldObjectEntity(
    gameId = gameId,
    tile = tile,
    countryId = countryId,
    maxMovement = maxMovement,
    viewDistance = viewDistance,
    key = key
)

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