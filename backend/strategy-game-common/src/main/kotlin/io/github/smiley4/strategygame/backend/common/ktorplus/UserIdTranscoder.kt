package io.github.smiley4.strategygame.backend.common.ktorplus

import io.github.smiley4.ktorplus.core.ParameterDecoder
import io.github.smiley4.ktorplus.core.ParameterEncoder
import io.github.smiley4.strategygame.backend.commondata.User
import kotlinx.serialization.json.Json
import kotlin.reflect.KType
import kotlin.reflect.full.starProjectedType


class UserIdTranscoder : ParameterEncoder<User.Id>, ParameterDecoder<User.Id> {
    override fun canHandle(type: KType) = type == User.Id::class.starProjectedType
    override fun encode(value: User.Id?): String? = value?.value
    override fun decode(value: String?, type: KType, json: Json) = value?.let { User.Id(it) }
}
