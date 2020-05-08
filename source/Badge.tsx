/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { jsx } from "@emotion/core";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[Badge]] component. */
export interface IBadgeProps
{
    className?: string;
    style?: React.CSSProperties;
    info?: boolean;
    update?: boolean;
    warning?: boolean;
    error?: boolean;
    type?: string;
    color?: string;
    text?: string;
}

const Badge: React.FunctionComponent = function(props: React.PropsWithChildren<IBadgeProps>)
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
        className += " ff-error";
    }
    else if (warning || type === "warning") {
        className += " ff-warning";
    }
    else if (update || type === "update") {
        className += " ff-update";
    }
    else if (info || type === "info") {
        className += " ff-info";
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
    className: "ff-badge"
};

export default Badge;
