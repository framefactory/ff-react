/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

// import * as React from "react";
//
// import { Dictionary } from "@ff/core/types";
// import Property from "@ff/graph/Property";
// import PropertyGroup, { IPropertyGroupPropertyEvent } from "@ff/graph/PropertyGroup";
//
// import Tree, { ITreeNode } from "./Tree";
// import PropertyView from "./PropertyView";
// import { MouseEvent } from "react";
//
// ////////////////////////////////////////////////////////////////////////////////
//
// const _getClass = function(node: IPropertyTreeNode) {
//     return node.id === "root" ? "ff-root" : "";
// };
//
// /** Properties for [[PropertyTree]] component. */
// export interface IPropertyTreeViewProps
// {
//     className?: string;
//     name?: string;
//     propertySet: PropertyGroup;
// }
//
// export interface IPropertyTreeViewState
// {
//     tree: IPropertyTreeNode;
//     expanded: Dictionary<any>;
// }
//
// interface IPropertyTreeNode extends ITreeNode
// {
//     name: string;
//     property: Property;
//     children: IPropertyTreeNode[];
// }
//
// export default class PropertyTreeView extends React.Component<IPropertyTreeViewProps, IPropertyTreeViewState>
// {
//     static readonly defaultProps = {
//         className: "ff-property-tree-view"
//     };
//
//     static getDerivedStateFromProps(props, state)
//     {
//         return {
//             tree: PropertyTreeView.createPropertyTree(props.propertySet, props.name),
//             expanded: PropertyTreeView.expandAll(props.propertySet)
//         };
//     }
//
//     constructor(props: IPropertyTreeViewProps)
//     {
//         super(props);
//
//         this.state = {
//             tree: PropertyTreeView.createPropertyTree(props.propertySet, props.name),
//             expanded: PropertyTreeView.expandAll(props.propertySet)
//         };
//     }
//
//     componentDidMount()
//     {
//         this.props.propertySet.on("change", this.onPropertyChange, this);
//     }
//
//     componentWillUnmount()
//     {
//         this.props.propertySet.off("change", this.onPropertyChange, this);
//     }
//
//     render()
//     {
//         const renderHeader = (node: IPropertyTreeNode) => {
//             const view = node.property ? <PropertyView property={node.property}/> : null;
//
//             return (<div
//                 className="ff-header"
//                 onClick={(e) => this.onClickHeader(e, node)}>
//                 <span className="ff-name">{node.name}</span>
//                 {view}
//             </div>);
//         };
//
//         const {
//             className,
//             name
//         } = this.props;
//
//         return (
//             <Tree
//                 className={className}
//                 tree={this.state.tree}
//                 expanded={this.state.expanded}
//                 includeRoot={!!name}
//                 getClass={_getClass}
//                 renderHeader={renderHeader} />
//         );
//     }
//
//     protected static createPropertyTree(propertyGroup: PropertyGroup, name: string): IPropertyTreeNode
//     {
//         const properties = propertyGroup.properties;
//         const tree = {
//             id: "root",
//             name: name || "Root",
//             property: null,
//             children: []
//         };
//
//         properties.forEach(property => {
//             const fragments = property.path.split(".");
//             let node = tree;
//
//             const count = fragments.length;
//             const last = count - 1;
//
//             for (let i = 0; i < count; ++i) {
//                 const fragment = fragments[i];
//                 let child = node.children.find(node => node.name === fragment);
//
//                 if (!child) {
//                     const id = i === last ? property.key : fragment;
//
//                     child = {
//                         id,
//                         name: fragment,
//                         children: [],
//                         property: i === last ? property : null
//                     };
//                     node.children.push(child);
//                 }
//                 node = child;
//             }
//         });
//
//         return tree;
//     }
//
//     protected static expandAll(propertyGroup: PropertyGroup): Dictionary<boolean>
//     {
//         const expanded = { root: true };
//         propertyGroup.properties.forEach(property => {
//             property.path.split(".").forEach(frag => expanded[frag] = true);
//         });
//         return expanded;
//     }
//
//     protected onClickHeader(e: MouseEvent, node: IPropertyTreeNode)
//     {
//         this.state.expanded[node.id] = !this.state.expanded[node.id];
//         this.forceUpdate();
//     }
//
//     protected onPropertyChange(event: IPropertyGroupPropertyEvent)
//     {
//
//     }
// }