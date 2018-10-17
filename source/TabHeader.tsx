/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import { IComponentEvent, IComponentProps } from "./common";
import Button from "./Button";
import DragSource from "./DragSource";
import DropTarget, { IPointerDragEvent } from "./DropTarget";

////////////////////////////////////////////////////////////////////////////////

export interface ITabHeaderContainerProps extends IComponentProps
{
}

export class TabHeaderContainer extends React.Component<ITabHeaderContainerProps, {}>
{
    static readonly defaultProps: Partial<ITabHeaderContainerProps> = {
        className: "tab-header-container"
    };

    protected static readonly style: CSSProperties = {
        whiteSpace: "nowrap"
    };

    render()
    {
        const {
            className,
            style,
            children
        } = this.props;

        const styles = Object.assign({}, TabHeaderContainer.style, style);

        return (<div
            className={className}
            style={styles}>
            {children}
        </div>);
    }
}

export interface ITabHeaderSelectEvent extends IComponentEvent<TabHeaderItem> { id: string }
export interface ITabHeaderCloseEvent extends IComponentEvent<TabHeaderItem> { id: string }
export interface ITabHeaderDropEvent extends IComponentEvent<TabHeaderItem> { id: string, sourceTabId: string }


export interface ITabHeaderItemProps extends IComponentProps
{
    id: string;
    text?: string;
    icon?: string;
    faIcon?: string;
    title?: string;
    closable?: boolean;
    movable?: boolean;
    active?: boolean;
    onSelect?: (event: ITabHeaderSelectEvent) => void;
    onClose?: (event: ITabHeaderCloseEvent) => void;
    onDrop?: (event: ITabHeaderDropEvent) => void;
}

export class TabHeaderItem extends React.Component<ITabHeaderItemProps, {}>
{
    static defaultProps: Partial<ITabHeaderItemProps> = {
        className: "tab-header-item",
        active: false
    };

    private static style: CSSProperties = {
        display: "inline-block",
        whiteSpace: "nowrap"
    };

    private static contentStyle: CSSProperties = {
        display: "inline-block",
        whiteSpace: "nowrap",
        cursor: "pointer"
    };

    private static buttonsStyle: CSSProperties = {
        display: "inline-block"
    };

    constructor(props: ITabHeaderItemProps)
    {
        super(props);

        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);

        this.onSelect = this.onSelect.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onDrop = this.onDrop.bind(this);
    }

    render()
    {
        const {
            id,
            className,
            style,
            text,
            icon,
            faIcon,
            title,
            closable,
            movable,
            active
        } = this.props;

        const classes = active ? className + " active" : className;

        const styles = Object.assign({}, TabHeaderItem.style, style);
        const contentStyle = TabHeaderItem.contentStyle;
        const buttonStyle = TabHeaderItem.buttonsStyle;

        const hasCloseButton = closable !== false;
        const hasMoveGrip = movable !== false;
        const canDrag = movable !== false;

        return (<DropTarget
            className={classes}
            style={styles}
            title={title}
            payloadTypes={["flow/tab-header"]}
            onDragEnter={this.onDragEnter}
            onDragLeave={this.onDragLeave}
            onDrop={this.onDrop}>

            <DragSource
                id={id}
                draggable={canDrag}
                payload={id}
                payloadType={"flow/tab-header"}
                onTap={this.onSelect}>

                    {icon ? <span className={"content icon " + icon} style={contentStyle} /> : null}
                    {faIcon ? <span className={"content icon fa fas fa-" + faIcon} style={contentStyle} /> : null}
                    {text ? <span className="content text" style={contentStyle}>{text}</span> : null}

                {hasCloseButton ?
                    <Button
                        className="content button"
                        id={id}
                        style={buttonStyle}
                        faIcon="times"
                        onTap={this.onClose} /> : null}
                {hasMoveGrip &&! hasCloseButton ?
                    <Button
                        className="content button"
                        id={id}
                        style={buttonStyle}
                        disabled={true}
                        faIcon="th" /> : null}
            </DragSource>
        </DropTarget>);
    }

    private onDragEnter()
    {
    }

    private onDragLeave()
    {
    }

    protected onSelect()
    {
        const { id, index, onSelect } = this.props;

        if (onSelect) {
            onSelect({ id, index, sender: this });
        }
    }

    protected onClose()
    {
        const { id, index, onClose } = this.props;

        if (onClose) {
            onClose({ id, index, sender: this });
        }
    }

    private onDrop(event: IPointerDragEvent)
    {
        const { id, index, onDrop } = this.props;

        if (onDrop) {
            onDrop({ sourceTabId: event.payload, id, index, sender: this });
        }
    }

}