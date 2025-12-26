package io.github.smiley4.strategygame.backend.app.setup

import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.SerializersModule

fun setupJson(): Json {
    return Json {
        serializersModule = SerializersModule {
        }
        prettyPrint = true
        isLenient = true
    }
}