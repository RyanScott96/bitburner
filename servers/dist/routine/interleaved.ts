import { calc_max_HGW, calc_w_threads } from "../lib/hack/utils";

export async function main(ns: NS) {
    if (ns.args.length != 1) {
        ns.print('ERROR: Missing arg. Target required.');
        ns.exit();
    }

    let target = ns.getServer(ns.args[0] as string);
    const host = ns.getServer(ns.getHostname());
    const delay = 200;
    const freeRAM = host.maxRam - host.ramUsed;

    const h_script = 'lib/hack/hack.js';
    const g_script = 'lib/hack/grow.js';
    const w_script = 'lib/hack/weaken.js';

    const oneshot = 'routine/oneshot.js';

    const h_ram = ns.getScriptRam(h_script);
    const g_ram = ns.getScriptRam(g_script);
    const w_ram = ns.getScriptRam(w_script);

    const max_h_threads = Math.floor(freeRAM / h_ram);
    const max_g_threads = Math.floor(freeRAM / g_ram);
    const max_w_threads = Math.floor(freeRAM / w_ram);

    // Prep the target
    while (target.hackDifficulty > target.minDifficulty || target.moneyAvailable < target.moneyMax) {
        const g_time = ns.getGrowTime(target.hostname);
        const w_time = ns.getWeakenTime(target.hostname);
        const epoch = Math.max(g_time, w_time);

        if (target.hackDifficulty > target.minDifficulty) {
            ns.print(`INFO: sec: ${target.hackDifficulty}, min: ${target.minDifficulty}`)
            const prep_w = Math.min(max_w_threads, calc_w_threads(ns, target.hackDifficulty));
            ns.run(w_script, {threads: prep_w, temporary: true}, target.hostname, prep_w);
            target = ns.getServer(target.hostname);
        }

        if (target.moneyAvailable < target.moneyMax) {
            ns.print(`INFO: money: ${target.moneyAvailable}, max: ${target.moneyMax}`)
            const prep_g = Math.min(max_g_threads, Math.ceil(ns.growthAnalyze(target.hostname, target.moneyMax / target.moneyAvailable)));
            ns.run(g_script, {threads: prep_g, temporary: true}, target.hostname, prep_g);
            target = ns.getServer(target.hostname);
        }
        await ns.sleep(ns.getGrowTime(target.hostname) + delay);
    }

    const result = calc_max_HGW(ns, target, freeRAM);
    const ram_cost = result.h_threads * h_ram + result.g_threads * g_ram + (result.wg_threads + result.wh_threads) * w_ram;

    ns.print(`INFO: poriton: ${result.portion}`);
    ns.print(`INFO: max h: ${max_h_threads}, g: ${max_g_threads}, w: ${max_w_threads}`);
    ns.print(`INFO: h: ${result.h_threads}, g: ${result.g_threads}, wh: ${result.wh_threads}, wg: ${result.wg_threads}`);

    // Execute
    for (;;) {
        const h_time = ns.getHackTime(target.hostname);
        const g_time = ns.getGrowTime(target.hostname);
        const w_time = ns.getWeakenTime(target.hostname);

        const epoch = Math.max(h_time, g_time, w_time);

        const delH = epoch - h_time;
        const delG = epoch - g_time;
        const delW = epoch - w_time;

        const stagger = 20;
        const delay = stagger * 5;

        const instances =  Math.min(Math.floor(freeRAM / ram_cost), Math.floor(epoch / delay));
        ns.print(`INFO: instances: ${instances}`)
        for (let  i = 0; i < instances; ++i) {
            ns.run(oneshot, {} ,
                target.hostname,
                result.h_threads, result.g_threads, result.wh_threads, result.wg_threads,
                epoch, i * delay, stagger,
                delH, delG, delW);
        }
        await ns.sleep(epoch +  delay * instances + delay);
    }
}