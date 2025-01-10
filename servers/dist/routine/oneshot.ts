export async function main(ns: NS) {
    if (ns.args.length != 11) {
        ns.print('ERROR: Missing arg. Target required.');
        ns.exit();
    }

    const target = ns.getServer(ns.args[0] as string);

    const h_threads = ns.args[1] as number;
    const g_threads = ns.args[2] as number;
    const wh_threads = ns.args[3] as number;
    const wg_threads = ns.args[4] as number;

    const epoch = ns.args[5] as number;
    const delay = ns.args[6] as number;
    const stagger = ns.args[7] as number;

    const delH = ns.args[8] as number;
    const delG = ns.args[9] as number;
    const delW = ns.args[10] as number;

    const h_script = 'lib/hack/hack.js';
    const g_script = 'lib/hack/grow.js';
    const w_script = 'lib/hack/weaken.js';

    await ns.sleep(delay);
    ns.run(h_script, { threads: h_threads, temporary: true }, target.hostname, h_threads, delH);
    ns.run(w_script, { threads: wh_threads, temporary: true }, target.hostname, wh_threads, delW + 1 * stagger);
    ns.run(g_script, { threads: g_threads, temporary: true }, target.hostname, g_threads, delG + 2 * stagger);
    ns.run(w_script, { threads: wg_threads, temporary: true }, target.hostname, wg_threads, delW + 3 * stagger);
    await ns.sleep(epoch + 4 * stagger);
}