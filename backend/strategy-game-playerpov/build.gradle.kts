plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.versions)
    alias(libs.plugins.detekt)
}

dependencies {

    implementation(project(":strategy-game-engine"))
    implementation(project(":strategy-game-common"))
    implementation(project(":strategy-game-common-data"))

    implementation(libs.kotlin.logging.jvm)
    implementation(libs.koin.core)
}