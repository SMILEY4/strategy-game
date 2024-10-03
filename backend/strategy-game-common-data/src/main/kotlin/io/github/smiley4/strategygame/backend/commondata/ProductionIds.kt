package io.github.smiley4.strategygame.backend.commondata

object ProductionIds {

    fun settler() = "unit.settler"

    fun isSettler(id: String) = id == settler()

    fun building(type: BuildingType) = "building.${type.name}"

    fun isBuilding(id: String) = id.startsWith("building.", true)

    fun extractBuilding(id: String): BuildingType {
        return if (isBuilding(id)) {
            BuildingType.valueOf(id.replace("building.", ""))
        } else {
            throw UnsupportedOperationException("id does not represent building-type")
        }
    }

}