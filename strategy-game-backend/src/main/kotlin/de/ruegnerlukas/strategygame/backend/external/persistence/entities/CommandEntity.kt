package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CommandData
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueAddEntryCommandData

class CommandEntity<T : CommandEntityData>(
    val countryId: String,
    val turn: Int,
    val data: T,
    key: String? = null,
) : DbEntity(key) {

    companion object {

        fun of(serviceModel: Command<*>) = CommandEntity(
            key = DbId.asDbId(serviceModel.commandId),
            countryId = serviceModel.countryId,
            turn = serviceModel.turn,
            data = of(serviceModel.data)
        )

        private fun of(serviceModel: CommandData): CommandEntityData {
            return when (serviceModel) {
                is CreateCityCommandData -> CreateCityCommandEntityData(
                    q = serviceModel.q,
                    r = serviceModel.r,
                    name = serviceModel.name,
                    withNewProvince = serviceModel.withNewProvince
                )
                is PlaceMarkerCommandData -> PlaceMarkerCommandEntityData(
                    q = serviceModel.q,
                    r = serviceModel.r,
                )
                is PlaceScoutCommandData -> PlaceScoutCommandEntityData(
                    q = serviceModel.q,
                    r = serviceModel.r,
                )
                is ProductionQueueAddEntryCommandData -> ProductionQueueAddEntryCommandEntityData(
                    cityId = serviceModel.cityId,
                    buildingType = serviceModel.buildingType
                )
            }
        }

    }

    fun asServiceModel() = Command(
        commandId = this.getKeyOrThrow(),
        countryId = this.countryId,
        turn = this.turn,
        data = asServiceModel(this.data)
    )

    private fun asServiceModel(entity: CommandEntityData): CommandData {
        return when (entity) {
            is CreateCityCommandEntityData -> CreateCityCommandData(
                q = entity.q,
                r = entity.r,
                name = entity.name,
                withNewProvince = entity.withNewProvince
            )
            is PlaceMarkerCommandEntityData -> PlaceMarkerCommandData(
                q = entity.q,
                r = entity.r,
            )
            is PlaceScoutCommandEntityData -> PlaceScoutCommandData(
                q = entity.q,
                r = entity.r,
            )
            is ProductionQueueAddEntryCommandEntityData -> ProductionQueueAddEntryCommandData(
                cityId = entity.cityId,
                buildingType = entity.buildingType
            )
        }
    }

}


@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = CreateCityCommandEntityData::class),
    JsonSubTypes.Type(value = PlaceMarkerCommandEntityData::class),
    JsonSubTypes.Type(value = PlaceScoutCommandEntityData::class),
    JsonSubTypes.Type(value = ProductionQueueAddEntryCommandEntityData::class),
)
sealed class CommandEntityData(
    val type: String
)


@JsonTypeName(CreateCityCommandEntityData.TYPE)
class CreateCityCommandEntityData(
    val q: Int,
    val r: Int,
    val name: String,
    val withNewProvince: Boolean,
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "create-city"
    }
}


@JsonTypeName(PlaceMarkerCommandEntityData.TYPE)
class PlaceMarkerCommandEntityData(
    val q: Int,
    val r: Int
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "place-marker"
    }
}


@JsonTypeName(PlaceScoutCommandEntityData.TYPE)
class PlaceScoutCommandEntityData(
    val q: Int,
    val r: Int
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "place-scout"
    }
}


@JsonTypeName(ProductionQueueAddEntryCommandEntityData.TYPE)
class ProductionQueueAddEntryCommandEntityData(
    val cityId: String,
    val buildingType: BuildingType
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-add-entry"
    }
}