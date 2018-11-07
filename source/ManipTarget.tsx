/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { MouseEvent, WheelEvent, PointerEvent, SyntheticEvent } from "react";

import { Dictionary } from "@ff/core/types";
import { IComponentProps, IComponentEvent } from "./common";

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

export interface IPointerPosition
{
    id: number;
    clientX: number;
    clientY: number;
}

export interface IManipBaseEvent extends IComponentEvent<ManipTarget>
{
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
    activePositions: IPointerPosition[];
    pointerCount: number;

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
export interface IManipTargetProps extends IComponentProps
{
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
        className: "ff-manip-target"
    };

    protected elementRef: React.RefObject<HTMLDivElement>;
    protected activePositions: IPointerPosition[];
    protected activeType: string;

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
        this.activePositions = [];
        this.activeType = "";
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
        this.activePositions.push({
            id: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY
        });

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
        const activePositions = this.activePositions;

        for (let i = 0, n = activePositions.length; i < n; ++i) {
            const position = activePositions[i];
            if (event.pointerId === position.id) {
                position.clientX = event.clientX;
                position.clientY = event.clientY;
            }
        }

        const manipEvent = this.createManipPointerEvent(event, "move");

        if (this.sendPointerEvent(manipEvent)) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    protected onPointerUpOrCancel(event: PointerEvent)
    {
        const activePositions = this.activePositions;
        let found = false;

        for (let i = 0, n = activePositions.length; i < n; ++i) {
            if (event.pointerId === activePositions[i].id) {
                activePositions.splice(i, 1);
                found = true;
                break;
            }
        }

        if (!found) {
            console.warn("orphan pointer up/cancel event #id", event.pointerId);
            return;
        }

        const manipEvent = this.createManipPointerEvent(event, "up");
        if (activePositions.length === 0) {
            this.activeType = "";
        }

        if (this.sendPointerEvent(manipEvent)) {
            event.stopPropagation();
            event.preventDefault();
        }
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
        let movementX = 0;
        let movementY = 0;

        const positions = this.activePositions;
        const count = positions.length;

        if (count > 0) {
            for (let i = 0; i < count; ++i) {
                centerX += positions[i].clientX;
                centerY += positions[i].clientY;
            }

            centerX /= count;
            centerY /= count;

            if (type === "move") {
                movementX = centerX - this.centerX;
                movementY = centerY - this.centerY;
            }

            this.centerX = centerX;
            this.centerY = centerY;
        }
        else {
            centerX = this.centerX;
            centerY = this.centerY;
        }

        return {
            originalEvent: event,
            type: type,
            source: event.pointerType,
            sender: this,
            id: this.props.id,
            index: this.props.index,

            isPrimary: event.isPrimary,
            activePositions: positions,
            pointerCount: count,

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
            index: this.props.index,

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