package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.CommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueAddBuildingEntryCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueAddSettlerEntryCommandData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.ProductionQueueRemoveEntryCommandData

class CommandEntity<T : CommandEntityData>(
    val userId: String,
    val gameId: String,
    val turn: Int,
    val data: T,
    key: String? = null,
) : DbEntity(key) {

    companion object {

        fun of(serviceModel: Command<*>) = CommandEntity(
            key = DbId.asDbId(serviceModel.commandId),
            userId = serviceModel.userId,
            gameId = serviceModel.gameId,
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
                is ProductionQueueAddBuildingEntryCommandData -> ProductionQueueAddBuildingEntryCommandEntityData(
                    cityId = serviceModel.cityId,
                    buildingType = serviceModel.buildingType
                )
                is ProductionQueueAddSettlerEntryCommandData -> ProductionQueueAddSettlerEntryCommandEntityData(
                    cityId = serviceModel.cityId,
                )
                is ProductionQueueRemoveEntryCommandData -> ProductionQueueRemoveEntryCommandEntityData(
                    cityId = serviceModel.cityId,
                    queueEntryId = serviceModel.queueEntryId
                )
            }
        }

    }

    fun asServiceModel() = Command(
        commandId = this.getKeyOrThrow(),
        userId = this.userId,
        gameId = this.gameId,
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
            is ProductionQueueAddBuildingEntryCommandEntityData -> ProductionQueueAddBuildingEntryCommandData(
                cityId = entity.cityId,
                buildingType = entity.buildingType
            )
            is ProductionQueueAddSettlerEntryCommandEntityData -> ProductionQueueAddSettlerEntryCommandData(
                cityId = entity.cityId,
            )
            is ProductionQueueRemoveEntryCommandEntityData -> ProductionQueueRemoveEntryCommandData(
                cityId = entity.cityId,
                queueEntryId = entity.queueEntryId
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
    JsonSubTypes.Type(value = ProductionQueueAddBuildingEntryCommandEntityData::class),
    JsonSubTypes.Type(value = ProductionQueueAddSettlerEntryCommandEntityData::class),
    JsonSubTypes.Type(value = ProductionQueueRemoveEntryCommandEntityData::class),
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


@JsonTypeName(ProductionQueueAddBuildingEntryCommandEntityData.TYPE)
class ProductionQueueAddBuildingEntryCommandEntityData(
    val cityId: String,
    val buildingType: BuildingType
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-add-entry.building"
    }
}


@JsonTypeName(ProductionQueueAddSettlerEntryCommandEntityData.TYPE)
class ProductionQueueAddSettlerEntryCommandEntityData(
    val cityId: String,
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-add-entry.settler"
    }
}


@JsonTypeName(ProductionQueueRemoveEntryCommandEntityData.TYPE)
class ProductionQueueRemoveEntryCommandEntityData(
    val cityId: String,
    val queueEntryId: String
) : CommandEntityData(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-remove-entry"
    }
}