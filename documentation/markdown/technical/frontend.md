---
title: Frontend Documentation
---





# Running the Application

1. Install the required npm-packages

   ```
   npm install
   ```

2. run the application

   ```
   npm run dev
   ```

   

# Architecture

The backend-architecture is loosly based on the "[Hexagonal Architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))".

## File/Directory Structure

- *main.tsx* - the entry point of the application. Contains no code besides starting the (React-) app

- */core* - contains the core frontend logic of the game, completely independent from the ui 
  - */ports*
    - */required* - interfaces for all services required by the core-logic
    - */provided* - interfaces for all services provided and implemented by the core-logic
  - */service* - contains the core services and implementations of the "provided" ports
  - *game.ts* - configures the core-logic and exposes the provided services to the outside (e.g. the ui) 
- */api* - contains clients and message-handlers for communicating with the backend
- */state* - contains the global state and its models 
- */ui* - contains the react-ui without specific game-logic

## Flow of Data and Information

- to render the ui, the react-components read the global state (never writes)
- events triggered by the backend (via the client) or by the player (via the react-ui) run functions provided by the core ("provided-ports")
- the canvas (ui-component) controls the current lifecycle (init, update, dispose) of the game-loop, by calling the provided core-services  
- the core-services can communicate with the backend via the clients
- the core-services can communicate with the ui via the global state (read,write)
- the core does not contain any separate state, besides data specific to the core that does not need to be synced with the global state (e.g. textures, shaders, ...)



# Used Technologies

**Vite**

Frontend bundler + pre-configured dev server. [Link to Documentation](https://vitejs.dev/guide/)

**ReactJS**

SSR Frontend UI-Library. [Link to Documentation](https://reactjs.org/docs/getting-started.html)

**Zustand**

React global state-management. [Link to Documentation](https://github.com/pmndrs/zustand)

**WebGL**

High-performance rendering API based on OpenGL. [Link to Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
