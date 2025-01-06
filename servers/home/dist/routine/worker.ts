import { Payload } from "../lib/hack/payload";

export async function main(ns: NS) {
    for (;;) {
        const worker_port = 12345;
        const raw = ns.readPort(worker_port);

        if (raw as string === "NULL PORT DATA") {
            await ns.nextPortWrite(worker_port);
        }
        else {
            const data = raw as Payload;
            ns.run(data.script, {threads: data.threads}, data.target, data.threads);
            await ns.sleep(data.time);
        }
    }
}