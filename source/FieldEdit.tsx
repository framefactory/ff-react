/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { jsx } from "@emotion/core";

import { IComponentEvent, IComponentProps } from "./common";
import Draggable, { PointerEvent } from "./Draggable";

////////////////////////////////////////////////////////////////////////////////

export interface IFieldEditFormat
{
    type: string,
    preset?: any,
    min?: number,
    max?: number,
    step?: number,
    precision?: number,
    bar?: boolean,
    percent?: boolean,
    options?: string[]
}

export interface IFieldEditChangeEvent extends IComponentEvent<FieldEdit> { value: number | string | boolean }
export interface IFieldEditCommitEvent extends IComponentEvent<FieldEdit> { value: number | string | boolean }

/** Properties for [[FieldEdit]] component. */
export interface IFieldEditProps extends IComponentProps
{
    value?: any;
    format?: IFieldEditFormat;
    onChange?: (event: IFieldEditChangeEvent) => void;
    onCommit?: (event: IFieldEditCommitEvent) => void;
}

export interface IFieldEditState
{
    value: any;
    format: IFieldEditFormat;
    isDragging: boolean;
    isEditing: boolean;
}

export default class FieldEdit extends React.Component<IFieldEditProps, IFieldEditState>
{
    static defaultProps: IFieldEditProps = {
        className: "ff-control ff-property-field"
    };

    static textStyle: React.CSSProperties = {
        pointerEvents: "none",
        userSelect: "none",
        display: "block"
    };

    static Float: IFieldEditFormat = {
        type: "number",
        preset: 0,
        step: 0.01,
        precision: 3
    };

    static Integer: IFieldEditFormat = {
        type: "number",
        preset: 0,
        step: 0.1,
        precision: 0
    };

    static String: IFieldEditFormat = {
        type: "string",
        preset: "",
    };

    static Color: IFieldEditFormat = {
        type: "color",
        preset: [ 0, 0, 0 ]
    };

    inputElement: HTMLInputElement;
    startValue: any;

    constructor(props: IFieldEditProps)
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

        const classes = className + (isDragging ? " ff-dragging" : "");

        const textStyle = FieldEdit.textStyle;

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
                {format.bar ? <div className="ff-bar" style={barStyle}/> : null}
                <label className="ff-text ff-align-right" style={textStyle}>{this.getFormattedValue()}</label>
                {isEditing ? <form><input
                    className="ff-edit ff-align-right"
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
        const multiplier = event.shiftKey ? 10 : (event.ctrlKey ? 0.1 : 1);

        let increment = delta * multiplier * (format.step || (format.percent ? 0.002 : 0.02));
        this.incrementValue(increment);
    }

    private onDragEnd()
    {
        this.setValue(this.state.value);
        this.setState({ isDragging: false });
    }

    private onTap()
    {
        const format = this.state.format;
        const type = format.type;

        if (type === "boolean") {
            this.setValue(!this.state.value);
        }
        else if (type === "number" || type === "string") {
            if (format.options) {

            }
            else {
                this.startEditing();
            }
        }
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
                if (format.options) {
                    const last = format.options.length - 1;
                    value = value < 0 ? 0 : (value > last ? last : Math.trunc(value));
                    text = format.options[value];
                }
                else if (format.percent) {
                    value *= 100;
                    text = value.toFixed(format.precision || 0) + " %";
                }
                else {
                    text = value.toFixed(format.precision || 2);
                }
                break;
            case "boolean":
                text = value ? "true" : "false";
                break;
            case "string":
                text = "" + value;
                break;
            case "object":
                text = "[object]";
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
