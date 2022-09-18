/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties, ReactElement } from "react";

import { IComponentEvent } from "./common";
import Draggable, { PointerEvent } from "./Draggable";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[SplitterSection]] component. */
export interface ISplitterSectionProps
{
    /** Unique identifier. */
    id?: string;
    /** Custom class name(s). Overrides the default class name 'splitter-section'. */
    className?: string;
    /** Relative size of the section with respect to all other sections of the splitter container.
     *  The sizes of all sections in a container should add up to 1 (or "100%"). */
    size?: string | number;
    /** Unique key for the section. If not added, will be added automatically by the container. */
    key?: string;
}

/**
 * Each content section of a splitter must be wrapped in a splitter section.
 * A splitter container contains two or more splitter sections. The container
 * automatically adds splitter handles between sections, so they become
 * resizable.
 */
export class SplitterSection extends React.Component<ISplitterSectionProps, any>
{
    static defaultProps: Partial<ISplitterSectionProps> = {
        className: "ff-splitter-section",
    };

    protected static sectionStyle: CSSProperties = {
        position: "relative",
        flex: "1 1 0%",
        overflow: "hidden"
    };

    render()
    {
        const props = this.props;

        let sectionStyle = Object.assign({}, SplitterSection.sectionStyle);
        sectionStyle.flexBasis = props.size || "0%";

        return (<div
            className={props.className}
            style={sectionStyle}>
            {props.children}
        </div>);
    }
}

type SplitterSectionElement = ReactElement<ISplitterSectionProps>;

////////////////////////////////////////////////////////////////////////////////

/**
 * Fired while a splitter handle is moved.
 * @event ISplitterContainerResizeEvent
 */
export interface ISplitterContainerResizeEvent extends IComponentEvent<SplitterContainer>
{
    /** Zero-based index of the first splitter section (left/top of the handle). */
    index: number;
    /** Array with the IDs of the sections adjacent to the handle being moved. */
    sectionIds: [ string, string ],
    /** Array with the size of the two sections adjacent to the handle being moved. */
    sizes: [ number, number ],
    /** True while the user is dragging. When the user stops dragging, one last event
     *  is sent with this property set to false. */
    isDragging: boolean;
}

/** Properties for [[SplitterContainer]] component. */
export interface ISplitterContainerProps
{
    /** Unique identifier. */
    id?: string;
    /** Custom class name(s). Overrides the default class name 'splitter-section'. */
    className?: string;
    /** Layout of the splitter container: "horizontal" lays out the sections in a row,
     *  "vertical" lays them out in a column.
     */
    direction?: "horizontal" | "vertical";
    /** minimum size of a row or column when the splitter handle is moved. */
    margin?: number;
    /** Fired while a splitter handle is moved. */
    onResize?: (event: ISplitterContainerResizeEvent) => void;
    /** If true, fires a global window resize event while a splitter handle is moved. */
    resizeEvent?: boolean;
}

export class SplitterContainer extends React.Component<ISplitterContainerProps, {}>
{
    static defaultProps: ISplitterContainerProps = {
        className: "ff-splitter-container",
        direction: "horizontal",
        margin: 20
    };

    // container uses flex-layout
    private static containerStyle: CSSProperties = {
        position: "absolute",
        left: 0, right: 0, top: 0, bottom: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "row"
    };

    private static horizontalHandleStyle: CSSProperties = {
        position: "relative",
        zIndex: 1,
        padding: "0 5px",
        margin: "0 -5px",
        cursor: "col-resize"
    };

    private static verticalHandleStyle: CSSProperties = {
        position: "relative",
        zIndex: 1,
        padding: "5px 0",
        margin: "-5px 0",
        cursor: "row-resize"
    };

    private readonly isVertical: boolean;

    private element: HTMLDivElement;
    private handleElements: HTMLDivElement[];
    private sectionElements: HTMLDivElement[];
    private sections: SplitterSectionElement[];

    private activeHandleIndex: number;
    private containerSize: number;
    private lastResizeEvent: ISplitterContainerResizeEvent;

