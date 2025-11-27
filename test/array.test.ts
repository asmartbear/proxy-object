import * as T from '@asmartbear/testutil'
import { IArrayImplementation, ProxyArray } from "../src/array"

class UnitArrayImpl implements IArrayImplementation<number> {
    public readonly list: number[]

    constructor(init: number[]) {
        this.list = init.slice()
    }
    elements(): Iterable<number> {
        return this.list
    }
    set(idx: number, value: number): void {
        T.is(idx >= 0)
        T.is(idx < this.list.length)
        this.list[idx] = value
    }
}

test('basic array operations', () => {
    const impl = new UnitArrayImpl([4, 5, 6])
    const s = new ProxyArray(impl)
    T.eq(s.length, 3)
    T.eq(s.toString(), "4,5,6")

    // Set a value
    // s[1] = 55
    // T.eq(s.length, 3)
    // T.eq(s.toString(), "4,55,6")
    // T.eq(impl.list.toString(), "4,55,6")
})

