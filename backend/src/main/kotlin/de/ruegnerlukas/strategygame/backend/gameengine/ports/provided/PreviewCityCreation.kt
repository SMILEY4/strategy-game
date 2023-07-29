package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewRequest

interface PreviewCityCreation {

    sealed interface PreviewCityCreationError

    object GameNotFoundError : PreviewCityCreationError {
        override fun toString(): String = this.javaClass.simpleName
    }

    object CountryNotFoundError : PreviewCityCreationError {
        override fun toString(): String = this.javaClass.simpleName
    }

    suspend fun perform(
        gameId: String,
        userId: String,
        request: CityCreationPreviewRequest
    ): Either<PreviewCityCreationError, CityCreationPreviewData>

}