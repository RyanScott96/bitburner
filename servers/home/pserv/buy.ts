export async function main(ns: NS) {
    if (ns.args.length != 1) {
        ns.print("ERROR: Missing required arg. RAM required.");
    }    

    const ram = ns.args[0] as number;
    const id = ns.getPurchasedServers().length;
    ns.purchaseServer(`pserv-${id}`, ram);
}