package io.github.smiley4.strategygame.backend.app.setup

import io.github.smiley4.ktorplus.KtorPlusConfig
import io.github.smiley4.strategygame.backend.common.ktorplus.GameIdTranscoder
import io.github.smiley4.strategygame.backend.common.ktorplus.UserIdAnalyzer
import io.github.smiley4.strategygame.backend.common.ktorplus.UserIdRequestPropertyHandler
import io.github.smiley4.strategygame.backend.common.ktorplus.UserIdTranscoder
import kotlinx.serialization.json.Json

fun setupKtorPlus(json: Json) {
    KtorPlusConfig.json = json

    // user id (from jwt)
    KtorPlusConfig.propertyAnalyzers.add(0, UserIdAnalyzer())
    KtorPlusConfig.requestHandlers.add(0, UserIdRequestPropertyHandler())

    // user id (de-/encoding)
    KtorPlusConfig.encoders.add(0, UserIdTranscoder())
    KtorPlusConfig.decoders.add(0, UserIdTranscoder())

    // game id (de-/encoding)
    KtorPlusConfig.encoders.add(0, GameIdTranscoder())
    KtorPlusConfig.decoders.add(0, GameIdTranscoder())

}