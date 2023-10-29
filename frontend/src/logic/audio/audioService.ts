import {Howl} from "howler";
import {UIAudio} from "../../ui/components/audio";

export class AudioType {

    public static readonly CLICK_A = new AudioType("click.primary");
    public static readonly CLICK_B = new AudioType("click.close");

    readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

}

export class AudioService implements UIAudio.AudioProvider {

    private readonly sounds = new Map<string, Howl>();

    constructor() {
        this.sounds.set(
            AudioType.CLICK_A.id,
            new Howl({
                src: ["/public/sfx/menu-button-click-10.mp3"],
            }),
        );
        this.sounds.set(
            AudioType.CLICK_B.id,
            new Howl({
                src: ["/public/sfx/menu-button-click-11.mp3"],
            }),
        );
        UIAudio.audioProvider = this;
    }

    public play(soundId: string): void {
        this.sounds.get(soundId)?.play();
    }

}