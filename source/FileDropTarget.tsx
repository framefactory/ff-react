/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";
import { CSSProperties, MouseEvent } from "react";

const _div = document.createElement('div');
const _fileDropSupported = (('draggable' in _div) || ('ondragstart' in _div && 'ondrop' in _div))
    && 'FormData' in window && 'FileReader' in window;

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[FileDropTarget]] component. */
export interface IFileDropTargetProps
{
    className?: string;
    style?: CSSProperties;
    id?: string;
    fileTypes?: string;
    onFiles?: (files: FileList, id: string, sender: FileDropTarget) => void;
}

export interface IFileDropTargetState
{
    isDragging: boolean;
}

export default class FileDropTarget extends React.Component<IFileDropTargetProps, IFileDropTargetState>
{
    static defaultProps: IFileDropTargetProps = {
        className: "file-drop-target"
    };

    static isSupported: boolean = _fileDropSupported;

    constructor(props: IFileDropTargetProps)
    {
        super(props);

        this.state = {
            isDragging: false
        };

        this.onDrag = this.onDrag.bind(this);
        this.onDragBegin = this.onDragBegin.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onDrop = this.onDrop.bind(this);
    }

    render()
    {
        const {
            className,
            style,
            children
        } = this.props;

        const classNames = className + (this.state.isDragging ? " targeted": "");

        if (!_fileDropSupported) {
            return (<div
                className={classNames}
                style={style} >
                {children}
            </div>)
        }

        return (<div
            className={classNames}
            style={style}
            onDragEnter={this.onDragBegin}
            onDragOver={this.onDrag}
            onDragLeave={this.onDragEnd}
            onDragEnd={this.onDragEnd}
            onDrop={this.onDrop} >
            {children}
        </div>);
    }

    protected onDrag(e: MouseEvent<HTMLDivElement>)
    {
        e.preventDefault();
        e.stopPropagation();
    }

    protected hasValidFile(files: FileList)
    {
        const fileTypes = this.props.fileTypes;
        if (!fileTypes) {
            return true;
        }

        if (files) {
            for (let i = 0; i < files.length; ++i) {
                const extension = files[i].name.split(".").pop().toLowerCase();
                if (fileTypes.indexOf(extension) >= 0) {
                    return true;
                }
            }
        }

        return false;
    }

    protected onDragBegin(e: MouseEvent<HTMLDivElement>)
    {
        this.setState({
            isDragging: true
        });

        e.preventDefault();
        e.stopPropagation();
    }

    protected onDragEnd(e: MouseEvent<HTMLDivElement>)
    {
        this.setState({
            isDragging: false
        });

        e.preventDefault();
        e.stopPropagation();
    }

    protected onDrop(e: MouseEvent<HTMLDivElement>)
    {
        this.setState({
            isDragging: false
        });

        e.preventDefault();
        e.stopPropagation();

        const mouseEvent = e.nativeEvent as any;
        const droppedFiles = mouseEvent.dataTransfer.files;

        if (this.props.onFiles && this.hasValidFile(droppedFiles)) {
            this.props.onFiles(droppedFiles, this.props.id, this);
        }
    }
}