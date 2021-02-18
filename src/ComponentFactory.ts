/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

////////////////////////////////////////////////////////////////////////////////

export interface IComponentFactoryEntry
{
    id: string;
    factory: () => JSX.Element
}

export default class ComponentFactory
{
    protected componentFactories: { [id:string]: () => JSX.Element };

    constructor(entries?: IComponentFactoryEntry[])
    {
        this.componentFactories = {};

        if (entries) {
            for (let entry of entries) {
                this.componentFactories[entry.id] = entry.factory;
            }
        }
    }

    add(id: string, factory: () => JSX.Element)
    {
        this.componentFactories[id] = factory;
    }

    create(id: string): JSX.Element
    {
        const factory = this.componentFactories[id];
        if (!factory) {
            throw new Error(`unknown component id: '${id}'`);
        }

        return factory();
    }
}