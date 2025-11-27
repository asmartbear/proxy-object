import * as T from '@asmartbear/testutil'
import { IArrayImplementation, ProxyArray } from "../src/array"

class UnitArrayImpl implements IArrayImplementation<string> {
    public readonly list: string[]
    public counters: {
        sets: number,
        inserts: number,
        deletes: number,
    }

    constructor(init: string[]) {
        this.list = init.slice()
        this.counters = { sets: 0, inserts: 0, deletes: 0 }
    }
    elements(): Iterable<string> {
        return this.list
    }
    set(idx: number, value: string): void {
        T.is(idx >= 0)
        T.is(idx < this.list.length)
        this.list[idx] = value
        ++this.counters.sets
    }
    insert(idx: number, value: string): void {
        T.is(idx >= 0)
        T.is(idx <= this.list.length)
        this.list.splice(idx, 0, value)
        ++this.counters.inserts
    }
}

test('basic array operations', () => {
    const impl = new UnitArrayImpl(["a", "b", "c"])
    const s = ProxyArray.from(impl)
    T.len(s, 3)
    T.eq(s.toString(), "a,b,c")
    T.eq(impl.counters, { sets: 0, inserts: 0, deletes: 0 })

    // Set a value
    s[1] = "bb"
    T.len(s, 3)
    T.eq(s.toString(), "a,bb,c")
    T.eq(impl.counters, { sets: 1, inserts: 0, deletes: 0 })
    T.eq(impl.list.toString(), "a,bb,c")

    // Append a value
    s.push("d")
    T.len(s, 4)
    T.eq(s.toString(), "a,bb,c,d")
    T.eq(impl.counters, { sets: 1, inserts: 1, deletes: 0 })
    T.eq(impl.list.toString(), "a,bb,c,d")

    // Prepend a value
    // s.unshift("e")
    // T.len(s, 5)
    // T.eq(s.toString(), "e,a,bb,c,d")
    // T.eq(impl.counters, { sets: 1, inserts: 2, deletes: 0 })
    // T.eq(impl.list.toString(), "e,a,bb,c,d")
})

