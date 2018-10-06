/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[Label]] component. */
export interface ILabelProps
{
    className?: string;
    style?: CSSProperties;
    text?: string;
}

const _defaultStyle: CSSProperties = {
    flexShrink: 0,
    flexGrow: 0
};

const Label: React.SFC<ILabelProps> = function(props)
{
    const {
        className,
        style,
        text,
        children
    } = props;

    const styles = Object.assign({}, _defaultStyle, style);

    return (<label
        className={className}
        style={styles}>
        {text}
        {children}
    </label>);
};

Label.defaultProps = {
    className: "control label"
};

export default Label;