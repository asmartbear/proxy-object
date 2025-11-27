import * as T from '@asmartbear/testutil'
import { IArrayAppendOnlyImplementation, ProxyArrayAppendOnly, IArrayImplementation, ProxyArray } from "../src/array"

class UnitArrayAppendOnlyImpl<T> implements IArrayAppendOnlyImplementation<T> {
    public readonly list: T[]
    public counters: {
        appends: number,
    }

    constructor(init: T[]) {
        this.list = init.slice()
        this.counters = { appends: 0 }
    }
    elements(): Iterable<T> {
        return this.list
    }
    append(value: T): void {
        this.list.push(value)
        ++this.counters.appends
    }
}

class UnitArrayImpl<T> extends UnitArrayAppendOnlyImpl<T> implements IArrayImplementation<T> {
    public counters: {
        appends: number,
        inserts: number,
        deletes: number,
    }

    constructor(init: T[]) {
        super(init)
        this.counters = { appends: 0, inserts: 0, deletes: 0 }
    }
    insert(idx: number, value: T): void {
        T.is(idx >= 0)
        T.is(idx <= this.list.length)
        this.list.splice(idx, 0, value)
        ++this.counters.inserts
    }
    delete(idx: number): void {
        T.is(idx >= 0)
        T.is(idx < this.list.length)
        this.list.splice(idx, 1)
        ++this.counters.deletes
    }
}

function doAppendTests(s: string[], impl: UnitArrayAppendOnlyImpl<string>) {
    T.len(s, 3)
    T.eq(s.toString(), "a,b,c")
    T.includes(impl.counters, { appends: 0 })

    // Trivial append
    s.push()
    T.len(s, 3)
    T.eq(s.toString(), "a,b,c")
    T.includes(impl.counters, { appends: 0 })
    T.eq(impl.list.toString(), "a,b,c")

    // Append a value
    s.push("d")
    T.len(s, 4)
    T.eq(s.toString(), "a,b,c,d")
    T.includes(impl.counters, { appends: 1 })
    T.eq(impl.list.toString(), "a,b,c,d")

    // Append multiple values
    s.push("e", "f")
    T.len(s, 6)
    T.eq(s.toString(), "a,b,c,d,e,f")
    T.includes(impl.counters, { appends: 3 })
    T.eq(impl.list.toString(), "a,b,c,d,e,f")

    // Illegal for all arrays
    T.throws(() => { s.length = 10 })
}

function doPrependTests(s: string[], impl: UnitArrayImpl<string>) {
    T.len(s, 3)
    T.eq(s.toString(), "a,b,c")
    T.includes(impl.counters, { appends: 0, inserts: 0, deletes: 0 })

    // Trivial append
    s.unshift()
    T.len(s, 3)
    T.eq(s.toString(), "a,b,c")
    T.includes(impl.counters, { appends: 0, inserts: 0, deletes: 0 })
    T.eq(impl.list.toString(), "a,b,c")

    // Append a value
    s.unshift("d")
    T.len(s, 4)
    T.eq(s.toString(), "d,a,b,c")
    T.includes(impl.counters, { appends: 0, inserts: 1, deletes: 0 })
    T.eq(impl.list.toString(), "d,a,b,c")

    // Append multiple values
    s.unshift("e", "f")
    T.len(s, 6)
    T.eq(s.toString(), "e,f,d,a,b,c")
    T.includes(impl.counters, { appends: 0, inserts: 3, deletes: 0 })
    T.eq(impl.list.toString(), "e,f,d,a,b,c")
}

function doDeleteFromEnds(s: string[], impl: UnitArrayImpl<string>) {
    T.len(s, 3)
    T.eq(s.toString(), "a,b,c")
    T.includes(impl.counters, { appends: 0, inserts: 0, deletes: 0 })

    // shift off front
    const x = s.shift()
    T.len(s, 2)
    T.eq(s.toString(), "b,c")
    T.includes(impl.counters, { appends: 0, inserts: 0, deletes: 1 })
    T.eq(impl.list.toString(), "b,c")
    T.eq(x, "a")

    // pop off end
    const y = s.pop()
    T.len(s, 1)
    T.eq(s.toString(), "b")
    T.includes(impl.counters, { appends: 0, inserts: 0, deletes: 2 })
    T.eq(impl.list.toString(), "b")
    T.eq(y, "c")

    // pop last one
    T.defined(s.pop())
    T.eq(s.toString(), "")
    T.includes(impl.counters, { appends: 0, inserts: 0, deletes: 3 })
    T.eq(impl.list.toString(), "")

    // Empty list operations
    T.undef(s.pop())
    T.undef(s.pop())
    T.undef(s.shift())
    T.undef(s.shift())
    T.eq(s.toString(), "")
    T.includes(impl.counters, { appends: 0, inserts: 0, deletes: 3 })
    T.eq(impl.list.toString(), "")
}

test('append-only array', () => {
    const impl = new UnitArrayAppendOnlyImpl(["a", "b", "c"])
    const s: string[] = ProxyArrayAppendOnly.createAppendOnly(impl)
    doAppendTests(s, impl)

    // Illegal for append-only
    T.throws(() => { s[1] = "z" })
})

test('full array', () => {

    let impl = new UnitArrayImpl(["a", "b", "c"])
    let s: string[] = ProxyArray.create(impl)
    doAppendTests(s, impl)

    impl = new UnitArrayImpl(["a", "b", "c"])
    s = ProxyArray.create(impl)
    doPrependTests(s, impl)

    impl = new UnitArrayImpl(["a", "b", "c"])
    s = ProxyArray.create(impl)
    doDeleteFromEnds(s, impl)

})

