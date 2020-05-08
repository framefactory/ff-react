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

/** Properties for [[FlexItem]] component. */
export interface IFlexItemProps extends IComponentProps
{
    /** If given, receives a reference to the wrapper div element when mounted. */
    elementRef?: React.RefObject<HTMLDivElement>;
    /** How much this item is allowed to grow in a flex layout. Default is 1. */
    grow?: number;
    /** How much this item is allowed to shrink in a flex layout. Default is 1. */
    shrink?: number;
    /** The initial size of this item. Default is "auto". */
    basis?: number | "auto";
}

/**
 * Wraps its children in a div element. Flex layout settings grow, shrink
 * and basis are exposed as component properties. See also [[FlexContainer]].
 * This is a React stateless functional component.
 * @param {IFlexItemProps & {children?: React.ReactNode}} props
 * @returns {React.SFC<IFlexItemProps>}
 * @constructor
 */
const FlexItem: React.FunctionComponent = function(props: React.PropsWithChildren<IFlexItemProps>)
{
    const {
        className,
        style,
        elementRef,
        grow,
        shrink,
        basis,
        children
    } = props;

    const defaultStyle: React.CSSProperties = {
        boxSizing: "border-box",
        position: "relative",
        flex: `${grow} ${shrink} ${basis}`
    };

    const styles = Object.assign({}, defaultStyle, style);

    return (<div
        className={className}
        style={styles}
        ref={elementRef}>

        {children}
    </div>);
};

FlexItem.defaultProps = {
    className: "ff-flex-item",
    grow: 1,
    shrink: 1,
    basis: "auto"
};

export default FlexItem;
