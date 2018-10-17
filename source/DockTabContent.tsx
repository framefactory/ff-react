/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import { IComponentEvent, IComponentProps } from "./common";
import FlexItem from "./FlexItem";
import DropTarget, { IPointerDragEvent } from "./DropTarget";

import DockSprite, { DockArea } from "./DockSprite";

////////////////////////////////////////////////////////////////////////////////

export interface IDockTabContentDropEvent extends IComponentEvent<DockTabContentContainer>
{
    sourceTabId: string;
    dockArea: DockArea;
}

/** Properties for [[DockableTabContent]] component. */
export interface IDockTabContentContainerProps extends IComponentProps
{
    onDrop?: (event: IDockTabContentDropEvent) => void;
}

interface IDockTabContentContainerState
{
    dockArea: DockArea;
}

export class DockTabContentContainer
    extends React.Component<IDockTabContentContainerProps, IDockTabContentContainerState>
{
    static readonly defaultProps: Partial<IDockTabContentContainerProps> = {
        className: "dockable-tab-content-container"
    };

    protected static readonly style: CSSProperties = {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0
    };

    constructor(props: IDockTabContentContainerProps)
    {
        super(props);

        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragUpdate = this.onDragUpdate.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);

        this.state = {
            dockArea: "none"
        };
    }

    render()
    {
        const {
            className,
            children
        } = this.props;

        return (<FlexItem>
            <DropTarget
                className={className}
                style={DockTabContentContainer.style}
                payloadTypes={["flow/tab-header"]}
                onDragEnter={this.onDragEnter}
                onDragUpdate={this.onDragUpdate}
                onDragLeave={this.onDragLeave}
                onDrop={this.onDrop} >

                {children}
            </DropTarget>

            <DockSprite
                dockArea={this.state.dockArea} />

        </FlexItem>);
    }

    private onDragEnter(event: IPointerDragEvent)
    {
        this.updateSprite(event, true);
    }

    private onDragUpdate(event: IPointerDragEvent)
    {
        this.updateSprite(event, true);
    }

    private onDragLeave(event: IPointerDragEvent)
    {
        this.updateSprite(event, false);
    }

    private onDrop(event: IPointerDragEvent)
    {
        const state = this.state;
        const { id, index, onDrop } = this.props;

        if (state.dockArea !== "none" && onDrop) {
            this.props.onDrop({
                sourceTabId: event.payload,
                dockArea: state.dockArea,
                id,
                index,
                sender: this
            });
        }

        this.updateSprite(event, false);
    }

    private updateSprite(event: IPointerDragEvent, isTargeted: boolean)
    {
        let dockArea: DockArea = "none";

        if (isTargeted) {
            const targetRect = event.dropTarget.getBoundingClientRect();
            const x = (event.clientX - targetRect.left) / targetRect.width;
            const y = (event.clientY - targetRect.top) / targetRect.height;

            if (x > 0.33 && x < 0.67 && y > 0.33 && y < 0.67) {
                dockArea = "center";
            }
            else if (x < y) {
                dockArea = (x + y < 1) ? "left" : "bottom";
            }
            else {
                dockArea = (x + y < 1) ? "top" : "right";
            }
        }

        this.setState({ dockArea });
    }
}
