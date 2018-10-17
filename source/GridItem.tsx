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

/** Properties for [[GridItem]] component. */
export interface IGridItemProps extends IComponentProps
{
    elementRef?: React.RefObject<HTMLDivElement>;
    column?: number;
    row?: number;
    columnSpan?: number;
    rowSpan?: number;
    justify?: "start" | "end" | "center" | "stretch";
    align?: "start" | "end" | "center" | "stretch";
}

const _defaultStyle: CSSProperties = {
    boxSizing: "border-box"
};

/**
 * Wraps its children in a div element. Grid layout settings column, row,
 * columnSpan, rowSpan, justify and align are exposed as component properties. See also [[GridContainer]].
 * This is a React stateless functional component.
 * @param {IGridItemProps & {children?: React.ReactNode}} props
 * @returns {React.SFC<IGridItemProps>}
 * @constructor
 */
const GridItem: React.SFC<IGridItemProps> = function(props)
{
    const {
        className,
        style,
        elementRef,
        column,
        row,
        columnSpan,
        rowSpan,
        justify,
        align,
        children
    } = props;

    const styles = Object.assign({}, _defaultStyle, style);

    if (column) {
        styles.gridColumnStart = column;
    }
    if (row) {
        styles.gridRowStart = row;
    }
    if (columnSpan) {
        styles.gridColumnEnd = `span ${columnSpan}`;
    }
    if (rowSpan) {
        styles.gridRowEnd = `span ${rowSpan}`;
    }
    if (justify) {
        styles.justifySelf = justify;
    }
    if (align) {
        styles.alignSelf = align;
    }

    return (<div
        className={className}
        style={styles}
        ref={elementRef}>

        {children}
    </div>);
};

GridItem.defaultProps = {
    className: "grid-item"
};

export default GridItem;

