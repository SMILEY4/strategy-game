interface Tracer {
    span: <T>(options: SpanOptions, fn: () => T) => T,
    spanAsync: <T>(options: SpanOptions, fn: () => Promise<T>) => Promise<T>
    downloadJSON: (filename?: string) => void
}

interface TraceArgs {
    [key: string]: string | number | boolean | undefined | null | object;
}

interface SpanOptions {
    name: string;
    cat?: string;
    args?: TraceArgs;
}

// Google Chrome Trace Event Format specification
interface ChromeTraceEvent {
    name: string;
    cat: string;
    ph: "B" | "E" | "i" | "C"; // Begin, End, Instant, Counter
    ts: number;               // Microseconds
    pid: number;              // Process ID
    tid: number;              // Thread ID
    args?: TraceArgs;
    s?: "g" | "p" | "t";      // Instant event scope (global, process, thread)
}

class NoOpTracer implements Tracer {

    span<T>(_options: SpanOptions, fn: () => T): T {
        return fn();
    }

    spanAsync<T>(_options: SpanOptions, fn: () => Promise<T>): Promise<T> {
        return fn();
    }

    downloadJSON(): void {
        // do nothing
    }

}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class BrowserTracer implements Tracer {
    private events: ChromeTraceEvent[] = [];


    /**
     * Helper to get high-resolution microsecond timestamp
     */
    private nowInMicroseconds(): number {
        return performance.now() * 1000;
    }

    /**
     * Instrument synchronous execution.
     */
    public span<T>(options: SpanOptions, fn: () => T): T {
        const cat = options.cat ?? "game";
        const startTs = this.nowInMicroseconds();

        // Push "Begin" event
        this.events.push({
            name: options.name,
            cat,
            ph: "B",
            ts: startTs,
            pid: 1,
            tid: 1,
            args: options.args,
        });

        try {
            return fn();
        } finally {
            const endTs = this.nowInMicroseconds();

            // Push "End" event
            this.events.push({
                name: options.name,
                cat,
                ph: "E",
                ts: endTs,
                pid: 1,
                tid: 1,
            });
        }
    }

    /**
     * Instrument async promises or async game tasks.
     */
    public async spanAsync<T>(options: SpanOptions, fn: () => Promise<T>): Promise<T> {
        const cat = options.cat ?? "game";
        const startTs = this.nowInMicroseconds();

        this.events.push({
            name: options.name,
            cat,
            ph: "B",
            ts: startTs,
            pid: 1,
            tid: 1,
            args: options.args,
        });

        try {
            return await fn();
        } finally {
            const endTs = this.nowInMicroseconds();
            this.events.push({
                name: options.name,
                cat,
                ph: "E",
                ts: endTs,
                pid: 1,
                tid: 1,
            });
        }
    }

    /**
     * Record a single point-in-time instant event (zero duration).
     */
    public mark(name: string, cat = "event", args?: TraceArgs): void {
        this.events.push({
            name,
            cat,
            ph: "i",
            s: "t", // Thread-level instant mark
            ts: this.nowInMicroseconds(),
            pid: 1,
            tid: 1,
            args,
        });
    }

    /**
     * Triggers a browser download of the trace file formatted for Perfetto UI.
     */
    public downloadJSON(filename = `game-trace-${Date.now()}.json`): void {
        if (this.events.length === 0) {
            console.warn("[BrowserTracer] No events recorded to download.");
            return;
        }

        const payload = JSON.stringify(this.events, null, 2);
        const blob = new Blob([payload], {type: "application/json"});
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();

        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);

        this.events = [];
    }
}

// export const tracer = new BrowserTracer();
export const tracer = new NoOpTracer();