/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import { IComponentEvent, IComponentProps } from "./common";
import Draggable, { PointerEvent } from "./Draggable";

////////////////////////////////////////////////////////////////////////////////

export interface IPropertyFieldFormat
{
    type: string,
    preset?: any,
    min?: number,
    max?: number,
    step?: number,
    precision?: number,
    bar?: boolean,
    percent?: boolean
}

export interface IPropertyFieldChangeEvent extends IComponentEvent<PropertyField> { value: number | string | boolean }
export interface IPropertyFieldCommitEvent extends IComponentEvent<PropertyField> { value: number | string | boolean }

/** Properties for [[PropertyField]] component. */
export interface IPropertyFieldProps extends IComponentProps
{
    value?: any;
    format?: IPropertyFieldFormat;
    onChange?: (event: IPropertyFieldChangeEvent) => void;
    onCommit?: (event: IPropertyFieldCommitEvent) => void;
}

export interface IPropertyFieldState
{
    value: any;
    format: IPropertyFieldFormat;
    isDragging: boolean;
    isEditing: boolean;
}

export default class PropertyField extends React.Component<IPropertyFieldProps, IPropertyFieldState>
{
    static defaultProps: IPropertyFieldProps = {
        className: "control property-field"
    };

    static textStyle: CSSProperties = {
        pointerEvents: "none",
        userSelect: "none",
        display: "block"
    };

    static Float: IPropertyFieldFormat = {
        type: "number",
        preset: 0,
        step: 0.01,
        precision: 3
    };

    static Integer: IPropertyFieldFormat = {
        type: "number",
        preset: 0,
        step: 0.1,
        precision: 0
    };

    static String: IPropertyFieldFormat = {
        type: "string",
        preset: "",
    };

    static Color: IPropertyFieldFormat = {
        type: "color",
        preset: [ 0, 0, 0 ]
    };

    inputElement: HTMLInputElement;
    startValue: any;

    constructor(props: IPropertyFieldProps)
    {
        let value = props.value;
        let format = props.format;

        if (value === undefined) {
            value = format ? (format.preset || 0) : 0;
        }
        if (format === undefined) {
            format = {
                type: typeof props.value
            }
        }

        super(props);

        this.state = {
            value: value,
            format: format,
            isDragging: false,
            isEditing: false
        };

        this.inputElement = null;
        this.startValue = undefined;

        this.onTap = this.onTap.bind(this);
        this.onDragBegin = this.onDragBegin.bind(this);
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);

        this.onInputKeyDown = this.onInputKeyDown.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    render()
    {
        const {
            className,
            style
        } = this.props;

        const {
            format,
            isDragging,
            isEditing
        } = this.state;

        const classes = className + (isDragging ? " dragging" : "");

        const textStyle = PropertyField.textStyle;

        let barStyle = {
            width: `${this.getBarWidthPercent()}%`
        };

        return(
            <Draggable
                className={classes}
                style={style}
                draggable={!isEditing && format.type === "number"}
                onTap={this.onTap}
                onDragBegin={this.onDragBegin}
                onDragMove={this.onDragMove}
                onDragEnd={this.onDragEnd}>
                {format.bar ? <div className="bar" style={barStyle}/> : null}
                <label className="text align-right" style={textStyle}>{this.getFormattedValue()}</label>
                {isEditing ? <form><input
                    className="edit align-right"
                    type="text"
                    defaultValue={this.getFormattedValue()}
                    ref={el => this.setInputRef(el)}
                    onKeyDown={this.onInputKeyDown}
                    onChange={this.onInputChange}
                    onBlur={this.onBlur}
                    /></form> : null}
            </Draggable>
        );
    }

    setValue(value: any)
    {
        this.setState({ value: value });

        const { id, index, onChange, onCommit } = this.props;

        if (onChange) {
            onChange({ value, id, index, sender: this });
        }
        if (onCommit) {
            onCommit({ value, id, index, sender: this });
        }
    }

    incrementValue(delta: number)
    {

        this.setState(prevState => {
            const value = this.checkBounds(prevState.value + delta);
            const { id, index, onChange } = this.props;

            if (onChange) {
                onChange({ value, id, index, sender: this });
            }

            return { value };
        });
    }

    onDragBegin()
    {
        this.setState({ isDragging: true });
        this.startValue = this.state.value;
    }

    onDragMove(event: PointerEvent, dx: number, dy: number)
    {
        const format = this.state.format;
        const delta = Math.abs(dx) > Math.abs(dy) ? dx : -dy;

        let increment = delta * (format.step || (format.percent ? 0.002 : 0.1));
        this.incrementValue(increment);
    }

    private onDragEnd()
    {
        this.setValue(this.state.value);
        this.setState({ isDragging: false });
    }

    private onTap()
    {
        this.startEditing();
    }

    private setInputRef(element: HTMLInputElement)
    {
        this.inputElement = element;

        if (element) {
            element.focus();
            element.setSelectionRange(0, element.value.length);
        }
    }

    private onInputKeyDown(event: any)
    {
        switch(event.key) {
            case "Enter":
                this.stopEditing(true);
                break;

            case "Escape":
                this.stopEditing(false);
                break;
        }
    }

    private onBlur()
    {
        this.stopEditing(true);
    }

    private onInputChange()
    {
    }

    private startEditing()
    {
        this.setState({ isEditing: true });
    }

    private stopEditing(readValue: boolean)
    {
        this.setState({ isEditing: false });

        if (readValue) {
            const format = this.state.format;
            const text = this.inputElement.value;

            let value;

            switch (format.type) {
                case "number":
                    value = parseFloat(text);
                    if (isNaN(value)) {
                        return;
                    }

                    value = this.checkBounds(value);
                    break;

                case "string":
                    value = text;
            }

            this.setValue(value);
        }
    }

    private checkBounds(value: number) : number
    {
        const format = this.state.format;
        const min = typeof format.min === "number" ? format.min : -Number.MAX_VALUE;
        const max = typeof format.max === "number" ? format.max : Number.MAX_VALUE;

        return value > max ? max : (value < min ? min : value);
    }

    private getFormattedValue() : string
    {
        const format = this.state.format;

        let value = this.state.value;
        let text = "";

        switch(format.type) {
            case "number":
                if (format.percent) {
                    value *= 100;
                    text = value.toFixed(format.precision || 0) + " %";
                }
                else {
                    text = value.toFixed(format.precision || 2);
                }
                break;
            case "string":
                text = "" + value;
                break;
        }

        return text;
    }

    private getBarWidthPercent() : number
    {
        const format = this.state.format;

        if (typeof format.min !== "number" || typeof format.max !== "number") {
            return 0;
        }

        return (this.state.value - format.min) / (format.max - format.min) * 100;
    }
}
