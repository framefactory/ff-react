/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";
import { IPointerDragEvent } from "./DragSource";

////////////////////////////////////////////////////////////////////////////////

export { IPointerDragEvent } from "./DragSource";

/** Properties for [[DropTarget]] component. */
export interface IDropTargetProps
{
    className?: string;
    style?: CSSProperties;
    title?: string;
    payloadTypes?: string[];

    onDragEnter?: (event: IPointerDragEvent) => void;
    onDragUpdate?: (event: IPointerDragEvent) => void;
    onDragLeave?: (event: IPointerDragEvent) => void;
    onDrop?: (event: IPointerDragEvent) => void;
}

export default class DropTarget extends React.Component<IDropTargetProps, any>
{
    static defaultProps: IDropTargetProps = {
        className: "drop-target",
        payloadTypes: []
    };

    element: HTMLElement;

    constructor(props: IDropTargetProps)
    {
        super(props);

        this.onRef = this.onRef.bind(this);
        this.onDragProbe = this.onDragProbe.bind(this);
        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragUpdate = this.onDragUpdate.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);
    }

    render()
    {
        const {
            className,
            style,
            title,
            children
        } = this.props;

        return (<div
            className={className}
            style={style}
            title={title}
            ref={this.onRef} >
            {children}
        </div>);
    }

    private onRef(element: HTMLElement)
    {
        if (element) {
            this.addListeners(element);
        }
        else if (this.element) {
            this.removeListeners(this.element);
        }

        this.element = element;

    }

    private onDragProbe(event: CustomEvent)
    {
        const dragEvent = event.detail as IPointerDragEvent;

        // if dragged mime type is acceptable, promote self as drop target
        if (this.props.payloadTypes.indexOf(dragEvent.payloadType) > -1) {
            dragEvent.dropTarget = this.element;
            event.preventDefault();
        }
    }

    private onDragEnter(event: CustomEvent)
    {
        const dragEvent = event.detail as IPointerDragEvent;

        if (this.props.onDragEnter) {
            this.props.onDragEnter(dragEvent);
        }

       //this.element.style.outline = "1px solid red";
    }

    private onDragUpdate(event: CustomEvent)
    {
        const dragEvent = event.detail as IPointerDragEvent;

        if (this.props.onDragUpdate) {
            this.props.onDragUpdate(dragEvent);
        }
    }

    private onDragLeave(event: CustomEvent)
    {
        const dragEvent = event.detail as IPointerDragEvent;

        if (this.props.onDragLeave) {
            this.props.onDragLeave(dragEvent);
        }

        //this.element.style.outline = "none";
    }

    private onDrop(event: CustomEvent)
    {
        const dragEvent = event.detail as IPointerDragEvent;

        if (this.props.onDrop) {
            this.props.onDrop(dragEvent);
        }

        //this.element.style.outline = "1px solid white";
    }

    private addListeners(target: HTMLElement)
    {
        target.addEventListener("react-dragprobe", this.onDragProbe);
        target.addEventListener("react-dragenter", this.onDragEnter);
        target.addEventListener("react-dragupdate", this.onDragUpdate);
        target.addEventListener("react-dragleave", this.onDragLeave);
        target.addEventListener("react-drop", this.onDrop);
    }

    private removeListeners(target: HTMLElement)
    {
        target.removeEventListener("react-dragprobe", this.onDragProbe);
        target.removeEventListener("react-dragenter", this.onDragEnter);
        target.removeEventListener("react-dragupdate", this.onDragUpdate);
        target.removeEventListener("react-dragleave", this.onDragLeave);
        target.removeEventListener("react-drop", this.onDrop);
    }
}