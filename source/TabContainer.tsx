/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { ReactElement } from "react";

import FlexContainer from "./FlexContainer";

import {
    TabHeaderContainer,
    TabHeaderItem,
    ITabHeaderCloseEvent,
    ITabHeaderDropEvent,
    ITabHeaderSelectEvent
} from "./TabHeader";

import {
    TabContentContainer,
    TabContentItem
} from "./TabContent";
import { IComponentEvent, IComponentProps } from "./common";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[TabItem]] component. */
export interface ITabItemProps
{
    /** Unique identifier. */
    id: string;
    /** Text displayed in the tab header. */
    text?: string;
    /** Icon displayed in the tab header, in front of the text. */
    icon?: string;
    /** Font Awesome icon displayed in the tab header, in front of the text. */
    faIcon?: string;
    /** Tooltip text */
    title?: string;
    /** If true, tab header displays a close button. Default is true. */
    closable?: boolean;
    /** If true, tab header can be dragged and rearranged. Default is true. */
    movable?: boolean;
}

/**
 *
 * @param {ITabItemProps & {children?: React.ReactNode}} props
 * @returns {React.DOMElement<ITabItemProps & {children?: React.ReactNode}, Element>}
 * @constructor
 */
export const TabItem: React.SFC<ITabItemProps> = function(props)
{
    return React.createElement("", props, props.children);
};

export interface ITabSelectEvent extends IComponentEvent<TabContainer> { tabId: string; }
export interface ITabCloseEvent extends ITabSelectEvent {}
export interface ITabDropEvent extends ITabSelectEvent { sourceTabId: string }

/** Properties for [[TabContainer]] component. */
export interface ITabContainerProps extends IComponentProps
{
    activeTabId?: string;
    onTabSelect?: (event: ITabSelectEvent) => void;
    onTabClose?: (event: ITabCloseEvent) => void;
    onTabDrop?: (event: ITabDropEvent) => void;
}

interface ITabContainerState
{
    activeTabId: string;
}

export default class TabContainer<P extends ITabContainerProps = ITabContainerProps>
    extends React.Component<ITabContainerProps, ITabContainerState>
{
    static readonly defaultProps: Partial<ITabContainerProps> = {
        className: "tab-container",
    };

    static getDerivedStateFromProps(props)
    {
        return { activeTabId: props.activeTabId };
    }

    constructor(props: P)
    {
        super(props);

        this.onSelect = this.onSelect.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onDrop = this.onDrop.bind(this);

        this.state = {
            activeTabId: props.activeTabId
        };
    }

    protected getHeaderContainer(children: ReactElement<any>[])
    {
        return (<TabHeaderContainer
            className="header">

            {children}
        </TabHeaderContainer>);
    }

    protected getContentContainer(children: ReactElement<any>[])
    {
        return (<TabContentContainer
            className="content">

            {children}
        </TabContentContainer>);
    }

    protected getHeaderItem(item: ReactElement<ITabItemProps>, isActive: boolean)
    {
        return (<TabHeaderItem
            className="header-item"
            key={item.props.id}
            id={item.props.id}
            text={item.props.text}
            icon={item.props.icon}
            faIcon={item.props.faIcon}
            title={item.props.title}
            closable={item.props.closable}
            movable={item.props.movable}
            active={isActive}
            onSelect={this.onSelect}
            onClose={this.onClose}
            onDrop={this.onDrop}
        />);
    }

    protected getContentItem(item: ReactElement<ITabItemProps>, isActive: boolean)
    {
        return (<TabContentItem
            className="content-item"
            key={item.props.id}
            active={isActive}>

            {item.props["children"]}
        </TabContentItem>);
    }

    render()
    {
        const props = this.props;

        const {
            className,
            children
        } = props;

        const activeTabId = this.state.activeTabId;

        const childrenArray = Array.isArray(children) ? children : [ children ];
        const tabItems = childrenArray.filter((item: any) => item.type === TabItem);

        const headerItems = tabItems.map((item: ReactElement<ITabItemProps>) => {
            const isActive = item.props.id === activeTabId;
            return this.getHeaderItem(item, isActive);
        });

        const contentItems = tabItems.map((item: ReactElement<ITabItemProps>) => {
            const isActive = item.props.id === activeTabId;
            return this.getContentItem(item, isActive);
        });

        return (
            <FlexContainer
                className={className}
                direction="vertical"
                position="fill">

                {this.getHeaderContainer(headerItems)}
                {this.getContentContainer(contentItems)}

            </FlexContainer>
        );
    }

    protected onSelect(event: ITabHeaderSelectEvent)
    {
        this.setState({ activeTabId: event.id });

        const { id, index, onTabSelect } = this.props;

        if (onTabSelect) {
            onTabSelect({ tabId: event.id, id, index, sender: this });
        }
    }

    protected onClose(event: ITabHeaderCloseEvent)
    {
        const { id, index, onTabClose } = this.props;

        if (onTabClose) {
            onTabClose({ tabId: event.id, id, index, sender: this });
        }
    }

    protected onDrop(event: ITabHeaderDropEvent)
    {
        const { id, index, onTabDrop } = this.props;

        if (onTabDrop) {
            onTabDrop({ sourceTabId: event.sourceTabId, tabId: event.id, id, index, sender: this });
        }
    }
}