
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.versions)
    alias(libs.plugins.detekt)
}

dependencies {

    implementation(project(":strategy-game-common"))
    implementation(project(":strategy-game-common-data"))

    implementation(libs.ktor.server.core.jvm)
    implementation(libs.ktor.server.auth)
    implementation(libs.ktor.server.authjwt)
    implementation(libs.ktor.swagger.ui)

    implementation(libs.aws.sdk)
    implementation(libs.aws.sdk.core)
    implementation(libs.aws.sdk.cognitoidp)

    implementation(libs.kotlin.logging.jvm)

    implementation(libs.koin.core)
    implementation(libs.koin.ktor3)

    testImplementation(libs.kotest.runner.junit5)
    testImplementation(libs.kotest.assertions.core)
    testImplementation(libs.kotest.property)
    testImplementation(libs.kotest.extensions.testcontainers)
    testImplementation(libs.mockk)
}