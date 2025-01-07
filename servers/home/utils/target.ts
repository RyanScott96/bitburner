import { Network } from "@/servers/dist/lib/network/network";
import { calc_max_HGW } from "@/servers/dist/lib/hack/utils";
export async function main(ns: NS) {
    if (ns.args.length != 1) {
        ns.tprint("ERROR: missing required arg RAM");
        ns.exit();
    }
    const network = new Network(ns);
    const ram = ns.args[0] as number;

    let target = ns.getServer("home");
    let best = 0.0;

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
            target = server;
            best = rate;
        }
    }
    ns.tprint(target.hostname);
}