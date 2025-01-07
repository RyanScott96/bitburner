import { Network } from "@/servers/dist/lib/network/network";

export async function main(ns: NS) {
    const network = new Network(ns);
    let ports = 0;
    if (ns.fileExists("brutessh.exe", "home")) ports++;
    if (ns.fileExists("ftpcrack.exe", "home")) ports++;
    if (ns.fileExists("relaysmtp.exe", "home")) ports++;
    if (ns.fileExists("httpworm.exe", "home")) ports++;
    if (ns.fileExists("sqlinject.exe", "home")) ports++;

    network.traverse(
        (server) => { return server.numOpenPortsRequired <= ports; },
        (server) => {
            if (ports >= 5) ns.sqlinject(server.hostname);
            if (ports >= 4) ns.httpworm(server.hostname);
            if (ports >= 3) ns.relaysmtp(server.hostname);
            if (ports >= 2) ns.ftpcrack(server.hostname);
            if (ports >= 1) ns.brutessh(server.hostname);
            ns.nuke(server.hostname);
        }
    )
}