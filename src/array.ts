import * as D from '@asmartbear/dyn'

/** Implementation of an Array type where "append" is the only allowed operation. */
export interface IArrayAppendOnlyImplementation<T> {
    /** Returns any iterable over all elements in the array. */
    elements(): Iterable<T>
    /** Inserts an element at the end of the array. */
    append(x: T): void
}

/** Implementation of an Array type. */
export interface IArrayImplementation<T> extends IArrayAppendOnlyImplementation<T> {
    /** Inserts an element at the specified index, shifting out elements currently at or later. */
    insert(idx: number, x: T): void
    /** Deletes an element at the specified index, which will be in-bounds. */
    delete(idx: number): void
}

/** Proxy object that acts like a native generic object, except read-only except for push(). */
export class ProxyArrayAppendOnly<T, IMPL extends IArrayAppendOnlyImplementation<T>> extends Array<T> {

    protected readonly impl: IMPL
    protected state: { proxyActive: boolean }

    protected constructor(impl: IMPL) {
        const arr = D.ARRAY(impl.elements())
        super(arr.length)
        for (const i in arr) {
            this[i] = arr[i]
        }
        this.impl = impl
        this.state = { proxyActive: true }
    }

    static createAppendOnly<T, IMPL extends IArrayAppendOnlyImplementation<T>>(impl: IMPL): T[] {
        const obj = new ProxyArrayAppendOnly<T, IMPL>(impl)
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

/** Proxy object that acts like a native generic object */
export class ProxyArray<T> extends ProxyArrayAppendOnly<T, IArrayImplementation<T>> {

    static create<T, IMPL extends IArrayImplementation<T>>(impl: IMPL): T[] {
        const obj = new ProxyArray<T>(impl)
        return new Proxy<T[]>(obj, obj)
    }

    set(target: T[], p: any, x: any, receiver: any): boolean {
        if (this.state.proxyActive) {
            throw new Error(`Cannot set element [${String(p)}] in this type of array: ${this.constructor.name}`)
        }
        return Reflect.set(target, p, x, receiver)
    }

    unshift(...items: T[]): number {
        // Trivials
        if (items.length <= 0) return 0

        // Implementation
        for (let i = items.length; --i >= 0;) {
            this.impl.insert(0, items[i])
        }

        // Default
        this.state.proxyActive = false
        const result = super.unshift(...items)
        this.state.proxyActive = true
        return result
    }

    shift(): T | undefined {
        // Trivials
        if (this.length <= 0) return undefined

        // Implementation
        this.impl.delete(0)

        // Default
        this.state.proxyActive = false
        const result = super.shift()
        this.state.proxyActive = true
        return result
    }

    pop(): T | undefined {
        // Trivials
        if (this.length <= 0) return undefined

        // Implementation
        this.impl.delete(this.length - 1)

        // Default
        this.state.proxyActive = false
        const result = super.pop()
        this.state.proxyActive = true
        return result
    }

}