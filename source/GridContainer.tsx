/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import { IComponentProps } from "./common";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[GridContainer]] component. */
export interface IGridContainerProps extends IComponentProps
{
    /** How the container is positioned with respect to its parent. Default is "relative". */
    position?: string;
    /** Defines the columns in the grid with a space-separated list of values.  */
    columns?: string;
    /** Defines the rows in the grid with a space-separated list of values.  */
    rows?: string;
    /** Size of additional, auto-created columns.  */
    autoColumns?: string | number;
    /** Size of additional, auto-created rows. */
    autoRows?: string | number;
    /** Size of the gap between columns. */
    columnGap?: string | number;
    /** Size of the gap between rows. */
    rowGap?: string | number;
    /** How items are laid out horizontally. */
    justifyItems?: "start" | "end" | "center" | "stretch";
    /** How items are laid out vertically. */
    alignItems?: "start" | "end" | "center" | "stretch";
    /** How the entire grid content is laid out horizontally. */
    justifyContent?: "start" | "end" | "center" | "stretch" | "space-around" | "space-between" | "space-evenly";
    /** How the entire grid content is laid out vertically. */
    alignContent?: "start" | "end" | "center" | "stretch" | "space-around" | "space-between" | "space-evenly";
}

const _defaultStyle: CSSProperties = {
    boxSizing: "border-box",
    display: "grid"
};

const _interpretSize = function(value: string | number): string
{
    if (typeof value === "number") {
        return value <= 1.0 ? (value * 100).toString() + "%" : value.toString() + "px";
    }

    return value;
};

/**
 * Component applying a grid layout to its children by wrapping them in a div element.
 * This is a React stateless functional component.
 * @param {IGridContainerProps & {children?: React.ReactNode}} props
 * @returns {React.SFC<IGridContainerProps>}
 * @constructor
 */
const GridContainer: React.SFC<IGridContainerProps> = function(props)
{
    const {
        className,
        style,
        position,
        columns,
        rows,
        autoColumns,
        autoRows,
        columnGap,
        rowGap,
        justifyItems,
        alignItems,
        justifyContent,
        alignContent,
        children
    } = props;

    const styles = Object.assign({}, _defaultStyle, style);

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
            break;

        case "absolute":
            styles.position = "absolute";
            break;
    }

    if (columns) {
        styles.gridTemplateColumns = columns;
    }
    if (rows) {
        styles.gridTemplateRows = rows;
    }
    if (autoColumns) {
        styles.gridAutoColumns = _interpretSize(autoColumns);
    }
    if (autoRows) {
        styles.gridAutoRows = _interpretSize(autoRows);
    }
    if (columnGap) {
        styles.gridColumnGap = _interpretSize(columnGap);
    }
    if (rowGap) {
        styles.gridRowGap = _interpretSize(rowGap);
    }
    if (justifyItems) {
        styles.justifyItems = justifyItems;
    }
    if (alignItems) {
        styles.alignItems = alignItems;
    }
    if (justifyContent) {
        styles.justifyContent = justifyContent;
    }
    if (alignContent) {
        styles.alignContent = alignContent;
    }

    return (<div
        className={className}
        style={styles}>
        {children}
    </div>);
};

GridContainer.defaultProps = {
    className: "grid-container"
};

export default GridContainer;