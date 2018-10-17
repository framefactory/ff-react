/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { ReactElement } from "react";

import { ITabHeaderSelectEvent } from "./TabHeader";
import TabContainer, { ITabContainerProps, ITabDropEvent } from "./TabContainer";

import { DockTabContentContainer, IDockTabContentDropEvent } from "./DockTabContent";
import { DockArea } from "./DockSprite";

////////////////////////////////////////////////////////////////////////////////

export interface IDockTabDropEvent extends ITabDropEvent { dockArea: DockArea }

export interface IDockTabContainerProps extends ITabContainerProps
{
    onTabDrop?: (event: IDockTabDropEvent) => void;
}

export default class DockTabContainer extends TabContainer<IDockTabContainerProps>
{
    static readonly defaultProps: Partial<IDockTabContainerProps> = {
        className: "dockable-tab-container"
    };

    constructor(props: IDockTabContainerProps)
    {
        super(props);

        this.onSelect = this.onSelect.bind(this);
        this.onDockableDrop = this.onDockableDrop.bind(this);
    }

    protected getContentContainer(children: ReactElement<any>[])
    {
        return (<DockTabContentContainer
            className="content"
            onDrop={this.onDockableDrop}>
            {children}
        </DockTabContentContainer>);
    }

    protected onSelect(event: ITabHeaderSelectEvent)
    {
        const { id, index, onTabSelect } = this.props;

        if (onTabSelect) {
            onTabSelect({ tabId: event.id, id, index, sender: this });
        }
    }

    protected onDockableDrop(event: IDockTabContentDropEvent)
    {
        const { id, index, onTabDrop } = this.props as IDockTabContainerProps;

        if (onTabDrop) {
            onTabDrop({
                sourceTabId: event.sourceTabId,
                tabId: this.state.activeTabId,
                dockArea: event.dockArea,
                id,
                index,
                sender: this
            });
        }
    }
}
