/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[BusyBox]] component. */
export interface IBusyBoxProps
{
    className?: string;
    style?: CSSProperties;
    text?: string;
}

const BusyBox: React.SFC<IBusyBoxProps> = function(props)
{
    const {
        className,
        style,
        text
    } = props;

    return (<div
        className={className}
        style={style}>

        <div className="wheel fa fas fa-spinner" />

        <div className="text">
            {text}
        </div>
    </div>);
};

BusyBox.defaultProps = {
    className: "busy-box"
};

export default BusyBox;