/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as React from "react";

import Button, { IButtonTapEvent } from "./Button";
import Dialog, { Anchor, IDialogProps, IDialogTapModal } from "./Dialog";

////////////////////////////////////////////////////////////////////////////////

/** Properties for [[PopupButton]] component. */
export interface IPopupButtonProps extends IDialogProps {
    text?: string;
    /** Class(es) for a custom icon. */
    icon?: string;
    /** Name of a Font Awesome icon. Expanded into classes "fa fa-<icon>" */
    faIcon?: string;
    /** URL of an image to display with the button. */
    image?: string;
    /** Title appears when hovering over the button. */
    title?: string;
    /** When set to true, button appears in disabled state. Default is false. */
    disabled?: boolean;
    /** Element receives the focus after mounting if true. */
    focused?: boolean;
}

export interface IPopupButtonState
{
    popupVisible: boolean;
}

/**
 * Button component. Displays its children when pressed.
 */
export default class PopupButton extends React.Component<IPopupButtonProps, IPopupButtonState>
{
    static readonly defaultProps: IPopupButtonProps = {
        className: "popup-button"
    };

    protected dialog: Dialog;

    constructor(props: IPopupButtonProps)
    {
        super(props);

        this.onRefDialog = this.onRefDialog.bind(this);
        this.onTapButton = this.onTapButton.bind(this);
        this.onTapModal = this.onTapModal.bind(this);

        this.dialog = null;

        this.state = {
            popupVisible: false
        };
    }

    render()
    {
        const props = this.props;

        return (
            <Dialog
                ref={this.onRefDialog}
                id={props.id}
                anchor={props.anchor}
                justify={props.justify}
                align={props.align}
                portal={props.portal}
                modal={props.modal}
                visible={this.state.popupVisible}
                onTapModal={this.onTapModal}>

                <Anchor>
                    <Button
                        id={props.id}
                        className={props.className}
                        text={props.text}
                        icon={props.icon}
                        faIcon={props.faIcon}
                        image={props.image}
                        title={props.title}
                        disabled={props.disabled}
                        onTap={this.onTapButton} />
                </Anchor>

                {props.children}
            </Dialog>
        );
    }

    protected onRefDialog(dialog: Dialog)
    {
        this.dialog = dialog;
    }

    protected onTapButton(event: IButtonTapEvent)
    {
        this.setState(prevState => ({ popupVisible: !prevState.popupVisible }));
    }

    protected onTapModal(event: IDialogTapModal)
    {
        this.setState(prevState => {
            const popupVisible = !prevState.popupVisible;

            // on closing the popup, set the focus to the anchor element
            if (!popupVisible && this.dialog && this.dialog.anchorElement) {
                this.dialog.anchorElement.focus();
            }

            return { popupVisible };
        });
    }
}