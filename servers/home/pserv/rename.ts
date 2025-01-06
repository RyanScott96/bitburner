export async function main(ns: NS) {
    if (ns.args.length != 2) {
        ns.print("ERROR: Missing args. Existing and new names required.");
        ns.exit();
    }
    const target = ns.args[0] as string;
    const name = ns.args[1] as string;
    ns.renamePurchasedServer(target, name);
}