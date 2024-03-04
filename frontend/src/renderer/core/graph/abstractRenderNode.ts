export abstract class AbstractRenderNode {
    public readonly id: string;

    protected constructor(id: string) {
        this.id = id;
    }
}