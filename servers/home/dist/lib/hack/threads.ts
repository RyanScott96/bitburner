import { Server } from "@/NetscriptDefinitions";

export function calc_h_threads(ns: NS, server: Server, deviation: number): number {
    const difference = (server.moneyMax * (.5 + deviation)) - (server.moneyMax * (.5 - deviation));
    return Math.round(ns.hackAnalyzeThreads(server.hostname, difference));
}

export function calc_g_threads(ns: NS, server: Server, deviation: number): number {
    const ratio = (server.moneyMax * (.5 + deviation)) / (server.moneyMax * (.5 - deviation));
    return Math.ceil(ns.growthAnalyze(server.hostname, ratio));
}

export function calc_w_threads(ns: NS, security: number, cores?: number) {
    const divisor = ns.weakenAnalyze(1, cores);
    return Math.ceil(security / divisor);
}