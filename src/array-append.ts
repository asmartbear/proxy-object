import * as D from '@asmartbear/dyn'

/** Implementation of an Array type where "append" is the only allowed operation. */
export interface IArrayAppendOnlyImplementation<T> {
    /** Returns any iterable over all elements in the array. */
    elements(): Iterable<T>
    /** Inserts an element at the end of the array. */
    append(x: T): void
}

/** Proxy object that acts like a native generic object */
export class ProxyArrayAppendOnly<T> extends Array<T> {

    private readonly impl: IArrayAppendOnlyImplementation<T>
    private state: { proxyActive: boolean }

    private constructor(impl: IArrayAppendOnlyImplementation<T>) {
        const arr = D.ARRAY(impl.elements())
        super(arr.length)
        for (const i in arr) {
            this[i] = arr[i]
        }
        this.impl = impl
        this.state = { proxyActive: true }
    }

    static create<T>(impl: IArrayAppendOnlyImplementation<T>): T[] {
        const obj = new ProxyArrayAppendOnly(impl)
        return new Proxy<T[]>(obj, obj)
    }

    set(target: T[], p: any, x: any, receiver: any): boolean {
        if (this.state.proxyActive) {
            throw new Error("Cannot set elements in this type of array: " + this.constructor.name)
        }
        return Reflect.set(target, p, x, receiver)
    }

    push(...items: T[]): number {
        if (items.length <= 0) return 0       // trivial case
        for (const x of items) {
            this.impl.append(x)
        }
        this.state.proxyActive = false
        const result = super.push(...items)
        this.state.proxyActive = true
        return result
    }

}