package io.github.smiley4.strategygame.application.plugins

import io.github.smiley4.ktorplus.KtorPlusConfig
import io.github.smiley4.ktorplus.core.ParameterDecoder
import io.github.smiley4.ktorplus.core.ParameterEncoder
import io.github.smiley4.ktorplus.core.PropertyAnalyzer
import io.github.smiley4.ktorplus.request.RequestPropertyHandler
import io.github.smiley4.ktorplus.typedescriptor.TypeDescriptorEntry
import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.shared.values.MatchId
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.infrastructure.UserPrincipal
import io.ktor.server.auth.authentication
import io.ktor.server.routing.RoutingCall
import kotlinx.serialization.json.Json
import kotlin.reflect.KCallable
import kotlin.reflect.KClass
import kotlin.reflect.KType
import kotlin.reflect.typeOf

fun setupKtorPlus(json: Json) {

    KtorPlusConfig.json = json

    KtorPlusConfig.encoders.add(0, UserIdTranscoder())
    KtorPlusConfig.decoders.add(0, UserIdTranscoder())

    KtorPlusConfig.encoders.add(0, MatchIdTranscoder())
    KtorPlusConfig.decoders.add(0, MatchIdTranscoder())

    KtorPlusConfig.encoders.add(0, GameIdTranscoder())
    KtorPlusConfig.decoders.add(0, GameIdTranscoder())

    KtorPlusConfig.encoders.add(0, SessionTokenTranscoder())
    KtorPlusConfig.decoders.add(0, SessionTokenTranscoder())

    KtorPlusConfig.propertyAnalyzers.add(0, AuthenticatedUserIdAnalyzer())
    KtorPlusConfig.requestHandlers.add(0, AuthenticatedUserIdRequestPropertyHandler())
}

private class UserIdTranscoder : ParameterEncoder<UserId>, ParameterDecoder<UserId> {
    override fun canHandle(type: KType) = type == UserId::class
    override fun encode(value: UserId?): String? = value?.id?.toString()
    override fun decode(value: String?, type: KType, json: Json) = value?.let { UserId(it) }
}

private class MatchIdTranscoder : ParameterEncoder<MatchId>, ParameterDecoder<MatchId> {
    override fun canHandle(type: KType) = type == MatchId::class
    override fun encode(value: MatchId?): String? = value?.value?.toString()
    override fun decode(value: String?, type: KType, json: Json) = value?.let { MatchId(it) }
}

private class GameIdTranscoder : ParameterEncoder<GameId>, ParameterDecoder<GameId> {
    override fun canHandle(type: KType) = type == GameId::class
    override fun encode(value: GameId?): String? = value?.id?.toString()
    override fun decode(value: String?, type: KType, json: Json) = value?.let { GameId(it) }
}

private class SessionTokenTranscoder : ParameterEncoder<SessionToken>, ParameterDecoder<SessionToken> {
    override fun canHandle(type: KType) = type == SessionToken::class
    override fun encode(value: SessionToken?): String? = value?.value?.toString()
    override fun decode(value: String?, type: KType, json: Json) = value?.let { SessionToken(it) }
}

private class AuthenticatedUserIdDescriptor(
    val property: KCallable<*>,
) : TypeDescriptorEntry

private class AuthenticatedUserIdAnalyzer : PropertyAnalyzer<AuthenticatedUserId, TypeDescriptorEntry> {

    override fun getAnnotationType() = typeOf<AuthenticatedUserId>()

    override fun process(type: KClass<*>, property: KCallable<*>, annotation: AuthenticatedUserId) = AuthenticatedUserIdDescriptor(
        property = property
    )

}

private class AuthenticatedUserIdRequestPropertyHandler : RequestPropertyHandler<AuthenticatedUserIdDescriptor> {

    override fun appliesTo(descriptor: TypeDescriptorEntry) = descriptor is AuthenticatedUserIdDescriptor

    override suspend fun handle(descriptor: AuthenticatedUserIdDescriptor, call: RoutingCall): Map<String, Any?> {
        val principal = call.authentication.principal<UserPrincipal>()
            ?: throw IllegalArgumentException("Missing principal for user id.")
        return mapOf(
            descriptor.property.name to principal.userId,
        )
    }

}
