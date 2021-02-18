/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import Button, {
    IButtonProps,
    IButtonDownEvent,
    IButtonUpEvent,
    IButtonTapEvent,
    IButtonSelectEvent
} from "./Button";

////////////////////////////////////////////////////////////////////////////////

export type ICheckboxPressEvent = IButtonDownEvent;
export type ICheckboxReleaseEvent = IButtonUpEvent;
export type ICheckboxTapEvent = IButtonTapEvent;
export type ICheckboxSelectEvent = IButtonSelectEvent;

/** Properties for [[Checkbox]] component */
export interface CheckboxProps extends IButtonProps
{
    shape?: "square" | "circle";
}

/**
 * Checkbox component, based on the [[Button]] component. Works with mouse and touch input.
 * Use the shape property to style the Checkbox as square box or circular radio button.
 * Provides a text label and support for custom and Font Awesome icons.
 */
export default class Checkbox extends Button<CheckboxProps>
{
    static defaultProps: CheckboxProps = {
        className: "ff-control ff-checkbox",
        selectable: true,
        shape: "square"
    };

    static labelStyle: CSSProperties = {
        touchAction: "none",
        userSelect: "none",
        cursor: "pointer",
        position: "relative",
        boxSizing: "border-box",
        paddingLeft: "1.65em",
        //lineHeight: "1.3em"
    };

    static squareFrameStyle: CSSProperties = {
        position: "absolute",
        top: "0.1em",
        left: "0",
        height: "1.3em",
        width: "1.3em",
        boxSizing: "border-box",
        borderStyle: "solid",
        borderWidth: "1px"
    };

    static squareMarkStyle: CSSProperties = {
        position: "absolute",
        top: "0.2em",
        left: "0.4em",
        width: "0.3em",
        height: "0.6em",
        borderStyle: "solid",
        borderWidth: "0 0.2em 0.2em 0",
        transform: "rotate(45deg)"
    };

    static circleFrameStyle: CSSProperties = {
        position: "absolute",
        top: "0.1em",
        left: "0",
        height: "1.3em",
        width: "1.3em",
        boxSizing: "border-box",
        borderStyle: "solid",
        borderWidth: "2px",
        borderRadius: "2em"
    };

    static circleMarkStyle: CSSProperties = {
        position: "absolute",
        top: "0",
        left: "0",
        width: "0",
        height: "0"
    };

    render()
    {
        const {
            className,
            style,
            text,
            icon,
            faIcon,
            image,
            title,
            shape,
            children
        } = this.props as any;

        const selectedClass = this.state.selected ? " ff-selected" : "";
        const checkboxClasses = className + " " + shape + selectedClass;
        const frameClasses = "ff-frame" + selectedClass;
        const labelStyle = Object.assign({}, Checkbox.labelStyle, style);
        const frameStyle = shape === "square" ? Checkbox.squareFrameStyle : Checkbox.circleFrameStyle;
        const markStyle = shape === "square" ? Checkbox.squareMarkStyle : Checkbox.circleMarkStyle;
        const contentStyle = Button.contentStyle;

        const props = {
            className: checkboxClasses,
            style: labelStyle,
            title: title,
            tabIndex: 0,
            "touch-action": "none",
            onPointerDown: this.onPointerDown,
            onPointerUp: this.onPointerUp,
            onPointerCancel: this.onPointerCancel,
            onKeyUp: this.onKeyUp
        };

        return (
            <div
                {...props} >

                {icon ? <span className={"ff-content ff-icon " + icon} style={contentStyle} /> : null}
                {faIcon ? <span className={"ff-content ff-icon fa fa-" + faIcon} style={contentStyle} /> : null}
                {image ? <img className="ff-content ff-image" src={image} style={contentStyle} /> : null}
                {text ? <span className="ff-content ff-text" style={contentStyle}>{text}</span> : null}
                {children}
                <div className={frameClasses} style={frameStyle} />
                {this.state.selected ? <div className="ff-mark" style={markStyle} /> : null}
            </div>);
    }
}