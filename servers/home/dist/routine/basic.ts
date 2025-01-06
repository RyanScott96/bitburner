import { calc_g_threads, calc_h_threads, calc_w_threads } from "../lib/hack/threads";

export async function main(ns: NS) {
    if (ns.args.length != 1) {
        ns.print('ERROR: Missing arg. Target required.');
        ns.exit();
    }

    let target = ns.getServer(ns.args[0] as string);
    const host = ns.getServer(ns.getHostname());
    const spread = .25;
    const delay = 25
    const freeRAM = host.maxRam - host.ramUsed;

    const h_script = 'lib/hack/hack.js';
    const g_script = 'lib/hack/grow.js';
    const w_script = 'lib/hack/weaken.js';

    const max_h_threads = Math.floor(freeRAM / ns.getScriptRam(h_script));
    const max_g_threads = Math.floor(freeRAM / ns.getScriptRam(g_script));
    const max_w_threads = Math.floor(freeRAM / ns.getScriptRam(w_script));

    const h_threads = Math.min(max_h_threads, calc_h_threads(ns, target, spread));
    const g_threads = Math.min(max_g_threads, calc_g_threads(ns, target, spread));

    const wh_threads = Math.min(max_w_threads, calc_w_threads(ns, ns.hackAnalyzeSecurity(h_threads)));
    const wg_threads = Math.min(max_w_threads, calc_w_threads(ns, ns.growthAnalyzeSecurity(g_threads)));

    ns.print(`h: ${h_threads}, g: ${g_threads}, wh: ${wh_threads}, wg: ${wg_threads}`);

    while (target.hackDifficulty > target.minDifficulty) {
        ns.run(w_script, {threads: max_w_threads, temporary: true}, target.hostname, max_w_threads);
        await ns.sleep(ns.getWeakenTime(target.hostname) + delay);
        target = ns.getServer(target.hostname);
    }

    while (target.moneyAvailable < target.moneyMax) {
        ns.run(g_script, {threads: max_g_threads, temporary: true}, target.hostname, max_g_threads);
        await ns.sleep(ns.getGrowTime(target.hostname) + delay);
        target = ns.getServer(target.hostname);
    }

    while (target.hackDifficulty > target.minDifficulty) {
        ns.run(w_script, {threads: max_w_threads, temporary: true}, target.hostname, max_w_threads);
        await ns.sleep(ns.getWeakenTime(target.hostname) + delay);
        target = ns.getServer(target.hostname);
    }

    for (;;)
    {
        ns.run(h_script, {threads: h_threads, temporary: true}, target.hostname, h_threads);
        await ns.sleep(ns.getHackTime(target.hostname) + delay);
        target = ns.getServer(target.hostname);

        ns.run(w_script, {threads: wh_threads, temporary: true}, target.hostname, wh_threads);
        await ns.sleep(ns.getWeakenTime(target.hostname) + delay);
        target = ns.getServer(target.hostname);

        ns.run(g_script, {threads: g_threads, temporary: true}, target.hostname, g_threads);
        await ns.sleep(ns.getGrowTime(target.hostname) + delay);
        target = ns.getServer(target.hostname);

        ns.run(w_script, {threads: wg_threads, temporary: true}, target.hostname, wg_threads);
        await ns.sleep(ns.getWeakenTime(target.hostname) + delay);
        target = ns.getServer(target.hostname);

        await ns.sleep(delay);
    }

}