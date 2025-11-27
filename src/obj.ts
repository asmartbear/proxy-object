import * as D from '@asmartbear/dyn'

/** Implementation of an Object proxy */
export interface IObjectImplementation<T extends object> {
    /** Adds a field to the object, that doesn't already exist in the object. */
    add<K extends keyof T>(k: K, v: T[K]): void
    /** Update a field that is already in the object. */
    update<K extends keyof T>(k: K, v: T[K]): void
    /** Removes a field from the object, that was already in the object. */
    delete<K extends keyof T>(x: K): void
    /** Returns any iterable over all pairs of field/values in the object. */
    elements<K extends keyof T>(): Iterable<[K, T[K]]>
}

/** Proxy object that acts like a native generic object */
export class ProxyObject<T extends object> implements ProxyHandler<T> {

    private readonly impl: IObjectImplementation<T>

    constructor(impl: IObjectImplementation<T>) {
        this.impl = impl
    }

    static from<T extends object>(impl: IObjectImplementation<T>): T {
        const obj: any = {}
        for (const [k, v] of impl.elements()) {
            Object.defineProperty(obj, k, {
                enumerable: true,
                writable: true,
                value: v
            })
        }
        return new Proxy<T>(obj, new ProxyObject(impl))
    }

    /**
     * Reports some sort of 'set' operation to to the underlying implementation.
     */
    private doSet<K extends keyof T>(obj: T, k: K, v: T[K]) {
        if (Reflect.has(obj, k)) {
            this.impl.update(k, v)
        } else {
            this.impl.add(k, v)
        }
    }

    /**
     * A trap method for a function call.
     * @param target The original callable object which is being proxied.
     */
    apply(target: T, thisArg: any, argArray: any[]): any {
        throw new Error("apply() not supported on proxied objects")
    }

    /**
     * A trap for the `new` operator.
     * @param target The original object which is being proxied.
     * @param newTarget The constructor that was originally called.
     */
    construct(target: T, argArray: any[], newTarget: Function): object {
        throw new Error("construct() not supported on proxied objects")
    }

    /**
     * A trap for `Object.defineProperty()`.
     * @param target The original object which is being proxied.
     * @returns A `Boolean` indicating whether or not the property has been defined.
     */
    defineProperty(target: T, property: string | symbol, attributes: PropertyDescriptor): boolean {
        if ('value' in attributes) {
            this.doSet(target, property as any, attributes.value)
        }
        return Reflect.defineProperty(target, property, attributes)
    }

    /**
     * A trap for the `delete` operator.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to delete.
     * @returns A `Boolean` indicating whether or not the property was deleted.
     */
    deleteProperty(target: T, p: string | symbol): boolean {
        if (p in target) {      // don't notify if we delete a field that doesn't exist
            this.impl.delete(p as any)
            return Reflect.deleteProperty(target, p)
        }
        return true
    }

    /**
     * A trap for getting a property value.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to get.
     * @param receiver The proxy or an object that inherits from the proxy.
     */
    get(target: T, p: string | symbol, receiver: any) {
        return Reflect.get(target, p, receiver)
    }

    /**
     * A trap for `Object.getOwnPropertyDescriptor()`.
     * @param target The original object which is being proxied.
     * @param p The name of the property whose description should be retrieved.
     */
    getOwnPropertyDescriptor(target: T, p: string | symbol): PropertyDescriptor | undefined {
        return Reflect.getOwnPropertyDescriptor(target, p)
    }

    /**
     * A trap for the `[[GetPrototypeOf]]` internal method.
     * @param target The original object which is being proxied.
     */
    getPrototypeOf(target: T): object | null {
        return Reflect.getPrototypeOf(target)
    }

    /**
     * A trap for the `in` operator.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to check for existence.
     */
    has(target: T, p: string | symbol): boolean {
        return Reflect.has(target, p)
    }

    /**
     * A trap for `Object.isExtensible()`.
     * @param target The original object which is being proxied.
     */
    isExtensible(target: T): boolean {
        return false
    }

    /**
     * A trap for `Reflect.ownKeys()`.
     * @param target The original object which is being proxied.
     */
    ownKeys(target: T): ArrayLike<string | symbol> {
        return Reflect.ownKeys(target)
    }

    /**
     * A trap for `Object.preventExtensions()`.
     * @param target The original object which is being proxied.
     */
    preventExtensions(target: T): boolean {
        return true
    }

    /**
     * A trap for setting a property value.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to set.
     * @param receiver The object to which the assignment was originally directed.
     * @returns A `Boolean` indicating whether or not the property was set.
     */
    set(target: T, p: string | symbol, newValue: any, receiver: any): boolean {
        // defineProperty will trap the value
        return Reflect.set(target, p, newValue, receiver)
    }

    /**
     * A trap for `Object.setPrototypeOf()`.
     * @param target The original object which is being proxied.
     * @param newPrototype The object's new prototype or `null`.
     */
    setPrototypeOf(target: T, v: object | null): boolean {
        throw new Error("setPrototypeOf() not supported on proxied objects")
    }


}