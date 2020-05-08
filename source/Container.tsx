/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { jsx } from "@emotion/core";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[Container]] component. */
export interface IContainerProps
{
    className?: string;
    style?: React.CSSProperties;
}

/**
 * General purpose react component. Issues a callback when rendering,
 * providing client an opportunity to render child content.
 */
export default class Container extends React.Component<IContainerProps, {}>
{
    static readonly defaultProps: IContainerProps = {
        className: "ff-container"
    };

    public onRenderContent?: () => React.ReactNode = null;

    render()
    {
        const {
            className,
            style
        } = this.props;

        const children = this.onRenderContent ? this.onRenderContent() : null;

        return (
            <div
                className={className}
                style={style}>
                {children}
            </div>
        );
    }
}
