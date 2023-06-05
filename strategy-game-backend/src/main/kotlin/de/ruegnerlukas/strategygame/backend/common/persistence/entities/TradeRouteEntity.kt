package de.ruegnerlukas.strategygame.backend.common.persistence.entities

import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TradeRoute

class TradeRouteEntity(
	val srcProvinceId: String,
	val dstProvinceId: String,
	val routeIds: List<String>,
	val resourceType: ResourceType,
	val rating: Float,
	val creationTurn: Int,
) {

	companion object {

		fun of(serviceModel: TradeRoute) = TradeRouteEntity(
			srcProvinceId = serviceModel.srcProvinceId,
			dstProvinceId = serviceModel.dstProvinceId,
			routeIds = serviceModel.routeIds,
			resourceType = serviceModel.resourceType,
			rating = serviceModel.rating,
			creationTurn = serviceModel.creationTurn
		)

	}

	fun asServiceModel() = TradeRoute(
		srcProvinceId = this.srcProvinceId,
		dstProvinceId = this.dstProvinceId,
		routeIds = this.routeIds,
		resourceType = this.resourceType,
		rating = this.rating,
		creationTurn = this.creationTurn,
	)

}