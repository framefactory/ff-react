/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

// import * as React from "react";
//
// import Property from "@ff/graph/Property";
//
// import FieldEdit, {
//     IFieldEditChangeEvent,
//     IFieldEditCommitEvent,
//     IFieldEditFormat
// } from "./FieldEdit";
//
// ////////////////////////////////////////////////////////////////////////////////
//
// const _LABELS = [ "X", "Y", "Z", "W" ];
//
// /** Properties for [[PropertyView]] component. */
// export interface IPropertyViewProps
// {
//     className?: string;
//     property: Property;
// }
//
// interface IPropertyViewState
// {
// }
//
// export default class PropertyView extends React.Component<IPropertyViewProps, IPropertyViewState>
// {
//     static readonly defaultProps = {
//         className: "ff-property-view"
//     };
//
//     protected fields: FieldEdit[] = [];
//     protected isUpdating = false;
//
//     constructor(props: IPropertyViewProps)
//     {
//         super(props);
//
//         this.onFieldChange = this.onFieldChange.bind(this);
//         this.onFieldCommit = this.onFieldCommit.bind(this);
//     }
//
//     componentDidMount()
//     {
//         this.props.property.on("value", this.onValueChange, this);
//     }
//
//     componentWillUnmount()
//     {
//         this.props.property.off("value", this.onValueChange, this);
//     }
//
//     render()
//     {
//         const {
//             className,
//             property
//         } = this.props;
//
//         const fields = [];
//         const elementCount = property.elementCount;
//
//         //console.log("PropertyView.render - ", property.path, property.value);
//
//         if (elementCount > 4) {
//
//         }
//         else {
//             const labels = property.schema.labels || _LABELS;
//
//             const format: IFieldEditFormat = {
//                 type: property.type,
//                 preset: property.schema.preset,
//                 min: property.schema.min,
//                 max: property.schema.max,
//                 step: property.schema.step,
//                 precision: property.schema.precision,
//                 bar: property.schema.bar,
//                 percent: property.schema.percent,
//                 options: property.schema.options
//             };
//
//             for (let i = 0; i < elementCount; ++i) {
//                 if (elementCount > 1) {
//                     fields.push(<div
//                         key={"l" + i}
//                         className="ff-label">
//                         {labels[i]}
//                     </div>);
//                 }
//
//                 fields.push(<FieldEdit
//                     ref={e => this.fields[i] = e}
//                     index={i}
//                     key={"f" + i}
//                     value={elementCount > 1 ? property.value[i] : property.value}
//                     format={format}
//                     onChange={this.onFieldChange}
//                     onCommit={this.onFieldCommit}
//                 />);
//             }
//         }
//
//         return (
//             <div
//                 className={className}>
//                 {fields}
//             </div>
//         );
//     }
//
//     protected onFieldChange(event: IFieldEditChangeEvent)
//     {
//         const property = this.props.property;
//
//         if (property.isArray()) {
//             property.value[event.index] = event.value;
//         }
//         else {
//             property.value = event.value;
//         }
//
//         this.isUpdating = true;
//         property.set();
//         this.isUpdating = false;
//     }
//
//     protected onFieldCommit(event: IFieldEditCommitEvent)
//     {
//         const property = this.props.property;
//
//         if (property.isArray()) {
//             property.value[event.index] = event.value;
//         }
//         else {
//             property.value = event.value;
//         }
//
//         this.isUpdating = true;
//         property.set();
//         this.isUpdating = false;
//     }
//
//     protected onValueChange(value)
//     {
//         if (!this.isUpdating) {
//             const property = this.props.property;
//             if (property.isArray()) {
//                 if (property.elementCount <= 4) {
//                     for (let i = 0; i < property.elementCount; ++i) {
//                         this.fields[i].setValue(property.value[i]);
//                     }
//                 }
//             }
//             else {
//                 this.fields[0].setValue(property.value);
//             }
//         }
//     }
// }