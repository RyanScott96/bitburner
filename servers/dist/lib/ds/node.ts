export class Node<T> {
    data: T;
    adjacencies: Node<T>[];

    constructor(data: T) {
        this.data = data;
        this.adjacencies = [];
    }
}