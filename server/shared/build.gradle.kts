plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.detekt)
    alias(libs.plugins.versions)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.kotest)
}

dependencies {
    implementation(libs.kotlinx.coroutines)
}
