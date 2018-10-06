/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[Badge]] component. */
export interface IBadgeProps
{
    className?: string;
    style?: CSSProperties;
    info?: boolean;
    update?: boolean;
    warning?: boolean;
    error?: boolean;
    type?: string;
    color?: string;
    text?: string;
}

const Badge: React.SFC<IBadgeProps> = function(props)
{
    let {
        className,
        style,
        info,
        update,
        warning,
        error,
        type,
        color,
        text,
        children
    } = props;

    if (color) {
       style = Object.assign({}, { backgroundColor: color }, style);
    }

    if (error || type === "error") {
        className += " error";
    }
    else if (warning || type === "warning") {
        className += " warning";
    }
    else if (update || type === "update") {
        className += " update";
    }
    else if (info || type === "info") {
        className += " info";
    }
    else if (type) {
        className += " " + type;
    }

    return(<span
        className={className}
        style={style}>
        {text}
        {children}
    </span>);
};

Badge.defaultProps = {
    className: "badge"
};

export default Badge;