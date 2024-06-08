package io.github.smiley4.strategygame.backend.app.testdsl.assertions

import io.github.smiley4.strategygame.backend.app.testdsl.GameTestContext
import io.github.smiley4.strategygame.backend.app.testutils.TestUtils
import io.github.smiley4.strategygame.backend.common.utils.coApply
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull

suspend fun GameTestContext.expectNoMarkers() {
    expectMarkers { }
}


suspend fun GameTestContext.expectMarkers(
    expectation: ElementExpectation = ElementExpectation.EXACTLY,
    block: suspend MarkersAssertionDsl.() -> Unit
) {
    val dslConfig = MarkersAssertionDsl().coApply(block)
    val expectedMarkers = dslConfig.markers
    TestUtils.getMarkers(getDb(), getActiveGame()).also { actualMarkers ->
        if (expectation == ElementExpectation.EXACTLY) {
            actualMarkers shouldHaveSize expectedMarkers.size
        }
        expectedMarkers.forEach { expectedMarker ->
            actualMarkers.find { actualMarker ->
                actualMarker.first.position.q == expectedMarker.q
                        && actualMarker.first.position.r == expectedMarker.r
                        && actualMarker.second.countryId == expectedMarker.countryId
            }.shouldNotBeNull()
        }
    }
}

suspend fun GameTestContext.expectMarker(block: suspend MarkerAssertionDsl.() -> Unit) {
    val expectedMarker = MarkerAssertionDsl().coApply(block)
    TestUtils.getMarkers(getDb(), getActiveGame()).also { actualMarkers ->
        actualMarkers.find { actualMarker ->
            actualMarker.first.position.q == expectedMarker.q
                    && actualMarker.first.position.r == expectedMarker.r
                    && actualMarker.second.countryId == expectedMarker.countryId
        }.shouldNotBeNull()
    }
}

class MarkersAssertionDsl {
    val markers = mutableListOf<MarkerAssertionDsl>()
    suspend fun marker(block: suspend MarkerAssertionDsl.() -> Unit) {
        markers.add(MarkerAssertionDsl().coApply(block))
    }
}

class MarkerAssertionDsl {
    var q: Int? = null
    var r: Int? = null
    var countryId: String? = null
}