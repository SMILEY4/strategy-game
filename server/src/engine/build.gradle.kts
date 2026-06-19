plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.detekt)
    alias(libs.plugins.versions)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.kotest)
}

dependencies {

    implementation(project(":src:shared"))

    implementation(libs.bundles.logging)

    implementation(libs.ktor.plus)
    implementation(libs.ktor.openapitools.openapi)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.auth)
    implementation(libs.ktor.server.serialization.kotlinxjson)

    implementation(libs.koin.core)
    implementation(libs.koin.ktor)

    implementation(libs.koson)

    testImplementation(libs.kotest.runner.junit5)
    testImplementation(libs.kotest.assertions.core)
    testImplementation(libs.mockk)
}