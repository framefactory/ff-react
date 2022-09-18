/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
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
    id?: string;
    /** Unique numeric index. */
    index?: number;
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

export interface ITabSelectEvent extends IComponentEvent<TabContainer>
{
    tabId: string;
    tabIndex: number;
}

export interface ITabCloseEvent extends ITabSelectEvent {}

export interface ITabDropEvent extends ITabSelectEvent
{
    sourceTabId: string;
    sourceTabIndex: number;
}

/** Properties for [[TabContainer]] component. */
export interface ITabContainerProps extends IComponentProps
{
    activeTabId?: string;
    activeTabIndex?: number;
    onTabSelect?: (event: ITabSelectEvent) => void;
    onTabClose?: (event: ITabCloseEvent) => void;
    onTabDrop?: (event: ITabDropEvent) => void;
}

interface ITabContainerState
{
    activeTabId: string;
    activeTabIndex: number;
}

export default class TabContainer<P extends ITabContainerProps = ITabContainerProps>
    extends React.Component<ITabContainerProps, ITabContainerState>
{
    static readonly defaultProps: Partial<ITabContainerProps> = {
        className: "ff-tab-container",
    };

    static getDerivedStateFromProps(props)
    {
        return {
            activeTabId: props.activeTabId,
            activeTabIndex: props.activeTabIndex
        };
    }

    constructor(props: P)
    {
        super(props);

        this.onSelect = this.onSelect.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onDrop = this.onDrop.bind(this);

        this.state = {
            activeTabId: props.activeTabId,
            activeTabIndex: props.activeTabIndex
        };
    }

    protected renderHeaderContainer(children: ReactElement<any>[])
    {
        return (<TabHeaderContainer>
            {children}
        </TabHeaderContainer>);
    }

    protected renderContentContainer(children: ReactElement<any>[])
    {
        return (<TabContentContainer>
            {children}
        </TabContentContainer>);
    }

    protected renderHeaderItem(item: ReactElement<ITabItemProps>, isActive: boolean)
    {
        const { id, index, text, icon, faIcon, title, closable, movable } = item.props;

        if (id === undefined && index === undefined) {
            throw new Error("either id or index property must be provided");
        }

        return (<TabHeaderItem
            key={id || index}
            id={id}
            index={index}
            text={text}
            icon={icon}
            faIcon={faIcon}
            title={title}
            closable={closable}
            movable={movable}
            active={isActive}
            onSelect={this.onSelect}
            onClose={this.onClose}
            onDrop={this.onDrop}
        />);
    }

    protected renderContentItem(item: ReactElement<ITabItemProps>, isActive: boolean)
    {
        const { id, index } = item.props;

        return (<TabContentItem
            key={id || index}
            id={id}
            index={index}
            active={isActive}>

            {item.props["children"]}
        </TabContentItem>);
    }

    render()
    {
        const {
            className,
            children
        } = this.props;

        const {
            activeTabId,
            activeTabIndex
        } = this.state;


        const childrenArray = Array.isArray(children) ? children : [ children ];
        const tabItems = childrenArray.filter((item: any) => item.type === TabItem);

        const headerItems = tabItems.map((item: ReactElement<ITabItemProps>) => {
            const { id, index } = item.props;
            const isActive = activeTabId ? id === activeTabId : index === activeTabIndex;
            return this.renderHeaderItem(item, isActive);
        });

        const contentItems = tabItems.map((item: ReactElement<ITabItemProps>) => {
            const { id, index } = item.props;
            const isActive = activeTabId ? id === activeTabId : index === activeTabIndex;
            return this.renderContentItem(item, isActive);
        });

        return (
            <FlexContainer
                className={className}
                direction="vertical"
                position="fill">

                {this.renderHeaderContainer(headerItems)}
                {this.renderContentContainer(contentItems)}

            </FlexContainer>
        );
    }

    protected onSelect(event: ITabHeaderSelectEvent)
    {
        this.setState({ activeTabId: event.id, activeTabIndex: event.index });

        const { id, index, onTabSelect } = this.props;

        if (onTabSelect) {
            onTabSelect({ tabId: event.id, tabIndex: event.index, id, index, sender: this });
        }
    }

    protected onClose(event: ITabHeaderCloseEvent)
    {
        const { id, index, onTabClose } = this.props;

        if (onTabClose) {
            onTabClose({ tabId: event.id, tabIndex: event.index, id, index, sender: this });
        }
    }

    protected onDrop(event: ITabHeaderDropEvent)
    {
        const { id, index, onTabDrop } = this.props;

        if (onTabDrop) {
            onTabDrop({
                sourceTabId: event.sourceTabId,
                sourceTabIndex: event.sourceTabIndex,
                tabId: event.id,
                tabIndex: event.index,
                id,
                index,
                sender: this
            });
        }
    }
}