/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

////////////////////////////////////////////////////////////////////////////////

export interface IExpandableGroupProps
{
    className?: string;
    style?: CSSProperties;
}

export default class ExpandableGroup extends React.Component<IExpandableGroupProps, any>
{
    static defaultProps: IExpandableGroupProps = {
        className: "ExpandableGroup"
    };

    private static style: CSSProperties = {
    };

    constructor(props: IExpandableGroupProps)
    {
        super(props);
    }

    render()
    {
        const {
            className,
            style,
            children
        } = this.props;

        const stylesCombined = Object.assign({}, ExpandableGroup.style, style);

        return (<div
            className={className}
            style={stylesCombined} >

            {children}
        </div>);
    }
}