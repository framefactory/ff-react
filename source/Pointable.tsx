/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties, ReactNode, MouseEvent, PointerEvent } from "react";
import { IComponentProps } from "./common";

const _verbose = false;

////////////////////////////////////////////////////////////////////////////////

export type MouseEvent = MouseEvent<HTMLDivElement>;
export type PointerEvent = PointerEvent<HTMLDivElement>;

/** Properties for [[Pointable]] component. */
export interface IPointableProps extends IComponentProps
{
    capture?: boolean;

    onPointerDown?: (event: PointerEvent) => void;
    onPointerMove?: (event: PointerEvent) => void;
    onPointerUp?: (event: PointerEvent) => void;
    onPointerCancel?: (event: PointerEvent) => void;
    onPointerEnter?: (event: PointerEvent) => void;
    onPointerLeave?: (event: PointerEvent) => void;
}

export default class Pointable<P = IPointableProps, S = {}> extends React.Component<P, S>
{
    protected static defaultProps = {
        className: "pointable"
    };

    protected element: HTMLDivElement;
    protected capturePointer: boolean;

    private _activePointers: { [id:string]: PointerEvent };

    constructor(props: P)
    {
        super(props);

        this.element = null;
        this.capturePointer = false;

        this._activePointers = {};

        //this.onRef = this.onRef.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerCancel = this.onPointerCancel.bind(this);
        this.onPointerEnter = this.onPointerEnter.bind(this);
        this.onPointerLeave = this.onPointerLeave.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
    }

    get activePointers(): { [id:string]: PointerEvent }
    {
        return this._activePointers;
    }

    get activePointerList(): PointerEvent[]
    {
        const pointers = this._activePointers;
        const pointerList = [];

        for (const key in pointers) {
            pointerList.push(pointers[key]);
        }

        return pointerList;
    }

    get activePointerCount(): number
    {
        return Object.keys(this._activePointers).length;
    }

    render()
    {
        const {
            className,
            style,
            children
        } = this.props as IPointableProps & { children: ReactNode };

        const props = {
            className,
            style,
            //ref: this.onRef,
            "touch-action": "none",
            onPointerDown: this.onPointerDown,
            onPointerMove: this.onPointerMove,
            onPointerUp: this.onPointerUp,
            onPointerCancel: this.onPointerCancel,
            onPointerEnter: this.onPointerEnter,
            onPointerLeave: this.onPointerLeave,
            onDoubleClick: this.onDoubleClick,
            onContextMenu: this.onContextMenu
        };

        return(<div {...props}>
            {children}
        </div>);
    }

/*    protected onRef(element: HTMLDivElement)
    {
        const prevElement = this.element;
        this.element = element;

        if (element) {
            element.addEventListener("pointerdown", this.onPointerDown);
            element.addEventListener("pointermove", this.onPointerMove);
            element.addEventListener("pointerup", this.onPointerUp);
            element.addEventListener("pointercancel", this.onPointerCancel);
            element.addEventListener("pointerenter", this.onPointerEnter);
            element.addEventListener("pointerleave", this.onPointerLeave);
        }
        else if (prevElement) {
            prevElement.removeEventListener("pointerdown", this.onPointerDown);
            prevElement.removeEventListener("pointermove", this.onPointerMove);
            prevElement.removeEventListener("pointerup", this.onPointerUp);
            prevElement.removeEventListener("pointercancel", this.onPointerCancel);
            prevElement.removeEventListener("pointerenter", this.onPointerEnter);
            prevElement.removeEventListener("pointerleave", this.onPointerLeave);
        }
    }*/

    protected onPointerDown(event: PointerEvent): void
    {
        this._activePointers[event.pointerId] = event;

        const props = this.props as IPointableProps;

        if (props.capture || this.capturePointer) {
            this.element.setPointerCapture(event.pointerId);
        }

        if (props.onPointerDown) {
            props.onPointerDown(event);
        }

        _verbose && console.log("onPointerDown", event);
    }

    protected onPointerMove(event: PointerEvent): void
    {
        this._activePointers[event.pointerId] = event;

        const props = this.props as IPointableProps;

        if (props.onPointerMove) {
            props.onPointerMove(event);
        }

        _verbose && console.log("onPointerMove", event);
    }

    protected onPointerUp(event: PointerEvent): void
    {
        delete this._activePointers[event.pointerId];

        const props = this.props as IPointableProps;

        if (props.capture || this.capturePointer) {
            this.element.releasePointerCapture(event.pointerId);
        }

        if (props.onPointerUp) {
            props.onPointerUp(event);
        }

        _verbose && console.log("onPointerUp", event);
    }

    protected onPointerCancel(event: PointerEvent): void
    {
        delete this._activePointers[event.pointerId];

        const props = this.props as IPointableProps;

        if (props.capture) {
            this.element.releasePointerCapture(event.pointerId);
        }

        if (props.onPointerCancel) {
            props.onPointerCancel(event);
        }

        _verbose && console.log("onPointerCancel", event);
    }

    protected onPointerEnter(event: PointerEvent): void
    {
        const props = this.props as IPointableProps;

        if (props.onPointerEnter) {
            props.onPointerEnter(event);
        }

        _verbose && console.log("onPointerEnter", event);
    }

    protected onPointerLeave(event: PointerEvent): void
    {
        const props = this.props as IPointableProps;

        if (props.onPointerLeave) {
            props.onPointerLeave(event);
        }

        _verbose && console.log("onPointerLeave", event);
    }

    protected onDoubleClick(event: MouseEvent)
    {
    }

    protected onContextMenu(event: MouseEvent)
    {
    }
}