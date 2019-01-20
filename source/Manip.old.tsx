/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties, MouseEvent, WheelEvent, PointerEvent, SyntheticEvent, ReactNode } from "react";

import math from "@ff/core/math";

import { IComponentProps, IComponentEvent } from "./common";
import { IPointableProps } from "./Pointable";

////////////////////////////////////////////////////////////////////////////////

export type ManipEventType = "down" | "move" | "up" | "wheel" | "dblclick" | "contextmenu";

export type PointerEvent = PointerEvent<HTMLDivElement>;
export type MouseEvent = MouseEvent<HTMLDivElement>;
export type WheelEvent = WheelEvent<HTMLDivElement>;

export interface IManipEvent extends IComponentEvent<Manip>
{
    pointerEvent: PointerEvent;
    originalEvent: SyntheticEvent;
    target: EventTarget;

    activePointerList: PointerEvent[];
    activePointerCount: number;

    type: ManipEventType;
    isActive: boolean;

    movementX: number;
    movementY: number;
    centerX: number;
    centerY: number;
    primaryX: number;
    primaryY: number;

    pinchDistance: number;
    pinchFactor: number;
    pinchDeltaFactor: number,
    pinchAngle: number;
    pinchDeltaAngle: number,

    wheel: number;
}

export interface IManipListener
{
    onManipBegin: (event: IManipEvent) => void;
    onManipEnd: (event: IManipEvent) => void;
    onManipUpdate: (event: IManipEvent) => void;
    onManipEvent: (event: IManipEvent) => boolean;
}

export interface IManipProps extends IComponentProps
{
    capture?: boolean;
    listener?: IManipListener;

    onManipBegin?: (event: IManipEvent) => void;
    onManipUpdate?: (event: IManipEvent) => void;
    onManipEnd?: (event: IManipEvent) => void;
    onManipEvent?: (event: IManipEvent) => boolean;
}


export default class Manip extends React.Component<IManipProps, {}>
{
    static defaultProps = {
        className: "ff-manip"
    };

    protected element: React.RefObject<HTMLDivElement>;
    protected isActive: boolean;
    protected activePointers: { [id:string]: PointerEvent };

    protected centerX: number;
    protected centerY: number;
    protected primaryX: number;
    protected primaryY: number;
    protected pinchStartDistance: number;
    protected pinchLastDistance: number;
    protected pinchLastAngle: number;

    constructor(props: IManipProps)
    {
        super(props);

        this.element = React.createRef();
        this.isActive = false;
        this.activePointers = {};

        this.centerX = 0;
        this.centerY = 0;
        this.primaryX = 0;
        this.primaryY = 0;
        this.pinchStartDistance = 0;
        this.pinchLastDistance = 0;
        this.pinchLastAngle = 0;

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerCancel = this.onPointerCancel.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
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
            ref: this.element,
            "touch-action": "none",
            onPointerDown: this.onPointerDown,
            onPointerMove: this.onPointerMove,
            onPointerUp: this.onPointerUp,
            onPointerCancel: this.onPointerCancel,
            onWheel: this.onMouseWheel,
            onDoubleClick: this.onDoubleClick,
            onContextMenu: this.onContextMenu
        };

