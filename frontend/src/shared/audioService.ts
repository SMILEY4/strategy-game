import {Howl} from "howler";
import {UIAudio} from "../ui/components/audio";

export class AudioType {

    public static readonly CLICK_PRIMARY = new AudioType("click.primary");
    public static readonly CLICK_CLOSE = new AudioType("click.close");
    public static readonly WRITING_ON_PAPER = new AudioType("writing-on-paper");

    readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    public play(audioService: AudioService) {
        audioService.play(this.id)
    }

}

export class AudioService implements UIAudio.AudioProvider {

    private readonly sounds = new Map<string, Howl>();

    constructor() {
        this.sounds.set(
            AudioType.CLICK_PRIMARY.id,
            new Howl({
                src: ["/sfx/menu-button-click-10.mp3"],
            }),
        );
        this.sounds.set(
            AudioType.CLICK_CLOSE.id,
            new Howl({
                src: ["/sfx/menu-button-click-11.mp3"],
            }),
        );
        this.sounds.set(
            AudioType.WRITING_ON_PAPER.id,
            new Howl({
                src: ["/sfx/pencil-writing-on-paper-3-strokes-take-a.mp3"],
            }),
        );
        UIAudio.audioProvider = this;
    }

    public play(soundId: string): void {
        this.sounds.get(soundId)?.play();
    }

}