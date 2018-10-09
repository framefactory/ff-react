/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { Dictionary, Partial } from "@ff/core/types";

import * as React from "react";
import { ReactNode } from "react";

////////////////////////////////////////////////////////////////////////////////

export interface ITreeNode
{
    id: string;
    children: ITreeNode[];
}

/** Properties for [[Tree]] component. */
export interface ITreeProps<T>
{
    tree: T;
    className?: string;
    includeRoot?: boolean;
    selected?: Dictionary<any>;
    expanded?: Dictionary<any>;
    getId?: (node: T) => string;
    getClass?: (node: T) => string;
    getChildren?: (node: T) => T[];
    renderHeader?: (node: T) => ReactNode
}

interface ITreeNodeEntry<T>
{
    id: string;
    data: T;
    expanded: boolean;
    children: ITreeNodeEntry<T>[];
}

export default class Tree<T = ITreeNode> extends React.Component<ITreeProps<T>, {}>
{
    static readonly defaultProps: Partial<ITreeProps<any>> = {
        className: "tree",
        includeRoot: true,
        getId: node => node.id,
        getClass: node => "",
        getChildren: node => node.children,
        renderHeader: node => node.toString()
    };

    render()
    {
        const {
            tree,
            className,
            includeRoot,
            getChildren
        } = this.props;

        return (
            <div
                className={className}>

                {includeRoot
                    ? this.renderNode(tree)
                    : getChildren(tree).map(child => this.renderNode(child))}

            </div>
        );
    }

    protected renderNode(node: T)
    {
        const {
            selected,
            expanded,
            getId,
            getClass,
            getChildren,
            renderHeader
        } = this.props;

        const id = getId(node);
        const children = getChildren(node);
        const isExpanded = expanded && expanded[id];
        const isSelected = selected && selected[id];
        const modeClass = children.length > 0 ? (isExpanded ? "expanded" : "collapsed") : "leaf";
        const c = getClass(node);
        const classes = "content " + modeClass + (isSelected ? " selected" : "") + (c ? " " + c : "");

        const renderedChildren = isExpanded ? <div className="children">
            {children.map(child => this.renderNode(child))}
        </div> : null;

        return(
            <div className="node" key={id}>
                <div className={classes}>
                    {renderHeader(node)}
                    {renderedChildren}
                </div>
            </div>
        );
    }
}