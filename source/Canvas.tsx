/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { jsx } from "@emotion/core";

import { IComponentEvent, IComponentProps } from "./common";

////////////////////////////////////////////////////////////////////////////////

/**
 * Fired after canvas is mounted and before canvas is unmounted.
 * After mounting, the canvas property contains the HTML canvas element.
 * Before unmounting, the canvas property is null.
 */
export interface ICanvasEvent extends IComponentEvent<Canvas>
{
    /** The HTML canvas element or null if the component is about to unmount. */
    canvas: HTMLCanvasElement | null;
}

/**
 * Fired after canvas (i.e. the browser window) is resized.
 * Contains the new width and height of the HTML canvas element.
 */
export interface ICanvasResizeEvent extends ICanvasEvent
{
    /** The new width of the HTML canvas element. */
    width: number;
    /** The new height of the HTML canvas element. */
    height: number;
}

/** Properties for [[Canvas]] component. */
export interface ICanvasProps extends IComponentProps
{
    /** @event onCanvas */
    onCanvas?: (event: ICanvasEvent) => void;
    /** @event onResize */
    onResize?: (event: ICanvasResizeEvent) => void;
}

/**
 * Wraps a properly scaled HTML canvas element. Generates events
 * when canvas is mounted, unmounted, or resized.
 */
export default class Canvas extends React.Component<ICanvasProps, {}>
{
    static readonly defaultProps: Partial<ICanvasProps> = {
        className: "ff-canvas"
    };

    protected static readonly style: React.CSSProperties = {
        display: "block",
        width: "100%",
        height: "100%"
    };

    protected canvas: HTMLCanvasElement;

    constructor(props: ICanvasProps)
    {
        super(props);

        this.onRef = this.onRef.bind(this);
        this.onResize = this.onResize.bind(this);

        this.canvas = null;
    }

    render()
    {
        const {
            className,
            style,
        } = this.props;

        return (
            <div
                className={className}
                style={style}>

                <canvas
                    style={Canvas.style}
                    ref={this.onRef} />

            </div>
        );
    }

    protected onRef(canvas: HTMLCanvasElement)
    {
        this.canvas = canvas;

        if (canvas) {
            window.addEventListener("resize", this.onResize);
        }
        else {
            window.removeEventListener("resize", this.onResize);
        }

        const { id, index, onCanvas } = this.props;

        if (onCanvas) {
            onCanvas({ canvas, id, index, sender: this });
        }

        this.onResize();
    }

    protected onResize()
    {
        const canvas = this.canvas;

        if (!canvas) {
            return;
        }

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        const { id, index, onResize } = this.props;

        if (onResize) {
            onResize({ canvas, width, height, id, index, sender: this });
        }
    }
}
