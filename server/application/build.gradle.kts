plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.detekt)
    alias(libs.plugins.versions)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.kotest)
    alias(libs.plugins.serialization)
}

dependencies {

    implementation(project(":shared"))
    implementation(project(":identity"))
    implementation(project(":platform"))
    implementation(project(":engine"))

    implementation(libs.kotlin.logging.jvm)
    implementation(libs.kotlinx.serialization.json)

    implementation(libs.koin.core)
    implementation(libs.koin.ktor)

    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
    implementation(libs.ktor.server.contentnegotiation)
    implementation(libs.ktor.server.serialization.kotlinxjson)
    implementation(libs.ktor.server.auth)
    implementation(libs.ktor.server.sessions)
    implementation(libs.ktor.plus)
    implementation(libs.ktor.openapitools.openapi)
    implementation(libs.ktor.openapitools.swagger)
    implementation(libs.schemakenerator.core)
    implementation(libs.schemakenerator.serialization)
    implementation(libs.schemakenerator.swagger)

}