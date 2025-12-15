import {GameAudio, AudioId} from "../../../app/audio/gameAudio";

export namespace UIAudio {

    export function usePlayAudio(soundId?: AudioId) {
        return () => {
            soundId && GameAudio[soundId].play();
        };
    }

}

