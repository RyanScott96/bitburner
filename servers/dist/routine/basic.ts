import { calc_g_threads, calc_h_threads, calc_max_HGW, calc_w_threads } from "../lib/hack/utils";

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

    const h_ram = ns.getScriptRam(h_script);
    const g_ram = ns.getScriptRam(g_script);
    const w_ram = ns.getScriptRam(w_script);

    const max_h_threads = Math.floor(freeRAM / h_ram);
    const max_g_threads = Math.floor(freeRAM / g_ram);
    const max_w_threads = Math.floor(freeRAM / w_ram);

    // Prep the target
    while (target.hackDifficulty > target.minDifficulty || target.moneyAvailable < target.moneyMax) {
        if (target.hackDifficulty > target.minDifficulty) {
            ns.print(`INFO: sec: ${target.hackDifficulty}, min: ${target.minDifficulty}`)
            const prep_w = Math.min(max_w_threads, calc_w_threads(ns, target.hackDifficulty));
            ns.run(w_script, {threads: prep_w, temporary: true}, target.hostname, prep_w);
            await ns.sleep(ns.getWeakenTime(target.hostname) + delay);
            target = ns.getServer(target.hostname);
        }

        if (target.moneyAvailable < target.moneyMax) {
            ns.print(`INFO: money: ${target.moneyAvailable}, max: ${target.moneyMax}`)
            const prep_g = Math.min(max_g_threads, Math.ceil(ns.growthAnalyze(target.hostname, target.moneyMax / target.moneyAvailable)));
            ns.run(g_script, {threads: prep_g, temporary: true}, target.hostname, prep_g);
            await ns.sleep(ns.getGrowTime(target.hostname) + delay);
            target = ns.getServer(target.hostname);
        }
    }

    const result = calc_max_HGW(ns, target, freeRAM);

    ns.print(`INFO: poriton: ${result.portion}`);
    ns.print(`INFO: max h: ${max_h_threads}, g: ${max_g_threads}, w: ${max_w_threads}`);
    ns.print(`INFO: h: ${result.h_threads}, g: ${result.g_threads}, wh: ${result.wh_threads}, wg: ${result.wg_threads}`);

    // Execute
    for (;;) {
        const epoch = Math.max(ns.getHackTime(target.hostname), ns.getGrowTime(target.hostname), ns.getWeakenTime(target.hostname));
        const delH = epoch - ns.getHackTime(target.hostname);
        const delG = epoch - ns.getGrowTime(target.hostname);
        const delW = epoch - ns.getWeakenTime(target.hostname);

        ns.run(h_script, { threads: result.h_threads, temporary: true }, target.hostname, result.h_threads, delH);
        ns.run(w_script, { threads: result.wh_threads, temporary: true }, target.hostname, result.wh_threads, delW + 20);
        ns.run(g_script, { threads: result.g_threads, temporary: true }, target.hostname, result.g_threads, delG + 40);
        ns.run(w_script, { threads: result.wg_threads, temporary: true }, target.hostname, result.wg_threads, delW + 60);
        await ns.sleep(epoch + delay);
        target = ns.getServer(target.hostname);
    }
}