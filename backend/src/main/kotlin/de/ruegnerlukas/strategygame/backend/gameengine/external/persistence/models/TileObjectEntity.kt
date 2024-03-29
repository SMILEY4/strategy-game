package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.MarkerTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ScoutTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileObject

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = MarkerTileObjectEntity::class),
    JsonSubTypes.Type(value = ScoutTileObjectEntity::class),
    JsonSubTypes.Type(value = CityTileObjectEntity::class),
)
sealed class TileObjectEntity(
    val type: String,
    val countryId: String
) {

    companion object {
        fun of(serviceModel: TileObject): TileObjectEntity {
            return when (serviceModel) {
                is ScoutTileObject -> ScoutTileObjectEntity(
                    countryId = serviceModel.countryId,
                    creationTurn = serviceModel.creationTurn,
                )
                is CityTileObject -> CityTileObjectEntity(
                    countryId = serviceModel.countryId,
                    cityId = serviceModel.cityId,
                )
                is MarkerTileObject -> MarkerTileObjectEntity(
                    countryId = serviceModel.countryId,
                    label = serviceModel.label
                )
            }
        }
    }

    fun asServiceModel(): TileObject {
        return when (this) {
            is ScoutTileObjectEntity -> ScoutTileObject(
                countryId = this.countryId,
                creationTurn = this.creationTurn,
            )
            is CityTileObjectEntity -> CityTileObject(
                countryId = this.countryId,
                cityId = this.cityId,
            )
            is MarkerTileObjectEntity -> MarkerTileObject(
                countryId = this.countryId,
                label = this.label
            )
        }
    }

}


@JsonTypeName(MarkerTileObjectEntity.TYPE)
class MarkerTileObjectEntity(
    countryId: String,
    val label: String
) : TileObjectEntity(TYPE, countryId) {
    companion object {
        internal const val TYPE = "marker"
    }
}

@JsonTypeName(ScoutTileObjectEntity.TYPE)
class ScoutTileObjectEntity(
    countryId: String,
    val creationTurn: Int,
) : TileObjectEntity(TYPE, countryId) {
    companion object {
        internal const val TYPE = "scout"
    }
}


@JsonTypeName(CityTileObjectEntity.TYPE)
class CityTileObjectEntity(
    countryId: String,
    val cityId: String,
) : TileObjectEntity(TYPE, countryId) {
    companion object {
        internal const val TYPE = "city"
    }
}