    constructor(props: ISplitterContainerProps)
    {
        super(props);

        this.isVertical = this.props.direction === "vertical";

        this.element = null;
        this.handleElements = [];
        this.sectionElements = [];
        this.sections = [];

        this.activeHandleIndex = -1;
        this.containerSize = 0;
        this.lastResizeEvent = null;

        this.onRef = this.onRef.bind(this);
        this.onDragBegin = this.onDragBegin.bind(this);
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    render()
    {
        const children = this.props.children;
        let components = [];

        if (Array.isArray(children) && children.length > 0) {

            const sections = this.sections =
                children.filter(child => (child as any).type === SplitterSection) as SplitterSectionElement[];

            const sectionCount = sections.length;

            const numericSizes: number[] = [];
            let totalSize = 0;
            let sizeCount = 0;

            for (let i = 0; i < sectionCount; ++i) {
                let size = sections[i].props.size;
                let numericSize = 0;

                if (size) {
                    if (typeof size === "string") {
                        if (size.endsWith("%")) {
                            numericSize = Number.parseFloat(size) / 100;
                        }
                        else {
                            numericSize = Number.parseFloat(size);
                        }
                    }
                    else {
                        numericSize = size;
                    }
                }

                if (numericSize > 0) {
                    totalSize += numericSize;
                    sizeCount++;
                }

                numericSizes.push(numericSize);
            }

            let defaultSize = 0;
            if (sizeCount < sectionCount) {
                if (totalSize < 1) {
                    defaultSize = (1 - totalSize) / (sectionCount - sizeCount);
                }
                else {
                    defaultSize = totalSize / sectionCount;
                }

                totalSize += defaultSize * (sectionCount - sizeCount);
            }

            let handleStyle = this.isVertical
                ? SplitterContainer.verticalHandleStyle
                : SplitterContainer.horizontalHandleStyle;

            for (let i = 0; i < sectionCount; ++i) {
                // update splitter section size
                let size;
                if (numericSizes[i] > 0) {
                    size = (numericSizes[i] / totalSize * 100).toFixed(3) + "%";
                }
                else {
                    size =(defaultSize / totalSize * 100).toFixed(3) + "%";
                }

                // if no key is provided, add one
                const key = sections[i].key || i;
                const className = sections[i].props.className
                    + (this.isVertical ? " ff-vertical" : " ff-horizontal");

                // add splitter section
                components.push(
                    React.cloneElement(sections[i], { key: "s" + key, size, className })
                );

                // insert a splitter handle between sections
                if (i < sectionCount - 1) {
                    components.push(<Draggable
                        key={ "d" + key }
                        className="ff-splitter-handle"
                        style={handleStyle}
                        onDragBegin={this.onDragBegin}
                        onDragMove={this.onDragMove}
                        onDragEnd={this.onDragEnd} />);
                }
            }
        }

        let containerStyle = Object.assign({}, SplitterContainer.containerStyle);
        containerStyle.flexDirection = this.isVertical ? "column" : "row";

        return (<div
            className={this.props.className}
            style={containerStyle}
            ref={this.onRef}>
            {components}
        </div>);
    }

    componentDidMount()
    {
        this.updateConfiguration();
    }

    componentDidUpdate()
    {
        this.updateConfiguration();
    }

    private updateConfiguration()
    {
        this.handleElements.length = 0;
        this.sectionElements.length = 0;

        const children = this.element.children;
        for (let i = 0; i < children.length; ++i) {
            let child = children[i] as HTMLDivElement;
            (i % 2 === 0 ? this.sectionElements : this.handleElements).push(child);
        }
    }

    private onRef(element: HTMLDivElement)
    {
        this.element = element;
    }

    private onDragBegin(event: PointerEvent)
    {
        this.activeHandleIndex = this.handleElements.indexOf(event.target as any);
        this.containerSize = this.isVertical ? this.element.clientHeight : this.element.clientWidth;
    }

    private onDragMove(event: PointerEvent, dx, dy)
    {
        const activeHandleIndex = this.activeHandleIndex;

        if (activeHandleIndex >= 0) {
            const isVertical = this.isVertical;
            const parentSize = this.containerSize;
            const firstPane = this.sectionElements[activeHandleIndex];
            const secondPane = this.sectionElements[activeHandleIndex + 1];

            let deltaMovement = isVertical ? dy : dx;
            let firstSize = (isVertical ? firstPane.offsetHeight : firstPane.offsetWidth) + deltaMovement;
            let secondSize = (isVertical ? secondPane.offsetHeight : secondPane.offsetWidth) - deltaMovement;

            const margin = this.props.margin;
            if (firstSize < margin) {
                secondSize += firstSize - margin;
                firstSize = margin;
            }
            else if (secondSize < margin) {
                firstSize += secondSize - margin;
                secondSize = margin;
            }

            // convert to fraction values
            firstSize /= parentSize;
            secondSize /= parentSize;

            // convert to percent string values
            firstPane.style["flexBasis"] = (firstSize * 100).toFixed(3) + "%";
            secondPane.style["flexBasis"] = (secondSize * 100).toFixed(3) + "%";

            // trigger a window resize event
            if (this.props.onResize || this.props.resizeEvent) {
                window.dispatchEvent(new Event("resize"));
            }

            // notify listener, use fraction values
            if (this.props.onResize) {
                this.lastResizeEvent = {
                    index: activeHandleIndex,
                    sectionIds: [
                        this.sections[activeHandleIndex].props.id,
                        this.sections[activeHandleIndex + 1].props.id
                    ],
                    sizes: [
                        firstSize,
                        secondSize
                    ],
                    isDragging: true,
                    id: this.props.id,
                    sender: this
                };

                this.props.onResize(this.lastResizeEvent);
            }
        }
    }

    private onDragEnd()
    {
        this.containerSize = 0;
        this.activeHandleIndex = -1;

        if (this.lastResizeEvent && this.props.onResize) {
            this.lastResizeEvent.isDragging = false;
            this.props.onResize(this.lastResizeEvent);
            this.lastResizeEvent = null;
        }
    }
}