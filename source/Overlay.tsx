/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import * as ReactDOM from "react-dom";

import { CSSProperties } from "react";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[Overlay]] component. */
export interface IOverlayProps
{
    className?: string;
    style?: CSSProperties;
    modal?: boolean;
    zIndex?: number;
}

export default class Overlay extends React.Component<IOverlayProps, {}>
{
    static defaultProps: Partial<IOverlayProps> = {
        className: "overlay",
        zIndex: 1000
    };

    static style: CSSProperties = {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    protected element: HTMLDivElement;

    constructor(props)
    {
        super(props);

        this.element = document.createElement("div");
    }

    componentDidMount()
    {
        document.body.appendChild(this.element);
    }

    componentWillUnmount()
    {
        document.body.removeChild(this.element);
    }

    render()
    {
        const {
            className,
            style,
            zIndex,
            children
        } = this.props;

        const styles = Object.assign({}, Overlay.style, style);

        if (zIndex !== undefined) {
            styles.zIndex = zIndex;
        }

        return ReactDOM.createPortal(
            <div
                className={className}
                style={styles}>

                {children}
            </div>,
            this.element
        );
    }
}
