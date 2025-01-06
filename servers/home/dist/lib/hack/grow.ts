export async function main(ns: NS) {
    if (ns.args.length < 2) {
        ns.print('ERROR: Missing args. Target and threads required.');
        ns.exit();
    }

    if (ns.args.length > 4) {
        ns.print('WARN: Unused args provided. Ignoring...');
    }

    const target = ns.args[0] as string;
    const threads = ns.args[1] as number;
    const delay = ns.args[2] as number | undefined;
    const stock = ns.args[3] as boolean | undefined;

    await ns.grow(target, {threads: threads, additionalMsec: delay, stock: stock});
}