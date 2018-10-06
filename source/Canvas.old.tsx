/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import { IComponentEvent } from "./common";

////////////////////////////////////////////////////////////////////////////////

/** Sent after the canvas has been resized */
export interface ICanvasResizeEvent extends IComponentEvent<Canvas> { width: number; height: number; resolution: number; }
/** Sent when the context for the canvas can be created. */
export interface ICanvasCreateContextEvent extends IComponentEvent<Canvas> { }
/** Sent when the context for the canvas becomes invalid. */
export interface ICanvasDestroyContextEvent extends IComponentEvent<Canvas> { }

export interface ICanvasPainter
{
    resize: (width: number, height: number, resolution: number) => void;
    createContext: (canvas: Canvas) => void;
    destroyContext: (canvas: Canvas) => void;
}

export interface ICanvasProps
{
    id?: string;
    className?: string;
    style?: CSSProperties;
    resolution?: number;
    onResize?: (event: ICanvasResizeEvent) => void;
    onCreateContext?: (event: ICanvasCreateContextEvent) => void;
    onDestroyContext?: (event: ICanvasDestroyContextEvent) => void;
    painter?: ICanvasPainter;
}

/**
 * Component wrapping a HTML Canvas Element. Provides callbacks for creating/destroying the drawing context,
 * resizing and redrawing. Wraps the canvas in a div element for easier placement.
 */
export default class Canvas extends React.Component<ICanvasProps, {}>
{
    static defaultProps: Partial<ICanvasProps> = {
        className: "canvas",
        resolution: 1
    };

    private static canvasStyle: CSSProperties = {
        display: "block",
        width: "100%",
        height: "100%"
    };

    private static fullsizeStyle: CSSProperties = {
        position: "absolute",
        top: 0, right: 0, bottom: 0, left: 0
    };

    width: number;
    height: number;

    protected canvasRef: React.RefObject<HTMLCanvasElement>;
    protected canvasContext: any;

    constructor(props: ICanvasProps)
    {
        super(props);

        this.canvasRef = React.createRef();
        this.canvasContext = null;

        this.resize = this.resize.bind(this);
    }

    get element(): HTMLCanvasElement
    {
        return this.canvasRef.current;
    }

    createContext2d(attribs?: any /* Canvas2DContextAttributes */): CanvasRenderingContext2D
    {
        const canvasElement = this.canvasRef.current;
        if (canvasElement && !this.canvasContext) {
            return this.canvasContext = canvasElement.getContext("2d", attribs);
        }
    }

    createContext3d(attribs?: WebGLContextAttributes): WebGLRenderingContext
    {
        const canvasElement = this.canvasRef.current;
        if (canvasElement && !this.canvasContext) {
            return this.canvasContext = canvasElement.getContext("webgl", attribs);
        }
    }

    componentDidUpdate()
    {
        this.resize();
    }

    componentDidMount()
    {
        const props = this.props;

        if (props.painter) {
            props.painter.createContext(this);
        }
        else if (props.onCreateContext) {
            props.onCreateContext({ id: this.props.id, sender: this });
        }

        this.resize();
        window.addEventListener("resize", this.resize);
    }

    componentWillUnmount()
    {
        const props = this.props;

        if (props.painter) {
            props.painter.destroyContext(this);
        }
        else if (props.onDestroyContext) {
            props.onDestroyContext({ id: this.props.id, sender: this })
        }

        window.removeEventListener("resize", this.resize);
    }

    render()
    {
        const style = Object.assign({}, Canvas.fullsizeStyle, this.props.style);

        return (<div
            className={this.props.className}
            style={style} >

            <canvas
                style={Canvas.canvasStyle}
                ref={this.canvasRef} />

        </div>);
    }

    resize()
    {
        const canvasElement = this.canvasRef.current;

        if (!canvasElement) {
            return;
        }

        const resolution = this.props.resolution;
        const width = canvasElement.width = canvasElement.offsetWidth * resolution;
        const height = canvasElement.height = canvasElement.offsetHeight * resolution;

        const props = this.props;

        if (props.painter) {
            props.painter.resize(width, height, resolution);
        }
        else if (props.onResize) {
            props.onResize({ width, height, resolution, id: this.props.id, sender: this });
        }
    }
}
