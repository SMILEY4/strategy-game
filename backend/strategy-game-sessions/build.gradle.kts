plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.versions)
    alias(libs.plugins.detekt)
}

dependencies {

    implementation(project(":strategy-game-engine"))
    implementation(project(":strategy-game-playerpov"))
    implementation(project(":strategy-game-common"))
    implementation(project(":strategy-game-common-data"))
    implementation(project(":strategy-game-common-arangodb"))
    implementation(project(":strategy-game-worldgen"))

    implementation(libs.ktor.server.core.jvm)
    implementation(libs.ktor.server.websockets)
    implementation(libs.ktor.server.auth)
    implementation(libs.ktor.swagger.ui)

    implementation(libs.jackson.kotlin)

    implementation(libs.kotlin.logging.jvm)

    implementation(libs.koin.core)
    implementation(libs.koin.ktor3)

    implementation(libs.arrow.core)
    implementation(libs.arrow.fx.coroutines)
    implementation(libs.arrow.fx.stm)

    testImplementation(libs.kotest.runner.junit5)
    testImplementation(libs.kotest.assertions.core)
    testImplementation(libs.kotest.property)
    testImplementation(libs.kotest.extensions.testcontainers)
    testImplementation(libs.mockk)
}