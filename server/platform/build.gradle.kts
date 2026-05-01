plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.detekt)
    alias(libs.plugins.versions)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.kotest)
    alias(libs.plugins.serialization)
}

dependencies {
    implementation(project(":identity"))
    implementation(project(":shared"))

    implementation(libs.bundles.logging)

    implementation(libs.ktor.plus)
    implementation(libs.ktor.openapitools.openapi)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.auth)
    implementation(libs.ktor.server.serialization.kotlinxjson)

    implementation(libs.koin.core)

    testImplementation(libs.kotest.runner.junit5)
    testImplementation(libs.kotest.assertions.core)
    testImplementation(libs.mockk)
}
