import * as D from '@asmartbear/dyn'

/** Picks the type of element out of the array */
type ArrayOf<T> = T extends Array<infer U> ? U : never;

/** Implementation of an Array proxy */
export interface IArrayImplementation<T> {
    /** Returns any iterable over all elements in the array. */
    elements(): Iterable<T>
    /** Sets the element at a specific index, which is within the array bounds. */
    set(idx: number, x: T): void
    /** Inserts an element at the given location, which will be in `[0,length]` inclusive; `length` if appending. */
    insert(idx: number, x: T): void
}

/** Proxy object that acts like a native generic object */
export class ProxyArray<T> {

    private readonly impl: IArrayImplementation<T>

    private constructor(impl: IArrayImplementation<T>) {
        this.impl = impl
    }

    static from<T>(impl: IArrayImplementation<T>): T[] {
        const obj = D.ARRAY(impl.elements())
        return new Proxy<T[]>(obj, new ProxyArray(impl))
    }

    set(target: T[], p: any, x: any, receiver: any): boolean {
        if (p !== 'length') {
            const idx = Number.parseInt(p)
            if (idx >= target.length) {          // appending means "setting" an element at the end of the array
                this.impl.insert(target.length, x)
            } else {
                this.impl.set(idx, x)
            }
        }
        return Reflect.set(target, p, x, receiver)
    }

}