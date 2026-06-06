export interface BatchSupportingObject {
    /**
     * Start a new "batch", during which no subscribers will be notified. All changes are collected and passed on to subscribers at the end.
     */
    startBatch(): void;

    /**
     * End a "batch" and notify subscribers of all collected changes
     */
    endBatch(): void;

    /**
     * Run the given action inside a batch context. Same as calling start and end batch manually.
     * All changes are collected and subscribers are notified after the action.
     */
    batch(action: () => void): void
}