package io.github.smiley4.strategygame.backend.common.ktorplus

import io.github.smiley4.ktorplus.core.PropertyAnalyzer
import io.github.smiley4.ktorplus.request.RequestPropertyHandler
import io.github.smiley4.ktorplus.typedescriptor.TypeDescriptorEntry
import io.ktor.server.auth.authentication
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.routing.RoutingCall
import kotlin.reflect.KCallable
import kotlin.reflect.KClass
import kotlin.reflect.typeOf

/**
 * Describes the id of a logged-in user provided in the jwt.
 */
@Target(
    AnnotationTarget.PROPERTY,
    AnnotationTarget.FIELD,
)
@Retention(AnnotationRetention.RUNTIME)
annotation class UserId


/**
 * [TypeDescriptorEntry] for [UserId]
 */
class UserIdDescriptor(
    val property: KCallable<*>,
) : TypeDescriptorEntry


/**
 * Analyzes a [UserId] property and creates [TypeDescriptorEntry].
 */
class UserIdAnalyzer : PropertyAnalyzer<UserId, TypeDescriptorEntry> {

    override fun getAnnotationType() = typeOf<UserId>()

    override fun process(type: KClass<*>, property: KCallable<*>, annotation: UserId) = UserIdDescriptor(
        property = property,
    )
}


/**
 * Handles [UserId] for incoming requests.
 */
class UserIdRequestPropertyHandler : RequestPropertyHandler<UserIdDescriptor> {

    override fun appliesTo(descriptor: TypeDescriptorEntry) = descriptor is UserIdDescriptor

    override suspend fun handle(descriptor: UserIdDescriptor, call: RoutingCall): Map<String, Any?> {
        val principal = call.authentication.principal<JWTPrincipal>()
            ?: throw IllegalArgumentException("Missing jwt principal for user id.")
        return mapOf(
            descriptor.property.name to (principal.payload.subject ?: throw Exception("No subject found in JWT-Principal"))
        )
    }

}
