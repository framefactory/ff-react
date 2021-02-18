/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import math from "@ff/core/math";
import ManipSource, { IManipListener, IManipEvent } from "./ManipSource";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[Slider]] component. */
export interface ISliderProps
{
    className?: string;
    value?: number;
    min?: number;
    max?: number;
    onChange?: (value: number) => void;
}

export interface ISliderState
{
    value: number;
}

////////////////////////////////////////////////////////////////////////////////

export default class Slider extends React.Component<ISliderProps, ISliderState> implements IManipListener
{
    static defaultProps: ISliderProps = {
        className: "ff-slider",
        value: 0,
        min: 0,
        max: 100
    };

    protected sliderElement: HTMLDivElement;
    protected knobElement: HTMLDivElement;
    protected manip: ManipSource;
    protected sliderRect: ClientRect;
    protected knobStyle: CSSProperties;

    constructor(props: ISliderProps)
    {
        super(props);

        this.state = {
            value: props.value
        };

        this.knobStyle = { left: "0" };

        this.onRefSlider = this.onRefSlider.bind(this);
        this.onRefKnob = this.onRefKnob.bind(this);

    }

    componentWillReceiveProps(props)
    {
        this.setState({
            value: props.value
        });
    }

    setValue(value: number)
    {
        const props = this.props;
        value = math.limit(value, props.min, props.max);

        this.setState({ value });

        if (props.onChange) {
            props.onChange(value);
        }
    }

    render()
    {
        this.updateKnobPosition();

        return (<div
            ref={this.onRefSlider}
            className={this.props.className}>
            <div
                ref={this.onRefKnob}
                className="ff-knob"
                style={this.knobStyle}>
            </div>
        </div>);
    }

    onManipBegin(event: IManipEvent): boolean
    {
        return true;
    }

    onManipUpdate(event: IManipEvent)
    {
        if (!event.isActive) {
            return;
        }

        const props = this.props;
        const delta = event.movementX;
        const width = this.sliderElement.getBoundingClientRect().width;
        const left = parseInt(this.knobElement.style.left) + delta;
        const value = left / width * (props.max - props.min) + props.min;

        this.setValue(value);
    }

    onManipEnd(event: IManipEvent)
    {
    }

    onManipEvent(event: IManipEvent)
    {
    }

    protected onRefSlider(element: HTMLDivElement)
    {
        this.sliderElement = element;
        this.updateKnobPosition();
    }

    protected onRefKnob(element: HTMLDivElement)
    {
        this.knobElement = element;

        if (element) {
            this.manip = new ManipSource(element, { touchable: true, draggable: true });
            this.manip.setListener(this);
        }
        else if (this.manip) {
            this.manip.detach();
            this.manip = null;
        }
    }

    protected updateKnobPosition()
    {
        if (!this.sliderElement) {
            return;
        }

        const props = this.props;
        const width = this.sliderElement.getBoundingClientRect().width;
        const left = (this.state.value - props.min) / (props.max - props.min) * width;
        this.knobStyle = { left: "" + left + "px" };
    }
}
