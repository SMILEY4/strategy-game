plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.versions)
    alias(libs.plugins.detekt)
}

dependencies {

    implementation(project(":strategy-game-common"))
    implementation(project(":strategy-game-common-data"))
    implementation(project(":strategy-game-worldgen"))
    implementation(project(":strategy-game-pathfinding"))

    implementation(libs.kotlin.logging.jvm)

    implementation(libs.koin.core)

    implementation(libs.dotlin)

    testImplementation(libs.kotest.runner.junit5)
    testImplementation(libs.kotest.assertions.core)
    testImplementation(libs.kotest.property)
    testImplementation(libs.mockk)
}