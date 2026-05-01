rootProject.name = "server"

pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.8.0"
}

include("identity")
include("application")
include("platform")
include("engine")
include("shared")
