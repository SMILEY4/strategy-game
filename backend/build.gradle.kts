plugins {
    kotlin("jvm") version "2.0.21"
    kotlin("plugin.serialization") version "2.0.21" apply false
    id("com.github.johnrengelman.shadow") version "8.1.1" apply false
    id("com.github.ben-manes.versions") version "0.51.0"
}


extensions.findByName("buildScan")?.withGroovyBuilder {
    setProperty("termsOfServiceUrl", "https://gradle.com/terms-of-service")
    setProperty("termsOfServiceAgree", "yes")
}