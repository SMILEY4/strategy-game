package io.github.smiley4.strategygame.application.plugins

import io.github.smiley4.strategygame.identity.auth.domain.OneTimeToken
import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.contextual

/**
 * Configure JSON serialization.
 */
fun Application.setupContentNegotiation(): Json {
    val json = Json {
        serializersModule = SerializersModule {
            contextual(UserIdSerializer)
            contextual(MatchIdSerializer)
            contextual(GameIdSerializer)
            contextual(SessionTokenSerializer)
            contextual(OneTimeTokenSerializer)
            contextual(UnsafePasswordSerializer)
            contextual(UsernameSerializer)
        }
        prettyPrint = true
        isLenient = true
    }
    install(ContentNegotiation) {
        json(json)
    }
    return json
}

object UserIdSerializer : KSerializer<UserId> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("UserId", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: UserId) = encoder.encodeString(value.id.toString())
    override fun deserialize(decoder: Decoder) = UserId(decoder.decodeString())
}

object MatchIdSerializer : KSerializer<MatchId> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("MatchId", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: MatchId) = encoder.encodeString(value.value.toString())
    override fun deserialize(decoder: Decoder) = MatchId(decoder.decodeString())
}

object GameIdSerializer : KSerializer<GameId> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("GameId", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: GameId) = encoder.encodeString(value.id.toString())
    override fun deserialize(decoder: Decoder) = GameId(decoder.decodeString())
}

object SessionTokenSerializer : KSerializer<SessionToken> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("SessionToken", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: SessionToken) = encoder.encodeString(value.value.toString())
    override fun deserialize(decoder: Decoder) = SessionToken(decoder.decodeString())
}

object OneTimeTokenSerializer : KSerializer<OneTimeToken> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("OneTimeToken", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: OneTimeToken) = encoder.encodeString(value.value.toString())
    override fun deserialize(decoder: Decoder) = OneTimeToken(decoder.decodeString())
}

object UnsafePasswordSerializer : KSerializer<UnsafePassword> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("UnsafePassword", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: UnsafePassword) = encoder.encodeString(value.value)
    override fun deserialize(decoder: Decoder) = UnsafePassword(decoder.decodeString())
}

object UsernameSerializer : KSerializer<Username> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("Username", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: Username) = encoder.encodeString(value.value)
    override fun deserialize(decoder: Decoder) = Username(decoder.decodeString())
}
