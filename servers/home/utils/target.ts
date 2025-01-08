import { Network } from "@/servers/dist/lib/network/network";
import { calc_max_HGW } from "@/servers/dist/lib/hack/utils";
export async function main(ns: NS) {
    if (ns.args.length != 1) {
        ns.tprint("ERROR: missing required arg RAM");
        ns.exit();
    }
    const network = new Network(ns);
    let servers = network.servers;
    const ram = ns.args[0] as number;

    const h_ram = ns.getScriptRam('lib/hack/hack.js', 'home');
    const g_ram = ns.getScriptRam('lib/hack/grow.js', 'home');
    const w_ram = ns.getScriptRam('lib/hack/weaken.js', 'home');
    let freeRAM = ram;

    while (freeRAM > 16) {
        let target = servers.at(0);
        let best = 0.0;
        let usedRAM = 0.0;

        for (const node of network.servers) {
            const server = node.data;
            const name = server.hostname;

            const result = calc_max_HGW(ns, server, ram);

            const h_time = ns.getHackTime(name);
            const g_time = ns.getGrowTime(name);
            const w_time = ns.getWeakenTime(name);

            const rate = server.moneyMax * result.portion / Math.max(h_time, g_time, w_time);

            ns.print(`INFO: server: ${name}\ntime: h ${h_time} g ${g_time} w ${w_time}\nmoney: ${server.moneyMax}\nrate: ${rate}`);
            if (rate > best) {
                target = node;
                best = rate;
                usedRAM = result.h_threads * h_ram + result.g_threads * g_ram + (result.wh_threads + result.wg_threads) * w_ram;
            }
        }
        const index = servers.indexOf(target);
        servers.splice(index, 1);
        freeRAM = freeRAM - usedRAM;
        ns.tprint(`Target: ${target.data.hostname}, RAM: ${usedRAM}`);
    }
}