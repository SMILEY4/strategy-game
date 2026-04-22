plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.detekt)
    alias(libs.plugins.versions)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.kotest)
}

dependencies {

    implementation(libs.bundles.logging)

    testImplementation(libs.kotest.runner.junit5)
    testImplementation(libs.kotest.assertions.core)
}