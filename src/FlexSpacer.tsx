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

/** Properties for [[FlexSpacer]] component. */
export interface IFlexSpacerProps extends IComponentProps
{
    grow?: number;
    shrink?: number;
    basis?: string;
}

const FlexSpacer: React.SFC<IFlexSpacerProps> = function(props)
{
    const {
        className,
        style,
        grow,
        shrink,
        basis
    } = props;

    const defaultStyle: CSSProperties = {
        flex: `${grow} ${shrink} ${basis}`
    };

    const styles = Object.assign({}, defaultStyle, style);

    return (<div
        className={className}
        style={styles}
    />);
};

FlexSpacer.defaultProps = {
    className: "ff-flex-spacer",
    grow: 1,
    shrink: 0,
    basis: "auto"
};

export default FlexSpacer;