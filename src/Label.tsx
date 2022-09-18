/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import { IComponentProps } from "./common";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[Label]] component. */
export interface ILabelProps extends IComponentProps
{
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
    className: "ff-control ff-label"
};

export default Label;