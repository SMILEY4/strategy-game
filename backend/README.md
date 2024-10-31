# Strategy-Game Backend





## Running the Application

**Reprequisites**

Running Arangodb

Option 1: Manually
```
docker run -d -p 8529:8529 -e ARANGO_NO_AUTH=1 arangodb/arangodb:latest or via `arangodb.ps1`
```

Option 2: Via PS-Script
```
arangodb.ps1
```

Option 3: Docker-Compose
```
cd infrastructure/backend/db
docker compose up
```

**Intellij**

To run the application in the Intellij-IDE, click the "Run Button" or the "Run Button" next to the "main"-Funktion in "de.ruegnerlukas.strategygame.backend.Application.kt"

**CLI**

   ```
   ./gradlew run
   ```

**CLI with auto-reloading**

Auto-reload detects changes in output files and reloads them at runtime. 

1. First execute the following command. After finishing, it waits for changes and compiles the new files. 

   ```
   ./gradlew -t build -x test -x shadowJar -i
   ```

2. Open another terminal tab and run the following command. It starts the server and waits for changes.

   ```
   ./gradlew run -Dev=true
   ```

   The "-Dev=true"-flag start the server in Development-Mode and enables auto-reload

3. The application is now available on `http://localhost:8080` 


## Building the Application

Creates a runnable .jar

```
./gradlew shadowJar
```

The created jar can be found in `./build/libs/backend-x.y-all.jar`


## Architecture Guidelines

Most sub-modules are structured according to hexagonal architecture and directory structure should roughly adhere to the following structure:
```
- root
   - ports
      - provided
      - required
   - application
      - core
      - infrastructure
      - remoteclient
      - ...
   - domain
```

- `ports.provided` contains interfaces and models for functionality that is provided by this module
- `ports.required` contains interfaces and models for functionality that is required by this module
- `application` contains the implementations
- `application.core` contains the implementations of the core functionality of this module, i.e. of the interfaces in `ports.provided`
- `application.infrastructure`, `application.remoteclient`, ... (examples) contains implementations or adapters of functionality used by the core of this module, i.e. of the interfaces in `ports.required`