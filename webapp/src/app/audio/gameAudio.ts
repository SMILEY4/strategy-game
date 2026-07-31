import {Howl} from "howler";

const sfxMenuButtonClick10 = new Howl({
    src: ["/sfx/menu-button-click-10.mp3"],
});

const sfxMenuButtonClick11 = new Howl({
    src: ["/sfx/menu-button-click-11.mp3"],
});

const sfxPencilWritingOnPaper = new Howl({
    src: ["/sfx/pencil-writing-on-paper-3-strokes-take-a.mp3"],
});

export type AudioId = "CLICK_PRIMARY" | "CLICK_CLOSE" | "WRITING_ON_PAPER"

export const gameAudio: PlayableAudio<AudioId> = {
    CLICK_PRIMARY: {
        play: () => sfxMenuButtonClick10.play(),
    },
    CLICK_CLOSE: {
        play: () => sfxMenuButtonClick11.play(),
    },
    WRITING_ON_PAPER: {
        play: () => sfxPencilWritingOnPaper.play(),
    },
};

type PlayableAudio<TAudioId extends string> = Record<TAudioId, { play: () => void }>;