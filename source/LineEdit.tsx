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

export interface ILineEditChangeEvent extends IComponentEvent<LineEdit> { text: string }
export interface ILineEditFocusEvent extends IComponentEvent<LineEdit> { text: string }
export interface ILineEditBlurEvent extends IComponentEvent<LineEdit> { text: string }

/** Properties for [[LineEdit]] component. */
export interface ILineEditProps
{
    id?: string;
    className?: string;
    style?: CSSProperties;
    text?: string;
    placeholder?: string;
    focused?: boolean;
    selected?: boolean;
    onChange?: (event: ILineEditChangeEvent) => void;
    onFocus?: (event: ILineEditFocusEvent) => void;
    onBlur?: (event: ILineEditBlurEvent) => void;
}

export default class LineEdit extends React.Component<ILineEditProps, {}>
{
    static defaultProps: ILineEditProps = {
        className: "control line-edit"
    };

    protected element: HTMLInputElement;

    constructor(props: ILineEditProps)
    {
        super(props);

        this.onRef = this.onRef.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    render()
    {
        const {
            className,
            style,
            placeholder
        } = this.props;

        return (
            <input
                key={this.props.text}
                className={className}
                style={style}
                defaultValue={this.props.text}
                placeholder={placeholder}
                ref={this.onRef}
                onChange={this.onChange}
                onFocus={this.onFocus}
                onBlur={this.onBlur} />
        );
    }

    protected onRef(element: HTMLInputElement)
    {
        this.element = element;

        if (element) {
            if (this.props.focused) {
                element.focus();
            }
            if (this.props.selected) {
                element.setSelectionRange(0, element.value.length);
            }
        }
    }

    protected onFocus()
    {
        if (this.props.onFocus) {
            this.props.onFocus({ text: this.element.value, id: this.props.id, sender: this });
        }
    }

    protected onBlur()
    {
        if (this.props.onBlur) {
            this.props.onBlur({ text: this.element.value, id: this.props.id, sender: this });
        }
    }

    protected onChange()
    {
        if (this.props.onChange) {
            this.props.onChange({ text: this.element.value, id: this.props.id, sender: this });
        }
    }
}