/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { MouseEvent, WheelEvent, PointerEvent, SyntheticEvent } from "react";

////////////////////////////////////////////////////////////////////////////////

export type ManipPointerEventType = "down" | "move" | "up";
export type ManipTriggerEventType = "wheel" | "dblclick" | "contextmenu";

export type PointerEvent = PointerEvent<HTMLDivElement>;
export type MouseEvent = MouseEvent<HTMLDivElement>;
export type WheelEvent = WheelEvent<HTMLDivElement>;

export interface IManipEventHandler
{
    onPointer: (event: IManipPointerEvent) => boolean;
    onTrigger: (event: IManipTriggerEvent) => boolean;
}

export interface IManipBaseEvent
{
    sender: ManipTarget;
    id: string;

    centerX: number;
    centerY: number;

    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
}

export interface IManipPointerEvent extends IManipBaseEvent
{
    originalEvent: PointerEvent;
    type: ManipPointerEventType;
    source: "mouse" | "pen" | "touch";

    isPrimary: boolean;
    activePointerList: PointerEvent[];
    activePointerCount: number;
    downPointerCount: number;

    movementX: number;
    movementY: number;
}

export interface IManipTriggerEvent extends IManipBaseEvent
{
    originalEvent: SyntheticEvent;
    type: ManipTriggerEventType;

    wheel: number;
}

/** Properties for [[ManipTarget]] component. */
export interface IManipTargetProps
{
    /** Unique identifier for this component. */
    id?: string;
    /** Class name for this component. Default is "manip-target". */
    className?: string;
    /** Captures a pointer after pressed. Default is true. */
    capture?: boolean;
    /** Handler for manip events; an object implementing the [[IManipHandler]] interface. */
    handler?: IManipEventHandler;
    /** Callback function for pointer events. */
    onPointer?: (event: IManipPointerEvent) => boolean;
    /** Callback function for trigger events (wheel, context menu, etc.) */
    onTrigger?: (event: IManipTriggerEvent) => boolean;
}

export default class ManipTarget extends React.Component<IManipTargetProps, {}>
{
    static readonly defaultProps: IManipTargetProps = {
        className: "manip-target"
    };

    protected elementRef: React.RefObject<HTMLDivElement>;
    protected activePointers: { [id:string]: PointerEvent };
    protected activeType: string;
    protected downPointerCount: number;

    protected centerX: number;
    protected centerY: number;

    constructor(props: IManipTargetProps)
    {
        super(props);

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUpOrCancel = this.onPointerUpOrCancel.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.onWheel = this.onWheel.bind(this);

        this.elementRef = React.createRef();
        this.activePointers = {};
        this.activeType = "";
        this.downPointerCount = 0;
        this.centerX = 0;
        this.centerY = 0;
    }

    render()
    {
        const {
            className,
            children
        } = this.props;

        const props = {
            className,
            ref: this.elementRef,
            "touch-action": "none",
            onPointerDown: this.onPointerDown,
            onPointerMove: this.onPointerMove,
            onPointerUp: this.onPointerUpOrCancel,
            onPointerCancel: this.onPointerUpOrCancel,
            onDoubleClick: this.onDoubleClick,
            onContextMenu: this.onContextMenu,
            onWheel: this.onWheel
        };

        return React.createElement("div", props, children);
    }

    protected onPointerDown(event: PointerEvent)
    {
        // only events of a single pointer type can be handled at a time
        if (this.activeType && event.pointerType !== this.activeType) {
            return;
        }

        this.activeType = event.pointerType;
        this.activePointers[event.pointerId] = event;
        this.downPointerCount++;

        if (this.props.capture !== false) {
            this.elementRef.current.setPointerCapture(event.pointerId);
        }

        const manipEvent = this.createManipPointerEvent(event, "down");

        if (this.sendPointerEvent(manipEvent)) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    protected onPointerMove(event: PointerEvent)
    {
        this.activePointers[event.pointerId] = event;

        const manipEvent = this.createManipPointerEvent(event, "move");

        if (this.sendPointerEvent(manipEvent)) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    protected onPointerUpOrCancel(event: PointerEvent)
    {
        this.activePointers[event.pointerId] = event;
        this.downPointerCount--;

        const manipEvent = this.createManipPointerEvent(event, "up");
        if (manipEvent.activePointerCount === 0) {
            this.activeType = "";
            this.downPointerCount = 0;
        }

        if (this.sendPointerEvent(manipEvent)) {
            event.stopPropagation();
            event.preventDefault();
        }

        this.activePointers[event.pointerId] = undefined;
    }

    protected onDoubleClick(event: MouseEvent)
    {
        const consumed = this.sendTriggerEvent(
            this.createManipTriggerEvent(event, "dblclick")
        );

        if (consumed) {
            event.preventDefault();
        }
    }

    protected onContextMenu(event: MouseEvent)
    {
        this.sendTriggerEvent(
            this.createManipTriggerEvent(event, "contextmenu")
        );

        // prevent default context menu regardless of whether event was consumed or not
        event.preventDefault();
    }

    protected onWheel(event: WheelEvent)
    {
        const consumed = this.sendTriggerEvent(
            this.createManipTriggerEvent(event, "wheel")
        );

        if (consumed) {
            event.preventDefault();
        }
    }

    protected createManipPointerEvent(event: PointerEvent, type: ManipPointerEventType): IManipPointerEvent
    {
        // calculate center and movement
        let centerX = 0;
        let centerY = 0;

        let pointerCount = 0;
        let pointerList = [];

        for (let id in this.activePointers) {
            const pointer = this.activePointers[id];
            if (pointer) {
                pointerList.push(pointer);
                pointerCount++;
                centerX += pointer.clientX;
                centerY += pointer.clientY;
            }
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

        return {
            originalEvent: event,
            type: type,
            source: event.pointerType,
            sender: this,
            id: this.props.id,

            isPrimary: event.isPrimary,
            activePointerList: pointerList,
            activePointerCount: pointerCount,
            downPointerCount: this.downPointerCount,

            centerX,
            centerY,
            movementX,
            movementY,

            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey
        };
    }

    protected createManipTriggerEvent(event: MouseEvent, type: ManipTriggerEventType): IManipTriggerEvent
    {
        let wheel = 0;

        if (type === "wheel") {
            wheel = (event as WheelEvent).deltaY;
        }

        return {
            originalEvent: event,
            sender: this,
            id: this.props.id,

            type,
            wheel,

            centerX: event.clientX,
            centerY: event.clientY,

            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey
        }
    }

    protected sendPointerEvent(event: IManipPointerEvent): boolean
    {
        const props = this.props;

        if (props.handler) {
            return props.handler.onPointer(event);
        }

        if (props.onPointer) {
            return props.onPointer(event);
        }
    }

    protected sendTriggerEvent(event: IManipTriggerEvent): boolean
    {
        const props = this.props;

        if (props.handler) {
            return props.handler.onTrigger(event);
        }

        if (props.onTrigger) {
            return props.onTrigger(event);
        }
    }
}