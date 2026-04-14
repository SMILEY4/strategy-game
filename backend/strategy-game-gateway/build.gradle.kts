plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.versions)
    alias(libs.plugins.detekt)
}

dependencies {
    implementation(project(":strategy-game-users"))
    implementation(project(":strategy-game-sessions"))
    implementation(project(":strategy-game-common"))
    implementation(project(":strategy-game-common-data"))

    implementation(libs.ktor.server.core.jvm)
    implementation(libs.ktor.server.netty.jvm)
    implementation(libs.ktor.server.metrics)
    implementation(libs.ktor.server.metrics.micrometer)
    implementation(libs.ktor.server.websockets)
    implementation(libs.ktor.server.calllogging)
    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.contentnegotiation)
    implementation(libs.ktor.server.serialization.jackson)
    implementation(libs.ktor.server.auth)
    implementation(libs.ktor.server.authjwt)
    implementation(libs.ktor.server.statuspages)
    implementation(libs.ktor.server.htmlbuilder)
    implementation(libs.ktor.swagger.ui)
    testImplementation(libs.ktor.server.test.host)
    testImplementation(libs.ktor.client.contentnegotiation)

    implementation(libs.koson)

    implementation(libs.micrometer.registry.prometheus)
    implementation(libs.hdr.histogram)

    implementation(libs.kotlin.logging.jvm)

    implementation(libs.koin.core)
    implementation(libs.koin.ktor3)
}
