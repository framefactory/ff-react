/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import clone from "@ff/core/clone";
import uniqueId from "@ff/core/uniqueId";
import Commander from "@ff/core/Commander";
import Controller, { Actions } from "@ff/core/Controller";

////////////////////////////////////////////////////////////////////////////////

export type DockArea = "none" | "left" | "top" | "right" | "bottom" | "center";

export interface IDockContainerLayout
{
    id: string;
    type: "stack" | "split",
    size: number;
}

export interface IDockStackLayout extends IDockContainerLayout
{
    type: "stack",
    activePaneId: string,
    panes: Array<IDockPaneLayout>
}

export interface IDockSplitLayout extends IDockContainerLayout
{
    type: "split",
    direction: "horizontal" | "vertical",
    sections: Array<IDockSplitLayout | IDockStackLayout>
}

export interface IDockPaneLayout
{
    id: string;
    title: string;
    closable?: boolean;
    movable?: boolean;
    componentId: string;
}

export type IDockLayout = IDockSplitLayout | IDockStackLayout;

////////////////////////////////////////////////////////////////////////////////

export type DockActions = Actions<DockController>;

export default class DockController extends Controller<DockController>
{
    protected static readonly defaultLayout: IDockLayout = {
        id: "h4NEk34jJQ",
        type: "split",
        direction: "horizontal",
        sections: [],
        size: 1
    };

    public readonly actions: DockActions;
    protected state: IDockLayout;

    constructor(commander: Commander, initialLayout?: IDockLayout)
    {
        super(commander);
        this.addEvent("change");

        this.state = initialLayout || DockController.defaultLayout;
    }

    createActions(commander: Commander)
    {
        return {
            resize: commander.register({
                name: "Resize", do: this.resize, undo: this.setState, target: this
            }),
            activatePane: commander.register({
                name: "Activate Pane", do: this.activatePane, undo: this.setState, target: this
            }),
            insertPane: commander.register({
                name: "Insert Pane", do: this.insertPane, undo: this.setState, target: this
            }),
            removePane: commander.register({
                name: "Remove Pane", do: this.removePane, undo: this.setState, target: this
            }),
            movePane: commander.register({
                name: "Move Pane", do: this.movePane, undo: this.setState, target: this
            })
        };
    }

    resize(sectionId: string, index: number, firstSize: number, secondSize: number): IDockLayout
    {
        const prevState = this.state;
        const nextState = this.state = clone(prevState);

        const section = this._getSection(sectionId, nextState);
        if (section) {
            section.sections[index].size = firstSize;
            section.sections[index + 1].size = secondSize;
        }

        this.emit("change");
        return prevState;
    }

    activatePane(paneId: string): IDockLayout
    {
        const prevState = this.state;
        const nextState = this.state = clone(prevState);

        const panePath = this._getPath(paneId, nextState);
        if (panePath) {
            panePath[0].layout.activePaneId = paneId;
        }

        this.emit("change");
        return prevState;
    }

    insertPane(anchorId: string, location: DockArea, title: string, closable: boolean, componentId: string): IDockLayout
    {
        const prevState = this.state;
        const nextState = this.state = clone(prevState);

        const anchorPath = this._getPath(anchorId, nextState);
        if (anchorPath) {
            const newRoot = this._insertPane(anchorPath, location, {
                id: uniqueId(),
                title,
                closable,
                componentId
            });

            if (newRoot) {
                this.state = newRoot;
            }
        }

        this.emit("change");
        return prevState;
    }

    removePane(paneId: string): IDockLayout
    {
        const prevState = this.state;
        const state = this.state = clone(prevState);

        const panePath = this._getPath(paneId, state);
        if (panePath) {
            const newRoot = this._removePane(panePath);

            if (newRoot) {
                this.state = newRoot;
            }
        }

        this.emit("change");
        return prevState;
    }

    movePane(paneId: string, anchorId: string, location: string): IDockLayout
    {
        const prevState = this.state;
        let nextState = clone(prevState);

        const panePath = this._getPath(paneId, nextState);
        if (!panePath) {
            throw new Error(`pane not found for id '${paneId}'`);
        }
        const anchorPath = this._getPath(anchorId, nextState);
        if (!anchorPath) {
            throw new Error(`target not found for anchorId '${anchorId}'`);
        }

        const panes = panePath[0].layout.panes;
        const pane = panes[panePath[0].index];

        if (paneId === anchorId && panes.length === 1) {
            // drop on self and only one pane in stack: nothing to do
            return nextState;
        }

        if (anchorPath[0].layout === panePath[0].layout) {
            // drop in same stack, in front of source location; adjust index for deletion
            if (anchorPath[0].index < panePath[0].index
                && (location === "center" || location === "insert")) {
                panePath[0].index++;
                //console.log("pane index adjusted");
            }
        }
        else if (anchorPath[1] && anchorPath[1].layout === panePath[1].layout && anchorPath[1].index < panePath[1].index) {
            // drop in same split, in front of source location; adjust index for deletion
            if (this._isSameDirection(location, anchorPath[1].layout.direction)) {
                panePath[1].index++;
                //console.log("section index adjusted");
            }
        }

        nextState = this._insertPane(anchorPath, location, pane) || nextState;
        nextState = this._removePane(panePath) || nextState;
        this.state = nextState;

        this.emit("change");
        return prevState;
    }

