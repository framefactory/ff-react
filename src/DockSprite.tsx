/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import { DockArea } from "./DockController";

////////////////////////////////////////////////////////////////////////////////

export { DockArea };

/** Properties for [[DockableSprite]] component. */
export interface IDockSpriteProps
{
    className?: string;
    dockArea: DockArea;
}

export default class DockSprite extends React.Component<IDockSpriteProps, any>
{
    static readonly defaultProps: Partial<IDockSpriteProps> = {
        className: "ff-dock-sprite",
    };

    private static style: CSSProperties = {
        boxSizing: "border-box",
        position: "absolute",
        top: "0", left: "0", right: "0", bottom: "0",
        pointerEvents: "none"
    };

    constructor(props: IDockSpriteProps)
    {
        super(props);
    }

    render()
    {
        const {
            className,
            dockArea
        } = this.props;

        let style = Object.assign({}, DockSprite.style);
        switch(dockArea) {
            case "none":
                return null;

            case "left":
                style.right="50%";
                break;
            case "right":
                style.left="50%";
                break;
            case "top":
                style.bottom="50%";
                break;
            case "bottom":
                style.top="50%";
                break;
        }


        return (<div
            className={className}
            style={style} />
        );
    }
}
