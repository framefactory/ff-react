/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { jsx } from "@emotion/core";

import FlexItem from "./FlexItem";
import { IComponentProps } from "./common";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[TabContentContainer]] component. */
export interface ITabContentContainerProps extends IComponentProps { }

export class TabContentContainer extends React.Component<ITabContentContainerProps, {}>
{
    static defaultProps: ITabContentContainerProps = {
        className: "ff-tab-content-container"
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
export interface ITabContentItemProps extends IComponentProps
{
    active?: boolean;
}

export class TabContentItem extends React.Component<ITabContentItemProps, {}>
{
    static readonly defaultProps: Partial<ITabContentItemProps> = {
        className: "ff-tab-content-item"
    };

    protected static readonly style: React.CSSProperties = {
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
