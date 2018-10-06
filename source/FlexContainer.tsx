/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[FlexContainer]] component. */
export interface IFlexContainerProps
{
    /** Class name for the container div element. Default is "flex-container". */
    className?: string;
    /** CSS style properties for the container div element. */
    style?: CSSProperties;
    /** Direction of the flex layout. */
    direction?: "horizontal" | "vertical";
    /** How the container is positioned with respect to its parent. Default is "relative". */
    position?: "relative" | "absolute" | "fill";
    /** How the container's content is laid out along the layout direction. */
    justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
    /** How the container's content is laid out across the layout direction. */
    alignContent?: "stretch" | "center" | "flex-start" | "flex-end";
    /** How the container's items are laid out along the layout direction. */
    alignItems?: "stretch" | "center" | "flex-start" | "flex-end";
    /** Whether overflowing items should be wrapped. */
    wrap?: "nowrap" | "wrap" | "wrap-reverse";
    /** If the container itself is an item in a parent flex layout, this sets its grow property. */
    grow?: number;
    /** If the container itself is an item in a parent flex layout, this sets its shrink property. */
    shrink?: number;
    /** If the container itself is an item in a parent flex layout, this sets its basis property. */
    basis?: string;
}

const _defaultStyle: CSSProperties = {
    boxSizing: "border-box",
    display: "flex"
};

/**
 * Component applying a flex layout to its children by wrapping them in a div element.
 * This is a React stateless functional component.
 * @param {IFlexContainerProps & {children?: React.ReactNode}} props
 * @returns {React.SFC<IFlexContainerProps>}
 * @constructor
 */
const FlexContainer: React.SFC<IFlexContainerProps> = function(props)
{
    const {
        className,
        style,
        direction,
        position,
        justifyContent,
        alignContent,
        alignItems,
        wrap,
        grow,
        shrink,
        basis,
        children
    } = props;

    const classes = className + " " + direction;

    const styles = Object.assign({}, _defaultStyle, style);

    styles.flexDirection = direction === "vertical" ? "column" : "row";

    if (justifyContent) {
        styles.justifyContent = justifyContent;
    }
    if (alignContent) {
        styles.alignContent = alignContent;
    }
    if (alignItems) {
        styles.alignItems = alignItems;
    }
    if (wrap) {
        styles.flexWrap = wrap;
    }

    switch(position) {
        case "fill":
            styles.position = "absolute";
            styles.top = 0;
            styles.right = 0;
            styles.bottom = 0;
            styles.left = 0;
            break;

        case "relative":
            styles.position = "relative";
            styles.flex = `${grow} ${shrink} ${basis}`;
            break;

        case "absolute":
            styles.position = "absolute";
            break;
    }

    return (<div
        className={classes}
        style={styles}>
        {children}
    </div>);
};

FlexContainer.defaultProps = {
    className: "flex-layout",
    direction: "horizontal",
    position: "relative",
    grow: 1,
    shrink: 1,
    basis: "auto"
};

export default FlexContainer;