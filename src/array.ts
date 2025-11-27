import * as D from '@asmartbear/dyn'

/** Implementation of an Array proxy */
export interface IArrayImplementation<T> {
    /** Returns any iterable over all elements in the array. */
    elements(): Iterable<T>
    /** Sets the element at a specific index, which is within the array bounds. */
    set(idx: number, value: T): void
}

/** Proxy object that acts like a native `Array` */
export class ProxyArray<T> extends Array<T> {

    private readonly impl: IArrayImplementation<T>

    constructor(impl: IArrayImplementation<T>) {
        const list = D.ARRAY(impl.elements())
        super(list.length)
        for (let k = list.length; --k >= 0;) {
            this[k] = list[k]
        }
        this.impl = impl
    }

}