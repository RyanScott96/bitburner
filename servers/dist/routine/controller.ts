import { Payload } from "../lib/hack/payload";
import { Network } from "../lib/network/network";

export async function main(ns: NS) {
    const worker_port = 12345;
    const network = new Network(ns);
    ns.tprint(network);
    
    // ns.writePort(worker_port, data);
}