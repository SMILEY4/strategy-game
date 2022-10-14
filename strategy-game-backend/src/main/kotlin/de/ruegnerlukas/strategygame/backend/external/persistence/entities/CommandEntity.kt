package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CommandData
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.CreateTownCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData


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
                is CreateBuildingCommandData -> CreateBuildingCommandEntityData(
                    cityId = serviceModel.cityId,
                    buildingType = serviceModel.buildingType
                )
                is CreateCityCommandData -> CreateCityCommandEntityData(
                    q = serviceModel.q,
                    r = serviceModel.r,
                    name = serviceModel.name
                )
                is CreateTownCommandData -> CreateTownCommandEntityData(
                    q = serviceModel.q,
                    r = serviceModel.r,
                    name = serviceModel.name,
                    parentCity = serviceModel.parentCity
                )
                is PlaceMarkerCommandData -> PlaceMarkerCommandEntityData(
                    q = serviceModel.q,
                    r = serviceModel.r,
                )
                is PlaceScoutCommandData -> PlaceScoutCommandEntityData(
                    q = serviceModel.q,
                    r = serviceModel.r,
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
            is CreateBuildingCommandEntityData -> CreateBuildingCommandData(
                cityId = entity.cityId,
                buildingType = entity.buildingType
            )
            is CreateCityCommandEntityData -> CreateCityCommandData(
                q = entity.q,
                r = entity.r,
                name = entity.name
            )
            is CreateTownCommandEntityData -> CreateTownCommandData(
                q = entity.q,
                r = entity.r,
                name = entity.name,
                parentCity = entity.parentCity
            )
            is PlaceMarkerCommandEntityData -> PlaceMarkerCommandData(
                q = entity.q,
                r = entity.r,
            )
            is PlaceScoutCommandEntityData -> PlaceScoutCommandData(
                q = entity.q,
                r = entity.r,
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
    JsonSubTypes.Type(value = CreateTownCommandEntityData::class),
    JsonSubTypes.Type(value = CreateBuildingCommandEntityData::class),
    JsonSubTypes.Type(value = PlaceMarkerCommandEntityData::class),
    JsonSubTypes.Type(value = PlaceScoutCommandEntityData::class),
)
sealed class CommandEntityData(
    val type: String
)


@JsonTypeName(CreateCityCommandEntityData.TYPE)
class CreateCityCommandEntityData(
    val q: Int,
    val r: Int,
    val name: String,
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "create-city"
    }
}


@JsonTypeName(CreateTownCommandEntityData.TYPE)
class CreateTownCommandEntityData(
    val q: Int,
    val r: Int,
    val name: String,
    val parentCity: String
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "create-town"
    }
}


@JsonTypeName(CreateBuildingCommandEntityData.TYPE)
class CreateBuildingCommandEntityData(
    val cityId: String,
    val buildingType: BuildingType,
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "create-building"
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