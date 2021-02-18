/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties, ReactElement } from "react";

import Draggable, { IDraggableProps, PointerEvent } from "./Draggable";

////////////////////////////////////////////////////////////////////////////////

export {
    IDraggablePressEvent,
    IDraggableReleaseEvent,
    IDraggableTapEvent,
    IDraggableDoubleTapEvent
} from "./Draggable";

interface IDragSpriteProps
{
    onSprite: (element: HTMLElement) => void;
    active: boolean;
}

const _dragSpriteStyle: CSSProperties = {
    display: "block",
    position: "fixed",
    zIndex: 1000,
    pointerEvents: "none"
};

const DragSprite: React.SFC<IDragSpriteProps> = function(props)
{
    if (!props.active) {
        return null;
    }

    return (<div
        ref={props.onSprite}
        style={_dragSpriteStyle}>
        {props.children}
    </div>);
};

export interface IPointerDragEvent extends PointerEvent
{
    payloadType: string;
    payload: any;
    dropTarget: Element;
    dragSource: ReactElement<any>;
}

/** Properties for [[DragSource]] component. */
export interface IDragSourceProps extends IDraggableProps
{
    payloadType?: string;
    payload?: any;
    sprite?: ReactElement<any>;

    onDragBegin?: (event: IPointerDragEvent) => void;
    onDragMove?: (event: IPointerDragEvent, dx: number, dy: number) => void;
    onDragEnd?: (event: IPointerDragEvent) => void;
}

export default class DragSource extends Draggable<IDragSourceProps>
{
    protected static defaultProps = {
        className: "ff-drag-source",
        payloadType: "",
        payload: undefined
    };

    spriteElement: HTMLElement;

    dragTarget: Element;
    dropTarget: Element;
    payloadType: string;
    payload: any;

    spriteOffsetX: number;
    spriteOffsetY: number;

    constructor(props: IDragSourceProps)
    {
        super(props);

        this.spriteElement = null;

        this.dragTarget = null;
        this.dropTarget = null;
        this.payloadType = props.payloadType;
        this.payload = props.payload;

        this.spriteOffsetX = 0;
        this.spriteOffsetY = 0;

        this.onSprite = this.onSprite.bind(this);
    }

    render()
    {
        const {
            className,
            style,
            sprite,
            children
        } = this.props;

        const props = {
            className,
            style: Object.assign({}, style, { touchAction: "none" }),
            ref: this.element,
            "touch-action": "none",
            onPointerDown: this.onPointerDown,
            onPointerMove: this.onPointerMove,
            onPointerUp: this.onPointerUp,
            onDoubleClick: this.onDoubleClick,
            onContextMenu: this.onContextMenu
        };

        return(
            <div {...props}>
                {children}
                <DragSprite
                    active={this.state.isDragging}
                    onSprite={this.onSprite} >

                    {sprite || children}
                </DragSprite>
            </div>
        );
    }

    protected onDragBegin(event: PointerEvent)
    {
        this.initSprite(event);
        this.moveSprite(event);

        this.dragTarget = null;
        this.dropTarget = null;

        if (this.props.onDragBegin) {
            const dragEvent = this.createPointerDragEvent(event);
            this.props.onDragBegin(dragEvent);
            this.payloadType = dragEvent.payloadType;
            this.payload = dragEvent.payload;
        }
    }

    protected onDragMove(event: PointerEvent, dx: number, dy: number)
    {
        this.moveSprite(event);
        this.updateDropTarget(event);

        if (this.props.onDragMove) {
            this.props.onDragMove(this.createPointerDragEvent(event), dx, dy);
        }
    }

    protected onDragEnd(event: PointerEvent)
    {
        if (this.dropTarget) {
            let dropEvent = new CustomEvent("ff-drop", {
                detail: this.createPointerDragEvent(event)
            });
            this.dropTarget.dispatchEvent(dropEvent);
        }

        if (this.props.onDragEnd) {
            this.props.onDragEnd(this.createPointerDragEvent(event));
        }

        this.dragTarget = null;
        this.dropTarget = null;
    }

    private onSprite(element: HTMLElement)
    {
        this.spriteElement = element;
    }

    private initSprite(event: PointerEvent)
    {
        if (this.element.current) {
            const rect = this.element.current.getBoundingClientRect();
            this.spriteOffsetX = rect.left - event.clientX;
            this.spriteOffsetY = rect.top - event.clientY;
        }
    }

    private moveSprite(event: PointerEvent)
    {
        if (this.spriteElement) {
            this.spriteElement.style.left = (event.clientX + this.spriteOffsetX) + "px";
            this.spriteElement.style.top = (event.clientY + this.spriteOffsetY) + "px";
        }
    }

    private updateDropTarget(event: PointerEvent)
    {
        let targetChanged = false;
        const dragTarget = document.elementFromPoint(event.clientX, event.clientY);

        if (dragTarget !== this.dragTarget) {

            this.dragTarget = dragTarget;
            let dropTarget = null;

            if (dragTarget) {
                // dispatch probe event to test if it gets caught while bubbling
                const dragEvent = this.createPointerDragEvent(event);
                dragEvent.dropTarget = null;

                const probeEvent = new CustomEvent("ff-dragprobe", {
                    detail: dragEvent,
                    bubbles: true
                });
                dragTarget.dispatchEvent(probeEvent);
                dropTarget = dragEvent.dropTarget;
            }

            if (dropTarget !== this.dropTarget) {
                targetChanged = true;

                if (this.dropTarget) {
                    const leaveEvent = new CustomEvent("ff-dragleave", {
                        detail: this.createPointerDragEvent(event)
                    });
                    this.dropTarget.dispatchEvent(leaveEvent);
                }

                this.dropTarget = dropTarget;

                if (this.dropTarget) {
                    const enterEvent = new CustomEvent("ff-dragenter", {
                        detail: this.createPointerDragEvent(event)
                    });
                    this.dropTarget.dispatchEvent(enterEvent);
                }
            }
        }

        if (!targetChanged && this.dropTarget) {
            const updateEvent = new CustomEvent("ff-dragupdate", {
                detail: this.createPointerDragEvent(event)
            });
            this.dropTarget.dispatchEvent(updateEvent);
        }
    }

    private createPointerDragEvent(event: PointerEvent): IPointerDragEvent
    {
        let dragEvent = Object.assign({}, event) as IPointerDragEvent;

        dragEvent.payloadType = this.payloadType;
        dragEvent.payload = this.payload;
        dragEvent.dragSource = this as any;
        dragEvent.dropTarget = this.dropTarget;

        return dragEvent;
    }
}