/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[TitleBar]] component. */
export interface ITitleBarProps
{
    className?: string;
    text?: string;
}

export default class TitleBar extends React.Component<ITitleBarProps, any>
{
    constructor(props: ITitleBarProps)
    {
        super(props);
    }

    static defaultProps: ITitleBarProps = {
        className: "ff-title-bar",
        text: "Title Bar"
    };

    render()
    {
        const {
            className,
            text,
            children,
        } = this.props;

        let barStyle: CSSProperties = {
        };

        let textStyle: CSSProperties = {
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
        };

        let buttonsStyle: CSSProperties = {
            float: "right",
            whiteSpace: "nowrap",
            overflow: "hidden"
        };

        return (<div className={className} style={barStyle}>
            <div className="ff-buttons" style={buttonsStyle}>{this.props.children}</div>
            <div className="ff-text" style={textStyle}>{this.props.text}</div>
        </div>);
    }
}