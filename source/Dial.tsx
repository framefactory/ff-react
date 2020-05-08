/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { jsx } from "@emotion/core";

import Draggable, { PointerEvent } from "./Draggable";
import Color from "@ff/core/Color";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[Dial]] component. */
export interface IDialProps
{
    className?: string;
    size?: string;
    thickness?: string | number;
    fontSize?: string | number;
    ghost?: boolean;
    type?: "rotary" | "gauge";
    meter?: "left" | "center" | "right"
    overflow?: "limit" | "wrap" | "infinite"
    min?: number
    max?: number
    step?: number
    precision?: number
    percent?: boolean
    value?: number,
    onChange?: (value: number, isDragging: boolean) => void
}

export default class Dial extends React.Component<IDialProps, any>
{
    protected static defaultProps: IDialProps = {
        className: "ff-dial",
        size: "200px",
        thickness: "25%",
        ghost: false,
        type: "rotary",
        meter: "right",
        overflow: "limit",
        min: 0,
        max: 1,
        step: 0.01,
        precision: 2,
        percent: false,
        value: 0
    };

    private bgColor: Color;
    private fgColor: Color;
    private bgActiveColor: Color;
    private fgActiveColor: Color;

    private isDragging: boolean;
    private startValue: number;
    private fraction: number;
    private revolutions: number;

    private canvasElement: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;

