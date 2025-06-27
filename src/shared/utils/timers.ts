import { $print } from "rbxts-transform-debug";

export type IntervalCleanup = () => void;

export function setInterval(cb: () => void | Promise<void>, ms: number): IntervalCleanup {
    let running = true;
    ms = ms / 1000;
    $print("Task started!");
    const thread = task.spawn(() => {
        while (running) {
            cb();
            task.wait(ms);
        }
    });
    return () => {
        running = false;
        task.cancel(thread);
        $print("Task stopped!");
    }
}