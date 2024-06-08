plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.5.0"
}

rootProject.name = "strategy-game-backend"

include("strategy-game-users")
include("strategy-game-common")
include("strategy-game-worldgen")
include("strategy-game-pathfinding")
include("strategy-game-ecosim")
include("strategy-game-worlds")
include("strategy-game-engine")
include("strategy-game-app")
