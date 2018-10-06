/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import Button, { IButtonTapEvent } from "./Button";

////////////////////////////////////////////////////////////////////////////////

export interface IExpandableHeaderTapEvent extends IButtonTapEvent { }

export interface IExpandableHeaderProps
{
    id?: string;
    className?: string;
    style?: CSSProperties;
    onTap?: (event: IExpandableHeaderTapEvent) => void;
}

export class ExpandableHeader extends React.Component<IExpandableHeaderProps, {}>
{
    static defaultProps: IExpandableHeaderProps = {
        className: "expandable-title"
    };

    render()
    {
        const {
            id,
            className,
            style,
            onTap,
            children
        } = this.props;

        return(<Button
            id={id}
            className={className}
            style={style}
            onTap={onTap}>

            {children}
        </Button>);
    }
}

////////////////////////////////////////////////////////////////////////////////

export interface IExpandableContentProps
{
    className?: string;
    style?: CSSProperties;
}

export class ExpandableContent extends React.Component<IExpandableContentProps, {}>
{
    static defaultProps: IExpandableContentProps = {
        className: "expandable-content"
    };

    render()
    {
        const {
            className,
            style,
            children
        } = this.props;

        return(<div
            className={className}
            style={style}>

            {children}
        </div>);
    }
}

////////////////////////////////////////////////////////////////////////////////

export interface IExpandableProps
{
    className?: string;
    style?: CSSProperties;
}

export default class Expandable extends React.Component<IExpandableProps, {}>
{
    static defaultProps: IExpandableProps = {
        className: "expandable"
    };

    private static style: CSSProperties = {
    };

    constructor(props: IExpandableProps)
    {
        super(props);
    }

    render()
    {
        const {
            className,
            style,
            children
        } = this.props;

        const stylesCombined = Object.assign({}, Expandable.style, style);

        return (<div
            className={className}
            style={stylesCombined} >

            {children}
        </div>);
    }
}