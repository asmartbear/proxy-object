import * as T from '@asmartbear/testutil'
import { IArrayAppendOnlyImplementation, ProxyArrayAppendOnly } from "../src/array-append"

class UnitArrayAppendOnlyImpl implements IArrayAppendOnlyImplementation<string> {
    public readonly list: string[]
    public counters: {
        appends: number,
    }

    constructor(init: string[]) {
        this.list = init.slice()
        this.counters = { appends: 0 }
    }
    elements(): Iterable<string> {
        return this.list
    }
    append(value: string): void {
        this.list.push(value)
        ++this.counters.appends
    }
}

test('append-only array', () => {
    const impl = new UnitArrayAppendOnlyImpl(["a", "b", "c"])
    const s = ProxyArrayAppendOnly.create(impl)
    T.len(s, 3)
    T.eq(s.toString(), "a,b,c")
    T.eq(impl.counters, { appends: 0 })

    // Trivial append
    s.push()
    T.len(s, 3)
    T.eq(s.toString(), "a,b,c")
    T.eq(impl.counters, { appends: 0 })
    T.eq(impl.list.toString(), "a,b,c")

    // Append a value
    s.push("d")
    T.len(s, 4)
    T.eq(s.toString(), "a,b,c,d")
    T.eq(impl.counters, { appends: 1 })
    T.eq(impl.list.toString(), "a,b,c,d")

    // Append multiple values
    s.push("e", "f")
    T.len(s, 6)
    T.eq(s.toString(), "a,b,c,d,e,f")
    T.eq(impl.counters, { appends: 3 })
    T.eq(impl.list.toString(), "a,b,c,d,e,f")

    // Illegals
    T.throws(() => { s[1] = "z" })
    T.throws(() => { s.length = 10 })
})

