/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { ChangeEvent, CSSProperties } from "react";

import { IComponentEvent } from "./common";

////////////////////////////////////////////////////////////////////////////////

export interface IDropdownSelectEvent extends IComponentEvent<Dropdown>
{
    index: number,
    option: string
}

/** Properties for [[Dropdown]] component. */
export interface IDropdownProps
{
    id?: string;
    /** The default class is "button". Use this property to override. */
    className?: string;
    style?: CSSProperties;
    options: string[];
    /** Event fired after a new option from the drop down menu has been selected. */
    onSelect?: (event: IDropdownSelectEvent) => void;
}

export default class Dropdown extends React.Component<IDropdownProps, {}>
{
    static defaultProps: IDropdownProps = {
        className: "control dropdown",
        options: []
    };

    private static style: CSSProperties = {
        touchAction: "none",
        cursor: "pointer"
    };

    constructor(props: IDropdownProps)
    {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    render()
    {
        const {
            className,
            style,
            options
        } = this.props;

        const optionElements = options.map((option, index) => (
            <option key={ option + index } label={option}>{option}</option>
        ));

        const styles = Object.assign({}, Dropdown.style, style);
        const touchActionProp = { "touch-action": "none" };

        return (<div
            className={className}>

            <select
                style={styles}
                tabIndex={0}
                onChange={this.onChange}
                {...touchActionProp} >
                {optionElements}
            </select>
        </div>);
    }

    onChange(e: ChangeEvent<HTMLSelectElement>)
    {
        const props = this.props;

        if (props.onSelect) {
            const select = e.target;
            const index = select.selectedIndex;
            const option = select[index] as HTMLOptionElement;
            props.onSelect({ index, option: option.label, id: props.id, sender: this });
        }
    }
}




