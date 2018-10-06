/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import FlexItem from "./FlexItem";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[TabContentContainer]] component. */
export interface ITabContentContainerProps
{
    id?: string;
    className?: string;
    style?: CSSProperties;
}

export class TabContentContainer extends React.Component<ITabContentContainerProps, {}>
{
    static defaultProps: ITabContentContainerProps = {
        className: "tab-content-container"
    };

    render()
    {
        const {
            className,
            style,
            children
        } = this.props;

        return (<FlexItem
            className={className}
            style={style}>

            {children}
        </FlexItem>);
    }
}

/** Properties for [[TabContentItem]] component. */
export interface ITabContentItemProps
{
    id?: string;
    className?: string;
    style?: CSSProperties;
    active?: boolean;
}

export class TabContentItem extends React.Component<ITabContentItemProps, {}>
{
    static readonly defaultProps: Partial<ITabContentItemProps> = {
        className: "tab-content-item"
    };

    protected static readonly style: CSSProperties = {
        position: "absolute",
        left: 0, top: 0, right: 0, bottom: 0,
        display: "initial",
        overflow: "hidden"
    };

    render()
    {
        const {
            className,
            style,
            active,
            children
        } = this.props;

        const styles = Object.assign({}, TabContentItem.style, style, { display: active ? "initial" : "none" });

        return(<div
            className={className}
            style={styles}>

            {children}
        </div>)
    }
}
