/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties } from "react";

import { IComponentEvent } from "./common";
import Button, { IButtonTapEvent } from "./Button";
import Checkbox from "./Checkbox";

////////////////////////////////////////////////////////////////////////////////

export interface ISelectionGroupSelectEvent extends IComponentEvent<SelectionGroup> { index: number }

/** Properties for [[SelectionGroup]] component */
export interface ISelectionGroupProps
{
    id?: string;
    className?: string;
    style?: CSSProperties;

    mode?: "radio" | "exclusive",
    selectionIndex?: number;
    shape?: "square" | "circle";
    onSelect?: (event: ISelectionGroupSelectEvent) => void
}

export interface ISelectionGroupState
{
    selectionIndex: number;
}

/**
 * Wrapper for a group of [[Button]] or [[Checkbox]] components. Provides selection modes
 * "radio" for radio buttons and "exclusive" for situations when at most one child component can be selected.
 */
export default class SelectionGroup extends React.Component<ISelectionGroupProps, ISelectionGroupState>
{
    static defaultProps: ISelectionGroupProps = {
        className: "ff-selection-group",
        mode: "radio",
        shape: "circle"
    };

    constructor(props: ISelectionGroupProps)
    {
        super(props);

        this.onButtonTap = this.onButtonTap.bind(this);

        this.state = {
            selectionIndex: props.selectionIndex !== undefined
                ? props.selectionIndex : (props.mode === "radio" ? 0 : -1)
        };
    }

    setSelected(index: number)
    {
        this.setState({
            selectionIndex: index
        });

        if (this.props.onSelect) {
            this.props.onSelect({ index, id: this.props.id, sender: this });
        }
    }

    render()
    {
        const {
            className,
            style,
            shape,
            children
        } = this.props;

        const selectionIndex = this.state.selectionIndex;
        let index = 0;

        const transformedChildren = React.Children.map(children as any, child => {
            const type = (child as any).type;
            if (type === Button || type === Checkbox) {
                return React.cloneElement(child as any, {
                    selected: (index === selectionIndex),
                    selectable: false, // stateless Button, SelectionGroup controls selection state
                    shape,
                    id: (index++).toString(),
                    onTap: this.onButtonTap
                });
            }

            return child;
        });

        return (<div
            className={className}
            style={style}>
            {transformedChildren}
        </div>);
    }

    protected onButtonTap(args: IButtonTapEvent)
    {
        const index = parseInt(args.id);

        if (this.state.selectionIndex === index && this.props.mode === "exclusive") {
            this.setSelected(-1);
        }
        else {
            this.setSelected(index);
        }
    }
}