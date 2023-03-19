export interface Batch {
    currentIndexOffset: number,
    indices: number[],
    vertices: number[]
}


export class VertexBatchCollector {

    private readonly maxIndicesCount: number;
    private batches: Batch[] = [];


    constructor(maxIndicesCount?: number) {
        this.maxIndicesCount = maxIndicesCount ? maxIndicesCount : 60000;
    }


    public getBatches(): Batch[] {
        return this.batches;
    }


    public clear() {
        this.batches = [];
    }


    public add(vertices: (number[])[], indices?: number[]) {
        if (this.batches.length == 0 || this.willOverflowBatch(this.getLatestBatch(), vertices.length, indices, this.maxIndicesCount)) {
            this.startNewBatch();
        }
        this.pushIndices(indices, vertices.length);
        this.pushVertices(vertices);
    }


    private getLatestBatch(): Batch {
        return this.batches[this.batches.length - 1];
    }


    private willOverflowBatch(batch: Batch, vertexCount: number, indices: number[] | undefined, maxIndicesAmount: number) {
        const nextSize = batch.indices.length + (indices ? indices.length : vertexCount);
        return nextSize > maxIndicesAmount;
    }


    private startNewBatch() {
        this.batches.push({
            currentIndexOffset: 0,
            indices: [],
            vertices: []
        });
    }


    private pushIndices(indices: number[] | undefined | null, amountVertices: number) {
        const batch = this.getLatestBatch();
        const indexData: number[] = this.getIndices(indices, amountVertices).map(index => index + batch.currentIndexOffset);
        batch.indices.push(...indexData);
        batch.currentIndexOffset = Math.max(...indexData) + 1;
    }


    private getIndices(indices: number[] | undefined | null, amountVertices: number): number[] {
        return indices
            ? indices
            : [...Array(amountVertices).keys()];
    }


    private pushVertices(vertices: (number[])[]) {
        const batch = this.getLatestBatch();
        vertices.forEach(v => batch.vertices.push(...v));
    }

}