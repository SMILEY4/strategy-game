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


**Run automated tests**

```
npm run test
```



# Architecture

![Architecture Overview](https://g.gravizo.com/g?digraph G{subgraph cluster_0{label="CORE";actions;hooks;rendering;}subgraph cluster_1{label="EXTERNAL"clients;state;stateAccess;}subgraph cluster_3{label="UI"uiComponents;}rendering->stateAccess;actions->stateAccess;actions->clients;hooks->stateAccess[dir=both];hooks->actions;clients->actions;stateAccess->state;uiComponents->hooks[dir=both];uiComponents->actions;})


## File/Directory Structure

- *main.tsx* - the entry point of the application. Starts the (React-) app and configures other components
- */models* - contains all models
  
- */core* - contains the core frontend-logic of the game, completely independent from the ui
  - structured into individual "actions", one action represents one function/feature/entity
  - provides react-hooks for ui, hooks either work directly on state or call actions

- */external* - external services, e.g. global state, clients, ...
- */ui* - contains the react-ui without specific game-logic

## Flow of Data and Information

- to render the ui, the react-components access the global application-state via hooks from the core-module
- events triggered by the backend (websocket-messages) or by the player (react-ui) run actions provided by the core
- the canvas (ui-component) controls the current lifecycle (init, update, dispose) of the game-loop by calling the provided actions  
- the core-services can communicate with the backend via the provided clients
- the core-services can communicate with the ui via the global state (read/write via provided "access"-classes)
- the core does not contain any separate state, besides data specific to the core that does not need to be synced with the global state (e.g. textures, shaders, ...)



# Used Technologies

**Vite**

Frontend bundler + pre-configured dev server. [Link to Documentation](https://vitejs.dev/guide/)

**ReactJS**

SSR Frontend UI-Library. [Link to Documentation](https://reactjs.org/docs/getting-started.html)

**React Router v6**

Client side routing. [Link to Documentation](https://reactrouter.com/docs/en/v6/api)

**Zustand**

React global state-management. [Link to Documentation](https://github.com/pmndrs/zustand)

**WebGL**

High-performance rendering API based on OpenGL. [Link to Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)

**Jest**

JavaScript testing framework. [Link to Documentation](https://jestjs.io/docs/getting-started).

Used together with **ts-jest** for TypeScript support. [Link to Documentation](https://kulshekhar.github.io/ts-jest/docs/getting-started/installation)
