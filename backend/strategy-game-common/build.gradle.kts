import org.gradle.kotlin.dsl.implementation

plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.versions)
    alias(libs.plugins.detekt)
}

dependencies {

    implementation(project(":strategy-game-common-data"))

    implementation(libs.jackson.kotlin)
    implementation(libs.typesafe.config)
    implementation(libs.koson)

    implementation(libs.micrometer.registry.prometheus)
    implementation(libs.hdr.histogram)

    implementation(libs.kotlin.logging.jvm)
    implementation(libs.logback.classic)
    implementation(libs.kotlinx.coroutines.slf4j)
}