    constructor(props: IDialProps)
    {
        super(props);

        this.state = {
            value: props.value
        };

        this.canvasElement = null;
        this.canvasContext = null;

        this.onRef = this.onRef.bind(this);
        this.onRefWheel = this.onRefWheel.bind(this);
        this.onDragBegin = this.onDragBegin.bind(this);
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    setValue(value: number)
    {
        const props = this.props;

        value = Math.round(value / props.step) * props.step;
        value = value < props.min ? props.min : (value > props.max ? props.max : value);

        this.setState({ value });

        if (this.props.onChange) {
            this.props.onChange(value, this.isDragging);
        }

    }

    componentDidMount()
    {
        this.redraw();
    }

    componentDidUpdate()
    {
        this.redraw();
    }

    render()
    {
        const props = this.props;

        let style: React.CSSProperties = {
            position: "relative",
            width: props.size
        };

        let canvasStyle: React.CSSProperties = {
            display: "block"
        };

        let labelStyle: React.CSSProperties = {
            display: "block",
            position: "absolute",
            top: props.type === "gauge" ? "-3%" : 0,
            left: 0, right: 0, bottom: 0,
            textAlign: "center",
            lineHeight: props.size
        };

        if (props.fontSize) {
            labelStyle.fontSize = props.fontSize.toString();
        }

        let value = this.state.value;
        let text = props.percent
            ? (value * 100).toFixed(props.precision) + "%"
            : value.toFixed(props.precision);

        return (<div
            className={props.className}
            style={style}>

            <Draggable
                onDragBegin={this.onDragBegin}
                onDragMove={this.onDragMove}
                onDragEnd={this.onDragEnd} >

                <canvas
                    ref={this.onRef}
                    style={canvasStyle}
                    width={props.size}
                    height={props.size} />

                <label
                    className="ff-label"
                    style={labelStyle}>

                    {text}
                </label>
                <div
                    ref={this.onRefWheel}
                    className="ff-wheel"
                    style={{display: "none"}} />
            </Draggable>
        </div>);
    }

    private onRef(element: HTMLCanvasElement)
    {
        this.canvasElement = element;
        this.canvasContext = element ? element.getContext("2d") : null;
    }

    private onRefWheel(element: HTMLDivElement)
    {
        if (element) {
            // calculate colors
            const computedStyle = window.getComputedStyle(element);
            this.bgColor = new Color(computedStyle.backgroundColor);
            this.fgColor = new Color(computedStyle.color);

            if (this.props.ghost) {
                this.bgActiveColor = this.bgColor.clone().inverseMultiply(0.1).setAlpha(0.8);
                this.fgActiveColor = this.fgColor.clone().setAlpha(0.8);
            }
        }
    }

    private onDragBegin(event: PointerEvent)
    {
        this.startValue = this.state.value;
        this.revolutions = 0;
        this.fraction = this.angleToFraction(this.getAngle(event), false);
        this.isDragging = true;
    }

    private onDragMove(event: PointerEvent)
    {
        let props = this.props;
        let fraction = this.angleToFraction(this.getAngle(event), true);
        this.setValue(fraction  * (props.max - props.min) + props.min);
    }

    private onDragEnd(event: PointerEvent)
    {
        this.isDragging = false;

        let props = this.props;
        let fraction = this.angleToFraction(this.getAngle(event), true);
        this.setValue(fraction  * (props.max - props.min) + props.min);
    }

    redraw()
    {
        let props = this.props;
        let canvas = this.canvasElement;
        let context = this.canvasContext;

        const size = canvas.width;
        const halfSize = size * 0.5;

        let thickness = props.thickness;
        let ringSize = size * 0.2;

        if (typeof thickness === "number") {
            ringSize = props.thickness as number;
        }
        else if (typeof thickness === "string"
            && thickness.endsWith("%")) {
            ringSize = Number.parseFloat(thickness) * size * 0.5 * 0.01;
        }
        else {
            ringSize = Number.parseFloat(thickness);
        }

        context.clearRect(0, 0, size, size);

        let drawGhost = props.ghost && this.isDragging;
        let value = drawGhost ? this.startValue : this.state.value;

        let angleZero = this.valueToAngle(props.min);
        let angleOne = this.valueToAngle(props.max);
        let angleValue = this.valueToAngle(value);

        this.drawSegment(this.bgColor.toString(), halfSize, ringSize, angleValue, angleOne);
        this.drawSegment(this.fgColor.toString(), halfSize, ringSize, angleZero, angleValue);

        // ring drag overlay
        if (drawGhost) {
            angleValue = this.valueToAngle(this.state.value);
            this.drawSegment(this.bgActiveColor.toString(), halfSize, ringSize, angleValue, angleOne);
            this.drawSegment(this.fgActiveColor.toString(), halfSize, ringSize, angleZero, angleValue);
        }
    }

    private drawSegment(color: string, radius: number, ringSize: number, startAngle: number, endAngle: number)
    {
        let context = this.canvasContext;

        context.fillStyle = color;
        context.beginPath();
        context.arc(radius, radius, radius, startAngle, endAngle, false);
        context.arc(radius, radius, radius - ringSize, endAngle, startAngle, true);
        context.fill();
    }

    private getAngle(event: PointerEvent)
    {
        let rect = this.canvasElement.getBoundingClientRect();
        let x = event.clientX - (rect.left + rect.right) * 0.5;
        let y = event.clientY - (rect.top + rect.bottom) * 0.5;

        return Math.atan2(y, x);
    }

    private angleToFraction(angle: number, update: boolean = true)
    {
        let props = this.props;
        let isGauge = props.type === "gauge";

        let fraction = angle / Math.PI * 0.5;
        fraction = fraction + (isGauge ? -0.25 : 0.25);
        fraction = (fraction < 0 ? fraction + 1 : fraction);

        let prevFraction = this.fraction;
        this.fraction = fraction;

        if (update) {
            if (prevFraction > 0.75 && fraction < 0.25) {
                this.revolutions++;
            }
            else if (prevFraction < 0.25 && fraction > 0.75) {
                this.revolutions--;
            }

            if (props.overflow !== "wrap" || isGauge) {
                fraction += this.revolutions;
            }
        }

        if (isGauge) {
            fraction = (fraction - 0.125) / 0.75;
        }

        return fraction < 0 ? 0 : (fraction > 1 ? 1 : fraction);
    }

    private valueToAngle(value)
    {
        let doublePi = Math.PI * 2;
        let props = this.props;

        value = (value - props.min) / (props.max - props.min);

        if (props.type === "gauge") {
            return (value * 0.75 - 0.625) * doublePi;
        }
        else {
            return (value - 0.25) * doublePi;
        }
    }
}
