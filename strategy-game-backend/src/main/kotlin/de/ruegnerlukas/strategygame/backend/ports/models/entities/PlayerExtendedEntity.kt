package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class PlayerExtendedEntity(
	val player: PlayerEntity,
	val country: CountryEntity
)
