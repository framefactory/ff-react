/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[List]] component. */
export interface IListProps
{
    className?: string;
}

export default class List extends React.Component<IListProps, {}>
{
    static readonly defaultProps: Partial<IListProps> = {
        className: "ff-list"
    };

    render()
    {
        const {
            className
        } = this.props;

        return (
            <div
                className={className}>

            </div>
        );
    }

    protected renderItem()
    {

    }
}