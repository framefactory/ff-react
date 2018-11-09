/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";

import Property from "@ff/core/ecs/Property";

import PropertyField, {
    IPropertyFieldChangeEvent,
    IPropertyFieldCommitEvent,
    IPropertyFieldFormat
} from "./PropertyField";

////////////////////////////////////////////////////////////////////////////////

const _LABELS = [ "X", "Y", "Z", "W" ];

/** Properties for [[PropertyView]] component. */
export interface IPropertyViewProps
{
    className?: string;
    property: Property;
}

interface IPropertyViewState
{
}

export default class PropertyView extends React.Component<IPropertyViewProps, IPropertyViewState>
{
    static readonly defaultProps = {
        className: "ff-property-view"
    };

    protected isUpdating = false;

    constructor(props: IPropertyViewProps)
    {
        super(props);

        this.onFieldChange = this.onFieldChange.bind(this);
        this.onFieldCommit = this.onFieldCommit.bind(this);
    }

    componentDidMount()
    {
        this.props.property.on("value", this.onValueChange, this);
    }

    componentWillUnmount()
    {
        this.props.property.off("value", this.onValueChange, this);
    }

    render()
    {
        const {
            className,
            property
        } = this.props;

        const fields = [];
        const elementCount = property.elements;

        if (elementCount > 4) {

        }
        else {
            const labels = property.schema.labels || _LABELS;
            const format: IPropertyFieldFormat = {
                type: property.type,
                preset: property.preset,
                min: property.schema.min,
                max: property.schema.max,
                step: property.schema.step,
                precision: property.schema.precision,
                bar: property.schema.bar,
                percent: property.schema.percent
            };

            for (let i = 0; i < elementCount; ++i) {
                if (elementCount > 1) {
                    fields.push(<div
                        key={"l" + i}
                        className="ff-label">
                        {labels[i]}
                    </div>);
                }

                fields.push(<PropertyField
                    index={i}
                    key={"f" + i}
                    value={elementCount > 1 ? property.value[i] : property.value}
                    format={format}
                    onChange={this.onFieldChange}
                    onCommit={this.onFieldCommit}
                />)
            }
        }

        return (
            <div
                className={className}>
                {fields}
            </div>
        );
    }

    protected onFieldChange(event: IPropertyFieldChangeEvent)
    {
        const property = this.props.property;

        if (property.isArray()) {
            property.value[event.index] = event.value;
        }
        else {
            property.value = event.value;
        }

        this.isUpdating = true;
        property.set();
        this.isUpdating = false;
    }

    protected onFieldCommit(event: IPropertyFieldCommitEvent)
    {
        const property = this.props.property;

        if (property.isArray()) {
            property.value[event.index] = event.value;
        }
        else {
            property.value = event.value;
        }

        this.isUpdating = true;
        property.set();
        this.isUpdating = false;
    }

    protected onValueChange(value)
    {
        if (!this.isUpdating) {
            this.forceUpdate();
        }
    }
}