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
    text?: string;
}

export default class TitleBar extends React.Component<ITitleBarProps, any>
{
    constructor(props: ITitleBarProps)
    {
        super(props);
    }

    static defaultProps: ITitleBarProps = {
        text: "Title Bar"
    };

    render()
    {
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

        return (<div className="title-bar" style={barStyle}>
            <div className="buttons" style={buttonsStyle}>{this.props.children}</div>
            <div className="text" style={textStyle}>{this.props.text}</div>
        </div>);
    }
}