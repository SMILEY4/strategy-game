plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.versions)
    alias(libs.plugins.detekt)
}

dependencies {

    implementation(libs.ktor.server.core.jvm)

    implementation(libs.ktor.swagger.ui)

    testImplementation(libs.kotest.runner.junit5)
    testImplementation(libs.kotest.assertions.core)
}