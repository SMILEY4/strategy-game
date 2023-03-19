---
title: Changelog
---

# Version 0.2.0 - 19.08.2022

<img src="D:\LukasRuegner\Programmieren\Workspace\strategy-game\documentation\markdown\changelog\0_2_2-game.png" alt="0_2_2-game" style="max-width: 70%;" />

- Basic Ingame UI
  - dialog/window System
  - contains first gameplay functionalities and some debug features 
- World Generation
  - basic world generation with two tile types (land, water)
- Rendering
  - render objects with textures
  - render cities with labels
  - render two types of borders (country-border, province-border)
- Cities and Provinces
  - Create new cities with provinces if some basic requirements are fulfilled
  - Cities generate fixed amount of income each turn
  - Cities define country border based on influence in tile
- Persistence
  - Persists all game data in database
- Add Swagger-UI for Backend API
- Add React-Storybook for UI-Component development
- other changes and additions



# Version 0.1.0 - 17.05.2022

- User Authentication/Management
  - Sign-Up
  - Log-In
  - API-Authentication

<img src="0_1_0-login.png" alt="0_1_0-login" style="max-width: 70%;" />

- Basic world handling
  - Create world
  - Join world by id

<img src="0_1_0-home.png" alt="0_1_0-home" style="max-width: 70%;" />

- Basic World-Rendering
  - tilemap rendering
  - camera-controls

<img src="0_1_0-game.png" alt="0_1_0-game" style="max-width: 70%;" />

- Basic turn-handling

  - submit turn
  - ends turn when all players submitted their turn

- create and automate AWS Infrastructure

- other changes and additions

  