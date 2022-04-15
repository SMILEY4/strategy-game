# Strategy-Game Backend





## Running the Application

**Intellij**

To run the application in the Intellij-IDE, click the "Run Button" or the "Run Button" next to the "main"-Funktion in "de.ruegnerlukas.strategygame.backend.Application.kt"

**CLI with auto-reloading**

Auto-reload detects changes in output files and reloads them at runtime. 

1. First execute the following command. After finishing, it waits for changes and compiles the new files. 

   ```
   ./gradlew -t build
   ```

2. Open another terminal tab and run the following command. It starts the server and waits for changes.

   ```
   ./gradlew -t run -Dev=true
   ```

   The "-Dev=True"-Flag start the application in Development-Mode and enables auto-reload

3. The application is now available on `http://localhost:8080` 