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

/** Properties for [[Label]] component. */
export interface ILabelProps extends IComponentProps
{
    text?: string;
}

const _defaultStyle: React.CSSProperties = {
    flexShrink: 0,
    flexGrow: 0
};

const Label: React.FunctionComponent = function(props: React.PropsWithChildren<ILabelProps>)
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
