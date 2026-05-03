package io.github.smiley4.strategygame.shared.infrastructure

@Target(
    AnnotationTarget.PROPERTY,
    AnnotationTarget.FIELD,
)
@Retention(AnnotationRetention.RUNTIME)
annotation class AuthenticatedUserId
