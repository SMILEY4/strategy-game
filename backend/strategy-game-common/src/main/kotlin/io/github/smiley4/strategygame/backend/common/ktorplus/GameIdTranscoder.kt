package io.github.smiley4.strategygame.backend.common.ktorplus

import io.github.smiley4.ktorplus.core.ParameterDecoder
import io.github.smiley4.ktorplus.core.ParameterEncoder
import io.github.smiley4.strategygame.backend.commondata.Game
import kotlinx.serialization.json.Json
import kotlin.reflect.KType
import kotlin.reflect.full.starProjectedType


class GameIdTranscoder : ParameterEncoder<Game.Id>, ParameterDecoder<Game.Id> {
    override fun canHandle(type: KType) = type == Game.Id::class.starProjectedType
    override fun encode(value: Game.Id?): String? = value?.value
    override fun decode(value: String?, type: KType, json: Json) = value?.let { Game.Id(it) }
}
