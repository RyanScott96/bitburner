import { Server } from '@/NetscriptDefinitions';
import { Node } from '../ds/node';
import { Stack } from '../ds/stack';

export class Network {
    servers: Node<Server>[]

    constructor(ns: NS) {
        this.servers = [];

        const home = ns.getServer("home");
        const root = new Node<Server>(home);

        const adj = ns.scan(root.data.hostname);
        for (const serv of adj) {
            const server = ns.getServer(serv);
            root.adjacencies.push(new Node<Server>(server));
        }

        const stack = new Stack<Node<Server>>();
        const visited: Node<Server>[] = [];
        stack.push(root);

        while(stack.size() > 0) {

            // Get next server to check
            const current = stack.pop();

            // Add to network
            this.servers.push(current);

            // Mark visited
            visited.push(current);

            // Add adjacnecies
            const adjacencies = ns.scan(current.data.hostname);
            for (const serv of adjacencies) {
                // add existing node if available
                let existing = visited.find((server: Node<Server>) => serv === server.data.hostname);
                if (existing) {
                    current.adjacencies.push(existing);
                }
                // otherwise create node
                else {
                    let node = new Node<Server>(ns.getServer(serv));
                    current.adjacencies.push(node)
                    stack.push(node);
                }
            }
        }

    }

    traverse<T>(predicate: (_: Server) => Boolean, operation: (_: Server) => T) {
        for (const node of this.servers) {
            if (predicate(node.data)) {
                operation(node.data);
            }
        }
    }
}