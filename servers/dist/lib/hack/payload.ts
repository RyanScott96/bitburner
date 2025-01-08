import { Server } from "@/NetscriptDefinitions"
import { calc_w_threads } from "./utils"

export interface Payload {
    target: string,
    script: string,
    threads: number,
    time: number,
}

export function min_sec_payload(ns: NS, server: Server): Payload {
    return {
        target: server.hostname,
        script: 'dist/lib/hack/weaken.js',
        threads: calc_w_threads(ns, server.hackDifficulty),
        time: ns.getWeakenTime(server.hostname),
    }
}

export function max_money_payload(ns: NS, server: Server): Payload {
    return {
        target: server.hostname,
        script: 'dist/lib/hack/grow.js',
        threads: ns.growthAnalyze(server.hostname, Math.ceil(server.moneyMax / server.moneyAvailable)),
        time: ns.getGrowTime(server.hostname),
    }
}