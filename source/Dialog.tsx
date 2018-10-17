/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties, MouseEvent, KeyboardEvent } from "react";

import * as ReactDOM from "react-dom";
import { IComponentEvent, IComponentProps } from "./common";

////////////////////////////////////////////////////////////////////////////////

export interface IAnchorProps
{
    elementRef?: React.RefObject<HTMLDivElement>;
}

export class Anchor extends React.Component<IAnchorProps, {}>
{
    render()
    {
        const child = React.Children.only(this.props.children);
        return React.cloneElement(child, { ref: this.props.elementRef });
    }
}

export interface IDialogTapModal extends IComponentEvent<Dialog> { }

/** Properties for [[Dialog]] component. */
export interface IDialogProps extends IComponentProps
{
    visible?: boolean;
    modal?: boolean;

    portal?: React.Component<any, any>;
    anchor?: "left" | "right" | "top" | "bottom";
    justify?: "start" | "end" | "center",
    align?: "start" | "end" | "center",

    onTapModal?: (event: IDialogTapModal) => void;
}

/**
 * Provides a freely placeable dialog container. The dialog can be displayed modal or non-modal.
 * An event reports when the user clicks outside of the dialog area.
 */
export default class Dialog extends React.Component<IDialogProps, {}>
{
    static readonly defaultProps: IDialogProps = {
        className: "dialog"
    };

    protected static readonly style: CSSProperties = {
        position: "absolute",
        zIndex: 1000
    };

    protected static readonly modalStyle: CSSProperties = {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1000
    };

    /** div container for the dialog component. */
    public dialogElement: HTMLDivElement;
    /** the anchor's html element if an anchor is provided by client. */
    public anchorElement: HTMLElement;
    /** the modal plane if the dialog is to be presented modal. */
    public modalElement: HTMLDivElement;

    /** The dialog is always displayed within the portal element. */
    protected portalElement: HTMLElement;
    /** A root element for the dialog appended to the top-level document. */
    protected parentElement: HTMLElement;


    constructor(props: IDialogProps)
    {
        super(props);

        this.onRefAnchor = this.onRefAnchor.bind(this);
        this.onRefDialog = this.onRefDialog.bind(this);
        this.onRefModalPlane = this.onRefModalPlane.bind(this);
        this.onModalPlaneClick = this.onModalPlaneClick.bind(this);
        this.onModalPlaneKeyPress = this.onModalPlaneKeyPress.bind(this);
        this.calculateLayout = this.calculateLayout.bind(this);

        this.dialogElement = null;
        this.anchorElement = null;
        this.modalElement = null;
        this.portalElement = null;

        // create a dom element serving as attachment point for the dialog element.
        this.parentElement = document.createElement("div");
    }

    componentDidMount()
    {
        // append the dialog's parent element to the dom
        document.body.appendChild(this.parentElement);

        // start listening for resize events in order to update the layout
        window.addEventListener("resize", this.calculateLayout);

        if (this.props.portal) {
            const portalElement = ReactDOM.findDOMNode(this.props.portal);
            if (portalElement instanceof HTMLElement) {
                this.portalElement = portalElement;
            }
        }
    }

    componentDidUpdate()
    {
        this.calculateLayout();
    }

    componentWillUnmount()
    {
        // remove the dialog's parent element from the dom
        document.body.removeChild(this.parentElement);

        // stop listening for resize events
        window.removeEventListener("resize", this.calculateLayout);

        this.portalElement = null;
        this.anchorElement = null;
    }

    render()
    {
        const {
            className,
            style,
            visible,
            modal,
            children
        } = this.props;

        const styles = Object.assign({}, Dialog.style, style);

        // if an anchor component is provided, it must be first in list of children
        const childArray = React.Children.toArray(children);
        let anchorChild = null;
        let dialogChildren = childArray;

        if (childArray.length > 0 && childArray[0]["type"] === Anchor) {
            anchorChild = React.cloneElement(childArray[0] as React.ReactElement<any>, { elementRef: this.onRefAnchor });
            dialogChildren = childArray.slice(1);
        }

        let dialog = null;
        if (visible) {
            const dialogFrame = (
                <div
                    ref={this.onRefDialog}
                    className={className}
                    style={styles}>

                    {dialogChildren}
                </div>
            );

            dialog = modal ? (
                <div
                    ref={this.onRefModalPlane}
                    className={className + " modal"}
                    style={Dialog.modalStyle}
                    onClick={this.onModalPlaneClick}
                    onKeyUp={this.onModalPlaneKeyPress}>
                    {dialogFrame}
                </div>
            ) : dialogFrame;
        }

        const dialogPortal = visible ? ReactDOM.createPortal(dialog, this.parentElement) : null;

        return (
            <React.Fragment>
                {anchorChild}
                {dialogPortal}
            </React.Fragment>
        );
    }

