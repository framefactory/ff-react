/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

////////////////////////////////////////////////////////////////////////////////

export default class Pane extends React.Component<any, any>
{
    render()
    {
        return (<div className="ff-pane" style={Pane.style} {...this.props}>
        </div>);
    }

    private static style: CSSProperties = {
        boxSizing: "border-box",
        position: "absolute",
        left: 0, right: 0, top: 0, bottom: 0
    };
}