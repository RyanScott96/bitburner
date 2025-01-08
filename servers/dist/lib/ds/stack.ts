export class Stack<T> {
    private data: T[]
    constructor() {
        this.data = [];
    }
    
    push(el: T) {
        this.data.push(el);
    }

    pop(): T {
        return this.data.pop();
    }

    peek(): T {
        return this.data.at(this.data.length - 1);
    }

    size(): number {
        return this.data.length;
    }
}