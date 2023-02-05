package de.ruegnerlukas.strategygame.backend.ports.models

data class TradeRoute(
	val srcProvinceId: String,
	val dstProvinceId: String,
	val routeIds: List<String>,
	val resourceType: ResourceType,
	val rating: Float,
	val creationTurn: Int,
)