/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";

import ManipTargetHelper, { IManip, IManipPointerEvent, IManipTriggerEvent } from "@ff/browser/ManipTarget";
import { IComponentProps } from "./common";

////////////////////////////////////////////////////////////////////////////////

export { IManipPointerEvent, IManipTriggerEvent };

//export type PointerEvent = React.PointerEvent<HTMLDivElement>;
//export type MouseEvent = React.MouseEvent<HTMLDivElement>;
//export type WheelEvent = React.WheelEvent<HTMLDivElement>;

export interface IManipEventHandler
{
    onPointer: (event: IManipPointerEvent) => boolean;
    onTrigger: (event: IManipTriggerEvent) => boolean;
}



/** Properties for [[ManipTarget]] component. */
export interface IManipTargetProps extends IComponentProps
{
    /** Captures a pointer after pressed. Default is true. */
    capture?: boolean;
    /** Handler for manip events; an object implementing the [[IManipHandler]] interface. */
    handler?: IManipEventHandler;
    /** Callback function for pointer events. */
    onPointer?: (event: IManipPointerEvent) => boolean;
    /** Callback function for trigger events (wheel, context menu, etc.) */
    onTrigger?: (event: IManipTriggerEvent) => boolean;
}


export default class ManipTarget extends React.Component<IManipTargetProps, {}> implements IManip
{
    static readonly defaultProps: IManipTargetProps = {
        className: "ff-manip-target"
    };

    protected elementRef: React.RefObject<HTMLDivElement>;
    protected manipHelper: ManipTargetHelper;


    constructor(props: IManipTargetProps)
    {
        super(props);

        this.elementRef = React.createRef();

        this.manipHelper = new ManipTargetHelper();
        this.manipHelper.next = this;
    }

    render()
    {
        const {
            className,
            children
        } = this.props;

        const manipHelper = this.manipHelper;

        const props = {
            className,
            ref: this.elementRef,
            "touch-action": "none",
            onPointerDown: manipHelper.onPointerDown,
            onPointerMove: manipHelper.onPointerMove,
            onPointerUp: manipHelper.onPointerUpOrCancel,
            onPointerCancel: manipHelper.onPointerUpOrCancel,
            onDoubleClick: manipHelper.onDoubleClick,
            onContextMenu: manipHelper.onContextMenu,
            onWheel: manipHelper.onWheel
        };

        return React.createElement("div", props, children);
    }


    onPointer(event: IManipPointerEvent): boolean
    {
        const props = this.props;

        if (props.handler) {
            return props.handler.onPointer(event);
        }

        if (props.onPointer) {
            return props.onPointer(event);
        }
    }

    onTrigger(event: IManipTriggerEvent): boolean
    {
        const props = this.props;

        if (props.handler) {
            return props.handler.onTrigger(event);
        }

        if (props.onTrigger) {
            return props.onTrigger(event);
        }
    }
}