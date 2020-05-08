/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { jsx } from "@emotion/core";

import { IComponentProps } from "./common";

////////////////////////////////////////////////////////////////////////////////

export interface IExpandableGroupProps extends IComponentProps
{
}

export default class ExpandableGroup extends React.Component<IExpandableGroupProps, any>
{
    static defaultProps: IExpandableGroupProps = {
        className: "ff-expandable-group"
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

        return (<div
            className={className}
            style={style} >

            {children}
        </div>);
    }
}
