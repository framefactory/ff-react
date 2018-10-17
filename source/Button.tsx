/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties, PointerEvent, KeyboardEvent } from "react";

import { IComponentEvent, IComponentProps } from "./common";

////////////////////////////////////////////////////////////////////////////////

/**
 * Emitted after the button has been pressed down.
 * @event IButtonDownEvent
 */
export interface IButtonDownEvent extends IComponentEvent<Button> { }

/**
 * Emitted after the button has been released.
 * @event IButtonUpEvent
 */
export interface IButtonUpEvent extends IComponentEvent<Button> { }

/**
 * Emitted after the button has been tapped.
 * @event IButtonTapEvent
 */
export interface IButtonTapEvent extends IComponentEvent<Button> { }

/**
 * Emitted after the button's selection state has changed.
 * @event IButtonSelectEvent
 */
export interface IButtonSelectEvent extends IComponentEvent<Button> { selected: boolean; }

/** Properties for [[Button]] component. */
export interface IButtonProps extends IComponentProps
{
    text?: string;
    /** Class(es) for a custom icon. */
    icon?: string;
    /** Name of a Font Awesome icon. Expanded into classes "fa fa-<icon>" */
    faIcon?: string;
    /** URL of an image to display with the button. */
    image?: string;
    /** Title appears when hovering over the button. */
    title?: string;
    /** When set to true, button appears in disabled state. Default is false. */
    disabled?: boolean;
    /** When selectable, clicking the button toggles "selected" state. */
    selectable?: boolean;
    /** When selected, class "selected" is added to the button. */
    selected?: boolean;
    /** Element receives the focus after mounting if true. */
    focused?: boolean;

    /** Event fired if button is pressed down. */
    onDown?: (event: IButtonDownEvent) => void;
    /** Event fired if button is released. */
    onUp?: (event: IButtonUpEvent) => void;
    /** Event fired if button is tapped (pressed and released). */
    onTap?: (event: IButtonTapEvent) => void;
    /** Event fired after selection state has changed. The selectable property must be set for this event to be fired. */
    onSelect?: (event: IButtonSelectEvent) => void;
}

export interface IButtonState
{
    selected: boolean;
}

export type PointerEvent = PointerEvent<HTMLDivElement>;

////////////////////////////////////////////////////////////////////////////////

/**
 * Universal button component based on pointer events. Works with mouse and touch input.
 * Provides an icon with support for Font Awesome icons and/or a text.
 *
 * Default classes applied to outer div: control, button, selected. Classes applied
 * to content span elements: content icon|text|image
 */
export default class Button<P extends IButtonProps = IButtonProps> extends React.Component<P, IButtonState>
{
    static defaultProps: IButtonProps = {
        className: "control button"
    };

    static mainStyle: CSSProperties = {
        touchAction: "none",
        cursor: "pointer"
    };

    static contentStyle: CSSProperties = {
        pointerEvents: "none",
        userSelect: "none"
    };

    protected elementRef: React.RefObject<HTMLDivElement>;
    private pointerId: number;

    constructor(props: P)
    {
        super(props);

        this.state = {
            selected: props.selected
        };

        this.elementRef = React.createRef();
        this.pointerId = -1;

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerCancel = this.onPointerCancel.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

    setFocus()
    {
        if (this.elementRef.current) {
            this.elementRef.current.focus();
        }
    }

    isSelected()
    {
        return this.state.selected;
    }

    componentDidMount()
    {
        if (this.props.focused && this.elementRef.current) {
            this.elementRef.current.focus();
        }
    }

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
            disabled,
            children
        } = this.props;

        const classes = className +
            (this.state.selected ? " selected" : "") +
            (disabled === true ? " disabled" : "");

        const mainStyle = Object.assign({}, Button.mainStyle, style);
        const contentStyle = Button.contentStyle;

        const props = {
            ref: this.elementRef,
            className: classes,
            style: mainStyle,
            title: title,
            tabIndex: 0,
            "touch-action": "none",
            onPointerDown: disabled ? null : this.onPointerDown,
            onPointerUp: disabled ? null : this.onPointerUp,
            onPointerCancel: disabled ? null : this.onPointerCancel,
            onKeyDown: disabled ? null : this.onKeyDown,
            onKeyUp: disabled ? null : this.onKeyUp
        };

        return (
            <div
                {...props} >

                {icon ? <span className={"content icon " + icon} style={contentStyle} /> : null}
                {faIcon ? <span className={"content icon fa fas fa-" + faIcon} style={contentStyle} /> : null}
                {image ? <img className="content image" src={image} style={contentStyle} /> : null}
                {text ? <span className="content text" style={contentStyle}>{text}</span> : null}
                {children}
            </div>);
    }

    componentWillReceiveProps(nextProps: IButtonProps)
    {
        this.setState({
            selected: nextProps.selected
        });
    }

    protected onPointerDown(event: PointerEvent)
    {
        if (this.pointerId === -1) {
            this.pointerId = event.pointerId;

            const { id, index, onDown } = this.props;

            if (onDown) {
                onDown({ id, index, sender: this });
            }
        }

        event.stopPropagation();
    }

    protected onPointerUp(event: PointerEvent)
    {
        if (this.pointerId === event.pointerId) {
            this.pointerId = -1;

            const { id, index, selectable, onSelect, onUp, onTap } = this.props;

            if (selectable) {
                this.setState(prevState => {
                    const selected = !prevState.selected;

                    if (onSelect) {
                        onSelect({ selected, id, index, sender: this });
                    }

                    return { selected };
                });
            }

            if (onUp) {
                onUp({ id, index, sender: this });
            }
            if (onTap) {
                onTap({ id, index, sender: this });
            }
        }

        event.stopPropagation();
    }

    protected onPointerCancel(event: PointerEvent)
    {
        if (this.pointerId === event.pointerId) {
            this.pointerId = -1;
            const { id, index, onUp } = this.props;

            if (onUp) {
                onUp({ id, index, sender: this });
            }
        }
    }

    protected onKeyDown(event: KeyboardEvent<HTMLDivElement>)
    {
        if (event.keyCode === 32) {
            const { id, index, onDown } = this.props;

            if (onDown) {
                onDown({ id, index, sender: this });
            }
        }
    }

    protected onKeyUp(event: KeyboardEvent<HTMLDivElement>)
    {
        if (event.keyCode === 32) {
            const { id, index, selectable, onSelect, onUp, onTap } = this.props;

            if (selectable) {
                this.setState(prevState => {
                    const selected = !prevState.selected;

                    if (onSelect) {
                        onSelect({ selected, id, index, sender: this });
                    }

                    return { selected };
                });
            }

            if (onUp) {
                onUp({ id, index, sender: this });
            }
            if (onTap) {
                onTap({ id, index, sender: this });
            }
        }
    }
}