/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";

import { IComponentEvent, IComponentProps } from "./common";
import Button, { IButtonTapEvent } from "./Button";
import Checkbox from "./Checkbox";

////////////////////////////////////////////////////////////////////////////////

export interface ISelectionGroupSelectEvent extends IComponentEvent<SelectionGroup>
{
    selectionId: string;
    selectionIndex: number;
}

/** Properties for [[SelectionGroup]] component */
export interface ISelectionGroupProps extends IComponentProps
{
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

    setSelected(selectionIndex: number, selectionId: string)
    {
        this.setState({
            selectionIndex
        });

        const { id, index } = this.props;

        if (this.props.onSelect) {
            this.props.onSelect({ selectionIndex, selectionId, id, index, sender: this });
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
        let i = 0;

        const transformedChildren = React.Children.map(children as any, (child: any) => {
            const type = child.type;

            if (type === Button || type === Checkbox) {
                const index = child.props.index !== undefined ? child.props.index : i;
                i = index + 1;

                return React.cloneElement(child, {
                    selected: (index === selectionIndex),
                    selectable: false, // stateless Button, SelectionGroup controls selection state
                    shape,
                    index,
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

    protected onButtonTap(event: IButtonTapEvent)
    {
        if (this.state.selectionIndex === event.index && this.props.mode === "exclusive") {
            this.setSelected(-1, "");
        }
        else {
            this.setSelected(event.index, event.id);
        }
    }
}