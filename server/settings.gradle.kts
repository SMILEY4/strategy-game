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

include("src")
include("src:identity")
include("src:application")
include("src:platform")
include("src:engine")
include("src:shared")