    protected onRefAnchor(component: Anchor)
    {
        if (component) {
            const anchorElement = ReactDOM.findDOMNode(component);
            if (anchorElement instanceof HTMLElement) {
                this.anchorElement = anchorElement;
            }
        }
        else {
            this.anchorElement = null;
        }
    }

    protected onRefDialog(element: HTMLDivElement)
    {
        this.dialogElement = element;
    }

    protected onRefModalPlane(element: HTMLDivElement)
    {
        this.modalElement = element;
    }

    protected onModalPlaneClick(event: MouseEvent<HTMLDivElement>)
    {
        // if event is bubbling from dialog, do nothing
        if (event.target !== this.modalElement) {
            return;
        }

        const { id, index, onTapModal } = this.props;

        // report tap on modal plane
        if (onTapModal) {
            onTapModal({ id, index, sender: this });
        }
    }

    protected onModalPlaneKeyPress(event: KeyboardEvent<HTMLDivElement>)
    {
        const { id, index, onTapModal } = this.props;

        // if escape key pressed
        if (event.keyCode === 27 && onTapModal) {
            // report tap on modal plane
            onTapModal({ id, index, sender: this });
        }
    }

    protected calculateLayout()
    {
        const dialogElement = this.dialogElement;

        if (!dialogElement) {
            return;
        }

        const dialogRect = dialogElement.getBoundingClientRect();

        let {
            anchor,
            justify,
            align
        } = this.props;

        let dialogX = 0;
        let dialogY = 0;

        const dlgOffsetX = justify === "start" ? 0 : (justify === "end" ? dialogRect.width : dialogRect.width * 0.5);
        const dlgOffsetY = align === "start" ? 0 : (align === "end" ? dialogRect.height : dialogRect.height * 0.5);

        if (this.anchorElement) {
            const anchorRect = this.anchorElement.getBoundingClientRect();
            let anchorOffsetX = 0;
            let anchorOffsetY = 0;

            if (!justify) {
                justify = anchor === "left" ? "start" : (anchor === "right" ? "start" : "center");
            }
            if (!align) {
                align = anchor === "top" ? "start" : (anchor === "bottom" ? "start" : "center");
            }

            switch(justify) {
                case "start":
                    anchorOffsetX = 0; break;
                case "end":
                    anchorOffsetX = anchorRect.width; break;
                case "center":
                    anchorOffsetX = anchorRect.width * 0.5; break;
            }

            switch(align) {
                case "start":
                    anchorOffsetY = 0; break;
                case "end":
                    anchorOffsetY = anchorRect.height; break;
                case "center":
                    anchorOffsetY = anchorRect.height * 0.5; break;
            }

            switch(anchor) {
                case "left":
                    dialogX = anchorRect.left - dialogRect.width;
                    dialogY = anchorRect.top + anchorOffsetY - dlgOffsetY;
                    break;
                case "right":
                    dialogX = anchorRect.right;
                    dialogY = anchorRect.top + anchorOffsetY - dlgOffsetY;
                    break;
                case "top":
                    dialogX = anchorRect.left + anchorOffsetX - dlgOffsetX;
                    dialogY = anchorRect.top - dialogRect.height;
                    break;
                case "bottom":
                    dialogX = anchorRect.left + anchorOffsetX - dlgOffsetX;
                    dialogY = anchorRect.bottom;
            }
        }
        else {
            switch (justify) {
                case "start":
                    dialogX = 0; break;
                case "end":
                    dialogX = window.innerWidth - dialogRect.width; break;
                default:
                    dialogX = (window.innerWidth - dialogRect.width) * 0.5; break;
            }

            switch(align) {
                case "start":
                    dialogY = 0; break;
                case "end":
                    dialogY = window.innerHeight - dialogRect.height; break;
                default:
                    dialogY = (window.innerHeight - dialogRect.height) * 0.5; break;
            }
        }

        // keep inside portal element
        if (this.portalElement) {
            const portalRect = this.portalElement.getBoundingClientRect();
            dialogX = Math.max(portalRect.left, dialogX);
            dialogX = Math.min(portalRect.right - dialogRect.width, dialogX);
            dialogY = Math.max(portalRect.top, dialogY);
            dialogY = Math.min(portalRect.bottom - dialogRect.height, dialogY);
        }

        dialogElement.style.left = dialogX + "px";
        dialogElement.style.top = dialogY + "px";
    }
}