    setState(state: IDockLayout)
    {
        this.state = state;
        this.emit("change");
    }

    getLayout(): IDockLayout
    {
        return this.state;
    }

    protected _isSameDirection(location: string, direction: string): boolean
    {
        return (direction === "horizontal" && (location === "left" || location === "right"))
            || (direction === "vertical" && (location === "top" || location === "bottom"));
    }

    protected _getSection(sectionId: string, layout: IDockLayout): IDockSplitLayout
    {
        if (layout.type === "stack") {
            return null;
        }

        if (layout.id === sectionId) {
            return layout;
        }

        const sections = layout.sections;
        for (let i = 0; i < sections.length; ++i) {
            const section = sections[i];
            if (section.type === "split") {
                const result = this._getSection(sectionId, section);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }

    protected _getPath(paneId: string, layout: IDockLayout): any[]
    {
        if (layout.type === "split") {
            const sections = layout.sections;
            for (let i = 0; i < sections.length; ++i) {
                const path = this._getPath(paneId, sections[i]);
                if (path) {
                    path.push({ index: i, layout });
                    return path;
                }
            }
        }
        else {
            const panes = layout.panes;
            for (let i = 0; i < panes.length; ++i) {
                if (panes[i].id === paneId) {
                    return [{ index: i, layout }];
                }
            }
        }

        return null;
    }

    protected _insertPane(path: any[], location: string, pane: IDockPaneLayout)
    {
        const stackLayout: IDockStackLayout = path[0].layout;
        const stackIndex = path[0].index;

        const splitLayout: IDockSplitLayout = path[1] && path[1].layout;
        const splitIndex = path[1] && path[1].index;

        if (location === "insert") {
            stackLayout.panes.splice(stackIndex, 0, pane);
            stackLayout.activePaneId = pane.id;
        }
        else if (location === "center") {
            stackLayout.panes.push(pane);
            stackLayout.activePaneId = pane.id;
        }
        else {
            const newStack: IDockStackLayout = {
                type: "stack",
                id: uniqueId(),
                size: 0.5,
                activePaneId: pane.id,
                panes: [ pane ]
            };

            if (!splitLayout) {
                const insertAfter = location === "right" || location === "bottom";
                const direction = location === "left" || location === "right" ? "horizontal" : "vertical";

                const newSplit: IDockSplitLayout = {
                    type: "split",
                    id: uniqueId(),
                    size: 1,
                    direction,
                    sections: [ stackLayout ]
                };

                stackLayout.size = 0.5;
                newSplit.sections.splice(insertAfter ? 1 : 0, 0, newStack);
                return newSplit;
            }

            let before, after, opposite;

            if (splitLayout.direction === "horizontal") {
                before = "left";
                after = "right";
                opposite = "vertical";
            }
            else {
                before = "top";
                after = "bottom";
                opposite = "horizontal"
            }

            if (location === before) {
                newStack.size = splitLayout.sections[splitIndex].size *= 0.5;
                splitLayout.sections.splice(splitIndex, 0, newStack);
            }
            else if (location === after) {
                newStack.size = splitLayout.sections[splitIndex].size *= 0.5;
                splitLayout.sections.splice(splitIndex + 1, 0, newStack);
            }
            else {
                const section = splitLayout.sections[splitIndex];
                const size = section.size;
                section.size = 0.5;
                newStack.size = 0.5;

                const newSplit: IDockSplitLayout = {
                    type: "split",
                    id: uniqueId(),
                    size: size,
                    direction: opposite,
                    sections: [ section ]
                };

                splitLayout.sections[splitIndex] = newSplit;
                const isBefore = location === "left" || location === "top";
                newSplit.sections.splice(isBefore ? 0 : 1, 0, newStack);
            }
        }

        return null;
    }

    protected _removePane(path: any[])
    {
        const stackLayout: IDockStackLayout = path[0].layout;
        const stackIndex = path[0].index;
        const panes = stackLayout.panes;
        const removedPane = panes[stackIndex];

        // if stack contains more than one pane, or if stack is at root, remove pane
        if (panes.length > 1 || path.length === 1) {
            panes.splice(stackIndex, 1);
            if (removedPane.id === stackLayout.activePaneId && panes.length > 0) {
                stackLayout.activePaneId = panes[Math.min(stackIndex, panes.length - 1)].id;
            }
        }
        // stack contains single pane, remove section from next higher split layout
        else {
            const sections = path[1].layout.sections;
            // split container has more than 2 sections, remove section
            if (sections.length > 2) {
                sections.splice(path[1].index, 1);
            }
            // only two sections, move remaining section to parent
            else if (path.length > 2) {
                const sibling = sections[1 - path[1].index];
                const parent = path[2];
                stackLayout.size = parent.layout.sections[parent.index].size;
                parent.layout.sections[parent.index] = sibling;
            }
            else {
                // sibling becomes new root
                return sections[1 - path[1].index];
            }
        }

        return null;
    }
}
