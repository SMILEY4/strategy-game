export enum GameState {
    OUT_OF_GAME = "out-of-game", // not in a game (e.g. in login-screen)
    LOADING = "loading", // joined a game and is now loading
    PLAYING = "playing", // in-game and playing - player can perform actions
    SUBMITTED = "submitted" // in-game and playing, but submitted current turn already
}
/*
# http://viz-js.com/
digraph G {
    OUT_OF_GAME -> LOADING;
    LOADING -> PLAYING;
    PLAYING -> SUBMITTED;
    SUBMITTED -> PLAYING;
    PLAYING -> OUT_OF_GAME;
    SUBMITTED -> OUT_OF_GAME;
}
*/