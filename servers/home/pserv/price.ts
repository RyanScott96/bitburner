export async function main(ns: NS) {
    let ram = 2;
    let cost = ns.getPurchasedServerCost(ram);

    while (cost < ns.getPlayer().money) {
        let new_ram = ram * 2;
        let new_cost = ns.getPurchasedServerCost(new_ram);

        if (new_cost >= ns.getPlayer().money) {
            break;
        }

        ram = new_ram;
        cost = new_cost;
    }

    ns.tprint(`Max affordable server ${ram} RAM for $${cost}`);

    if (ns.args.length == 1) {
        let ram = ns.args[0] as number;
        ns.tprint(`Cost of server with ${ram} RAM is $${ns.getPurchasedServerCost(ram)}`);
    }
}