/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";

import { IComponentEvent, IComponentProps } from "./common";

////////////////////////////////////////////////////////////////////////////////

export interface ITextEditChangeEvent extends IComponentEvent<TextEdit> { text: string }
export interface ITextEditFocusEvent extends IComponentEvent<TextEdit> { text: string }
export interface ITextEditBlurEvent extends IComponentEvent<TextEdit> { text: string }

export interface ITextEditProps extends IComponentProps
{
    text?: string;
    placeholder?: string;
    focused?: boolean;
    selected?: boolean;
    onChange?: (event: ITextEditChangeEvent) => void;
    onFocus?: (event: ITextEditFocusEvent) => void;
    onBlur?: (event: ITextEditBlurEvent) => void;
}

export default class TextEdit extends React.Component<ITextEditProps, {}>
{
    static defaultProps = {
        className: "ff-control ff-text-edit"
    };

    protected element: HTMLTextAreaElement;

    constructor(props: ITextEditProps)
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
            <textarea
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

    protected onRef(element: HTMLTextAreaElement)
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
        const { id, index, onFocus } = this.props;

        if (onFocus) {
            onFocus({ text: this.element.value, id, index, sender: this });
        }
    }

    protected onBlur()
    {
        const { id, index, onBlur } = this.props;

        if (onBlur) {
            onBlur({ text: this.element.value, id, index, sender: this });
        }
    }

    protected onChange()
    {
        const { id, index, onChange } = this.props;

        if (onChange) {
            onChange({ text: this.element.value, id, index, sender: this });
        }
    }
}