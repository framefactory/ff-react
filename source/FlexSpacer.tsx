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

/** Properties for [[FlexSpacer]] component. */
export interface IFlexSpacerProps extends IComponentProps
{
    grow?: number;
    shrink?: number;
    basis?: string;
}

const FlexSpacer: React.FunctionComponent = function(props: React.PropsWithChildren<IFlexSpacerProps>)
{
    const {
        className,
        style,
        grow,
        shrink,
        basis
    } = props;

    const defaultStyle: React.CSSProperties = {
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