        return React.createElement("div", props, children) as any;
    }

    protected onPointerDown(event: PointerEvent): void
    {
        this.activePointers[event.pointerId] = event;

        if (this.props.capture) {
            this.element.current.setPointerCapture(event.pointerId);
        }

        const manipEvent = this.createManipFromPointerEvent(event, "down");

        if (event.isPrimary) {
            this.isActive = true;
            this.sendManipBeginEvent(manipEvent);
        }
        else {
            this.sendManipUpdateEvent(manipEvent);
        }
    }

    protected onPointerMove(event: PointerEvent): void
    {
        this.activePointers[event.pointerId] = event;

        const manipEvent = this.createManipFromPointerEvent(event, "move");

        this.sendManipUpdateEvent(manipEvent);
    }

    protected onPointerUp(event: PointerEvent): void
    {
        delete this.activePointers[event.pointerId];

        this.onPointerUpOrCancel(event);
    }

    protected onPointerCancel(event: PointerEvent): void
    {
        delete this.activePointers[event.pointerId];

        this.onPointerUpOrCancel(event);
    }

    protected onPointerUpOrCancel(event: PointerEvent): void
    {
        const manipEvent = this.createManipFromPointerEvent(event, "up");

        if (event.isPrimary) {
            this.isActive = false;
            this.pinchStartDistance = 0;
            this.pinchLastDistance = 0;
            this.pinchLastAngle = 0;
            this.sendManipEndEvent(manipEvent);
        }
        else {
            this.sendManipUpdateEvent(manipEvent);
        }
    }

    protected onDoubleClick(event: MouseEvent)
    {
        const manipEvent = this.createManipFromMouseEvent(event, "dblclick");
        const props = this.props;

        if (props.onManipEvent) {
            props.onManipEvent(manipEvent);
        }
        if (props.listener) {
            props.listener.onManipEvent(manipEvent);
        }
    }

    protected onContextMenu(event: MouseEvent)
    {
        const manipEvent = this.createManipFromMouseEvent(event, "contextmenu");
        const props = this.props;

        let isHandled = false;

        if (props.onManipEvent) {
            isHandled = props.onManipEvent(manipEvent) || isHandled;
        }
        if (props.listener) {
            isHandled = props.listener.onManipEvent(manipEvent) || isHandled;
        }

        if (isHandled) {
            event.preventDefault();
        }
    }

    protected onMouseWheel(event: WheelEvent)
    {
        const manipEvent = this.createManipFromMouseEvent(event, "wheel");
        manipEvent.wheel = event.deltaY;

        const props = this.props;

        if (props.onManipEvent) {
            props.onManipEvent(manipEvent);
        }
        if (props.listener) {
            props.listener.onManipEvent(manipEvent);
        }
    }

    protected sendManipBeginEvent(event: IManipEvent)
    {
        event.isActive = true;

        const props = this.props;

        if (props.onManipBegin) {
            props.onManipBegin(event);
        }
        if (props.listener) {
            props.listener.onManipBegin(event);
        }
    }

    protected sendManipUpdateEvent(event: IManipEvent)
    {
        event.isActive = this.isActive;

        const props = this.props;

        if (props.onManipUpdate) {
            props.onManipUpdate(event);
        }
        if (props.listener) {
            props.listener.onManipUpdate(event);
        }
    }

    protected sendManipEndEvent(event: IManipEvent)
    {
        event.isActive = false;

        const props = this.props;

        if (props.onManipEnd) {
            props.onManipEnd(event);
        }
        if (props.listener) {
            props.listener.onManipEnd(event);
        }
    }

    protected createManipFromPointerEvent(event: PointerEvent, type: ManipEventType): IManipEvent
    {
        if (event.isPrimary) {
            this.primaryX = event.clientX;
            this.primaryY = event.clientY;
        }

        // calculate center and movement
        let centerX = 0;
        let centerY = 0;

        let pointerCount = 0;
        let pointerList = [];

        for (let id in this.activePointers) {
            const pointer = this.activePointers[id];
            pointerList.push(pointer);
            pointerCount++;
            centerX += pointer.clientX;
            centerY += pointer.clientY;
        }

        centerX /= pointerCount;
        centerY /= pointerCount;

        let movementX = centerX - this.centerX;
        let movementY = centerY - this.centerY;

        if (type === "down" || type === "up") {
            movementX = 0;
            movementY = 0;
        }

        this.centerX = centerX;
        this.centerY = centerY;

        // calculate pinch parameters
        let pinchDistance = 0;
        let pinchFactor = 1;
        let pinchAngle = 0;
        let pinchDeltaFactor = 1;
        let pinchDeltaAngle = 0;

        if (pointerCount === 2) {
            const dx = pointerList[1].clientX - pointerList[0].clientX;
            const dy = pointerList[1].clientY - pointerList[0].clientY;

            pinchDistance = Math.sqrt(dx * dx + dy * dy);

            if (this.pinchStartDistance === 0) {
                this.pinchStartDistance = pinchDistance;
            }

            pinchFactor = pinchDistance / this.pinchStartDistance;
            pinchDeltaFactor = this.pinchLastDistance > 0 ? (pinchDistance / this.pinchLastDistance) : 1;
            this.pinchLastDistance = pinchDistance;

            pinchAngle = Math.atan2(dy, dx);

            pinchDeltaAngle = this.pinchLastAngle !== 0
                ? math.deltaRadians(this.pinchLastAngle, pinchAngle) : 0;

            this.pinchLastAngle = pinchAngle;
        }

        return {
            id: this.props.id,
            index: this.props.index,
            sender: this,

            pointerEvent: event,
            originalEvent: event,
            target: event.target,

            activePointerList: pointerList,
            activePointerCount: pointerCount,

            type,
            isActive: false,

            movementX,
            movementY,
            centerX,
            centerY,
            primaryX: this.primaryX,
            primaryY: this.primaryY,
            pinchDistance,
            pinchFactor,
            pinchDeltaFactor,
            pinchAngle,
            pinchDeltaAngle,
            wheel: 0
        };
    }

    protected createManipFromMouseEvent(event: MouseEvent | WheelEvent, type: ManipEventType): IManipEvent
    {
        return {
            id: this.props.id,
            index: this.props.index,
            sender: this,

            pointerEvent: null,
            originalEvent: event,
            target: event.target,

            activePointerList: null,
            activePointerCount: null,

            type,
            isActive: false,

            movementX: 0,
            movementY: 0,
            centerX: 0,
            centerY: 0,
            primaryX: 0,
            primaryY: 0,
            pinchDistance: 1,
            pinchFactor: 1,
            pinchDeltaFactor: 1,
            pinchAngle: 0,
            pinchDeltaAngle: 0,
            wheel: 0
        }
    }
}
