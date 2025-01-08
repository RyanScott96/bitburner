import { Server } from "@/NetscriptDefinitions";

export interface HGW {
    target: Server,
    portion: number,
    h_threads: number,
    g_threads: number,
    wh_threads: number,
    wg_threads: number,
}

export function calc_h_threads(ns: NS, server: Server, portion: number): number {
    const difference = server.moneyMax * portion;
    return Math.floor(ns.hackAnalyzeThreads(server.hostname, difference));
}

export function calc_g_threads(ns: NS, server: Server, portion: number): number {
    const ratio = server.moneyMax / (server.moneyMax - server.moneyMax * portion);
    ns.print(`${server.moneyMax}, ${server.moneyMax - server.moneyMax * portion}, ${ratio}`);
    return Math.ceil(ns.growthAnalyze(server.hostname, ratio));
}

export function calc_w_threads(ns: NS, security: number, cores?: number) {
    const divisor = ns.weakenAnalyze(1, cores);
    return Math.ceil(security / divisor);
}

export function calc_max_HGW(ns: NS, server: Server, ram: number): HGW {
    const h_ram = ns.getScriptRam("/lib/hack/hack.js", "home");
    const g_ram = ns.getScriptRam("/lib/hack/grow.js", "home");
    const w_ram = ns.getScriptRam("/lib/hack/weaken.js", "home");

    if (server.moneyAvailable == 0 || server.requiredHackingSkill >  ns.getPlayer().skills.hacking) {
        return {
            target: server,
            portion: 0,
            h_threads: 0,
            g_threads: 0,
            wh_threads: 0,
            wg_threads: 0,
        }
    }

    // Calculate the max portion that can be taken each cycle (RAM Limited)
    let h_threads = 0;
    let g_threads = 0;
    let wh_threads = 0;
    let wg_threads = 0;

    let portion = 0.00;
    while (h_ram * h_threads + g_ram * g_threads + w_ram * (wh_threads + wg_threads) < ram) {
        let new_portion = portion + 0.01;
        if (1 - new_portion < .05) new_portion = .95;
        const new_h_threads = calc_h_threads(ns, server, new_portion);
        const new_g_threads = calc_g_threads(ns, server, new_portion);
        const new_wh_threads = calc_w_threads(ns, ns.hackAnalyzeSecurity(new_h_threads));
        const new_wg_threads = calc_w_threads(ns, ns.growthAnalyzeSecurity(new_g_threads));

        if (h_ram * new_h_threads + g_ram * new_g_threads + w_ram * (new_wh_threads + new_wg_threads) < ram && portion < .95) {
            portion = new_portion;
            h_threads = new_h_threads;
            g_threads = new_g_threads;
            wh_threads = new_wh_threads;
            wg_threads = new_wg_threads;
        }
        else {
            break;
        }
    }

    return {
        target: server,
        portion,
        h_threads,
        g_threads,
        wh_threads,
        wg_threads,
    }
}