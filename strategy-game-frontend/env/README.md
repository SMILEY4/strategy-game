# Environment Variables

https://vitejs.dev/guide/env-and-mode.html



#### Files

- **.env, .env.local**

  for base variables that are the same for development and production

- **.env.development, .env.development.local**

  for base variables that are only available in development-mode

- **.env.production, .env.production.local**

  for base variables that are only available in production-mode

files ending with "*.local" are not checked into version control



#### Modes

- **production** - when running `build`
- **development** - when running `dev`

The default mode can be changed (to any value) with the "--mode" flag. Example: `vite build --mode staging` 



### Usage

- Variables are available via the `import.meta.env`-Object. Example:

  ```
  in .env-file:
  PUB_MY_VAR=Hello World
  
  in .js/.ts-file:
  console.log( import.meta.env.PUB_MY_VAR ) => prints "Hello World"
  ```

- Only variables starting with "PUB_" are available in the application (can be changed in "vite.config.ts" -> "envPrefix") to avoid sharing secret data accidentally. 

- Variables/Values in ".env.production" or ".env.development" have a higher priority than those in ".env"

- To support IntelliSense for custom env-variables, add them to the typescript-definition file "src/env.d.ts"


#### Required Secret-Environment variables

*nothing here yet*