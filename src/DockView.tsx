/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";

import ComponentFactory from "./ComponentFactory";
import { SplitterContainer, SplitterSection, ISplitterContainerResizeEvent } from "./Splitter";
import { ITabCloseEvent, ITabSelectEvent, TabItem } from "./TabContainer";

import DockTabContainer, { IDockTabDropEvent } from "./DockTabContainer";

import DockController, {
    DockActions,
    IDockSplitLayout,
    IDockStackLayout
} from "./DockController";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[DockableView]] component. */
export interface IDockViewProps
{
    id?: string;
    className?: string;
    controller: DockController;
    factory: ComponentFactory;
}

export default class DockView extends React.Component<IDockViewProps, {}>
{
    static defaultProps: Partial<IDockViewProps> = {
        className: "ff-dock-view",
    };

    protected readonly actions: DockActions;

    constructor(props: IDockViewProps)
    {
        super(props);

        this.onControllerChange = this.onControllerChange.bind(this);
        this.onTabSelect = this.onTabSelect.bind(this);
        this.onTabClose = this.onTabClose.bind(this);
        this.onTabDrop = this.onTabDrop.bind(this);
        this.onSplitterResize = this.onSplitterResize.bind(this);

        this.actions = props.controller.actions;
    }
    
    onControllerChange()
    {
        this.forceUpdate();
    }

    componentDidMount()
    {
        this.props.controller.on("change", this.onControllerChange);
    }

    componentWillUnmount()
    {
        this.props.controller.off("change", this.onControllerChange);
    }

    protected renderSplit(layout: IDockSplitLayout)
    {
        const children = layout.sections.map((section, index) => {
            return (<SplitterSection
                id={section.id}
                key={section.id}
                size={section.size}>

                {section.type === "split" ? this.renderSplit(section) : this.renderStack(section)}
            </SplitterSection>)
        });

        return (<SplitterContainer
            id={layout.id}
            key={layout.id}
            direction={layout.direction}
            onResize={this.onSplitterResize}>

            {children}
        </SplitterContainer>)
    }

    protected renderStack(layout: IDockStackLayout)
    {
        const children = layout.panes.map(pane => {
            return (<TabItem
                id={pane.id}
                key={pane.id}
                text={pane.title}
                closable={pane.closable}
                movable={pane.movable}>

                {this.props.factory.create(pane.componentId)}
            </TabItem>);
        });

        const activeTabId = layout.activePaneId || (layout.panes[0] && layout.panes[0].id);

        return (<DockTabContainer
            activeTabId={activeTabId}
            onTabSelect={this.onTabSelect}
            onTabClose={this.onTabClose}
            onTabDrop={this.onTabDrop}>

            {children}
        </DockTabContainer>);
    }

    render()
    {
        const {
            className,
            controller
        } = this.props;
        
        const layout = controller.getLayout();

        if (layout) {
            return (<div
                className={className}>

                {layout.type === "split" ?
                    this.renderSplit(layout) :
                    this.renderStack(layout)}
            </div>);
        }
        else {
            console.warn("DockView.render - missing layout");
            return null;
        }
    }

    protected onTabSelect(event: ITabSelectEvent)
    {
        //console.log("onTabSelect", event);

        this.actions.activatePane(event.tabId);
    }

    protected onTabClose(event: ITabCloseEvent)
    {
        //console.log("onTabClose", event);

        this.actions.removePane(event.tabId);
    }

    protected onTabDrop(event: IDockTabDropEvent)
    {
        //console.log("onTabDrop", event);

        const dockArea = event.dockArea || "insert";
        this.actions.movePane(event.sourceTabId, event.tabId, dockArea);
    }

    protected onSplitterResize(event: ISplitterContainerResizeEvent)
    {
        this.actions.resize(event.id, event.index, event.sizes[0], event.sizes[1]);
    }
}
