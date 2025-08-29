export namespace UIAudio {

    export interface AudioProvider {
        play: (soundId: string) => void;
    }

    export const DUMMY_AUDIO_PROVIDER: AudioProvider = {
        play: () => undefined,
    };

    export let audioProvider: AudioProvider = DUMMY_AUDIO_PROVIDER;

    export function usePlayAudio(soundId?: string) {
        return () => {
            soundId && audioProvider.play(soundId);
        };
    }

}

