/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";

import {
    MouseEvent as ReactMouseEvent,
    PointerEvent as ReactPointerEvent,
    ReactNode
} from "react";

import { IComponentProps, IComponentEvent } from "./common";
import { IPointableProps } from "./Pointable";

////////////////////////////////////////////////////////////////////////////////

export type MouseEvent = ReactMouseEvent<HTMLDivElement>;
export type PointerEvent = ReactPointerEvent<HTMLDivElement>;

export interface IDraggablePressEvent extends IComponentEvent<Draggable> { }
export interface IDraggableReleaseEvent extends IComponentEvent<Draggable> { }
export interface IDraggableTapEvent extends IComponentEvent<Draggable> { }
export interface IDraggableDoubleTapEvent extends IComponentEvent<Draggable> { }

/** Properties for [[Draggable]] component. */
export interface IDraggableProps extends IComponentProps
{
    capture?: boolean;
    draggable?: boolean;

    onPress?: (event: IDraggablePressEvent) => void;
    onRelease?: (event: IDraggableReleaseEvent) => void;
    onTap?: (event: IDraggableTapEvent) => void;
    onDoubleTap?: (event: IDraggableDoubleTapEvent) => void;

    onDragBegin?: (event: PointerEvent) => void;
    onDragMove?: (event: PointerEvent, dx: number, dy: number) => void;
    onDragEnd?: (event: PointerEvent) => void;

    onPointerDown?: (event: PointerEvent) => void;
    onPointerMove?: (event: PointerEvent, dx?: number, dy?: number) => void;
    onPointerUp?: (event: PointerEvent) => void;
    onPointerCancel?: (event: PointerEvent) => void;
    onContextMenu?: (event: MouseEvent) => void;
}

export interface IDraggableState
{
    isDragging: boolean;
}

export default class Draggable<P extends IDraggableProps = IDraggableProps>
    extends React.Component<P, IDraggableState>
{
    protected static defaultProps = {
        className: "ff-draggable"
    };

    protected element: React.RefObject<HTMLDivElement>;

    private isActive: boolean;
    private startX: number;
    private startY: number;
    private lastX: number;
    private lastY: number;


    constructor(props: P)
    {
        super(props);

        this.state = {
            isDragging: false
        };

        this.element = React.createRef();

        this.isActive = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
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
            onDoubleClick: this.onDoubleClick,
            onContextMenu: this.onContextMenu
        };

        return(<div {...props}>
            {children}
        </div>);
    }

    protected onPointerDown(event: PointerEvent)
    {
        const props = this.props;

        if (props.onPointerDown) {
            props.onPointerDown(event);
        }

        if (event.isPrimary) {
            this.element.current.setPointerCapture(event.pointerId);

            this.isActive = true;
            this.startX = event.clientX;
            this.startY = event.clientY;
            this.lastX = this.startX;
            this.lastY = this.startY;

            const { id, index, onPress } = this.props;

            if (onPress) {
                onPress({ id, index, sender: this });
            }
        }

        event.stopPropagation();
        event.preventDefault();
    }

    protected onPointerMove(event: PointerEvent)
    {
        const props = this.props;
        const state = this.state;

        const dx = event.clientX - this.lastX;
        const dy = event.clientY - this.lastY;
        this.lastX = event.clientX;
        this.lastY = event.clientY;

        if (props.onPointerMove) {
            props.onPointerMove(event, dx, dy);
        }

        if (event.isPrimary && this.isActive) {
            if (state.isDragging) {
                this.onDragMove(event, dx, dy);
            }
            else if (props.draggable !== false) {
                let deltaX = event.clientX - this.startX,
                    deltaY = event.clientY - this.startY,
                    manhattanDistance = Math.abs(deltaX) + Math.abs(deltaY);

                if (manhattanDistance > 2) {
                    this.setState({ isDragging: true });
                    this.onDragBegin(event)
                }
            }

            event.stopPropagation();
            event.preventDefault();
        }
   }

    protected onPointerUp(event: PointerEvent)
    {
        const state = this.state;
        const { id, index, onPointerUp, onRelease, onTap } = this.props;

        if (onPointerUp) {
            onPointerUp(event);
        }

        if (event.isPrimary && this.isActive) {

            this.isActive = false;

            if (onRelease) {
                onRelease({ id, index, sender: this });
            }

            if (state.isDragging) {
                this.setState({ isDragging: false });
                this.onDragEnd(event);
            }
            else {
                if (onTap) {
                    onTap({ id, index, sender: this });
                }
            }

            event.stopPropagation();
            event.preventDefault();
        }
    }

    /** May be overridden in descendant classes. */
    protected onDoubleClick()
    {
        if (!this.state.isDragging) {
            const { id, index, onDoubleTap } = this.props;

            if (onDoubleTap) {
                onDoubleTap({ id, index, sender: this });
            }
        }
    }

    /** May be overridden in descendant classes. */
    protected onContextMenu(event: MouseEvent)
    {
        event.preventDefault();

        if (!this.state.isDragging && this.props.onContextMenu) {
            this.props.onContextMenu(event);
        }
    }

    /** May be overridden in descendant classes. */
    protected onDragBegin(event: PointerEvent)
    {
        if (this.props.onDragBegin) {
            this.props.onDragBegin(event);
        }
    }

    /** May be overridden in descendant classes. */
    protected onDragMove(event: PointerEvent, dx: number, dy: number)
    {
        if (this.props.onDragMove) {
            this.props.onDragMove(event, dx, dy);
        }
    }

    /** May be overridden in descendant classes. */
    protected onDragEnd(event: PointerEvent)
    {
        if (this.props.onDragEnd) {
            this.props.onDragEnd(event);
        }
    }
}
