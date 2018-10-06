/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";

////////////////////////////////////////////////////////////////////////////////

type PropArray<P> = { [K in keyof P]: P[K] | P[K][] }

export default function<P, S>(InnerComponent: React.ComponentType<P>)
{
    return class extends React.Component<PropArray<P>, {}>
    {
        constructor(props)
        {
            super(props);
        }

        render()
        {
            const props = this.props;
            const keys = Object.keys(props);

            const count = keys.reduce((count, key) => {
                const prop = props[key];
                return Array.isArray(prop) ? Math.max(prop.length, count) : count;
            }, 0);

            const elements = [];
            for (let i = 0; i < count; ++i) {
                const elProps = keys.reduce((elProps, key) => {
                    const prop = props[key];
                    elProps[key] = Array.isArray(prop) ? prop[i % prop.length] : prop;
                    return elProps;
                }, {});

                elements.push(<InnerComponent key={i} {...elProps} />);
            }

            return (<React.Fragment>
                {elements}
            </React.Fragment>)
        }
    }

}
