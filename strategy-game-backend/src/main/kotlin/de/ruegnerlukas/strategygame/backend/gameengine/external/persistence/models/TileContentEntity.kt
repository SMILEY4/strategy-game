package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileContent

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = MarkerTileEntityContent::class),
    JsonSubTypes.Type(value = ScoutTileEntityContent::class),
)
sealed class TileContentEntity(val type: String) {

    companion object {
        fun of(serviceModel: TileContent): TileContentEntity {
            return when (serviceModel) {
                is MarkerTileContent -> MarkerTileEntityContent(
                    countryId = serviceModel.countryId
                )
                is ScoutTileContent -> ScoutTileEntityContent(
                    countryId = serviceModel.countryId,
                    turn = serviceModel.turn
                )
            }
        }
    }

    fun asServiceModel(): TileContent {
        return when (this) {
            is MarkerTileEntityContent -> MarkerTileContent(
                countryId = this.countryId
            )
            is ScoutTileEntityContent -> ScoutTileContent(
                countryId = this.countryId,
                turn = this.turn
            )
        }
    }

}

@JsonTypeName(MarkerTileEntityContent.TYPE)
class MarkerTileEntityContent(
    val countryId: String
) : TileContentEntity(TYPE) {
    companion object {
        internal const val TYPE = "marker"
    }
}

@JsonTypeName(ScoutTileEntityContent.TYPE)
class ScoutTileEntityContent(
    val countryId: String,
    val turn: Int
) : TileContentEntity(TYPE) {
    companion object {
        internal const val TYPE = "scout"
    }
}