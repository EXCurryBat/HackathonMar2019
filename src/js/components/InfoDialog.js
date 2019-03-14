import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal } from 'semantic-ui-react';
import { setInfoDialogVisibility } from '../actions/index';
import '../../css/infodialog.css'
import { INFO_DIALOG_HEADER, INFO_DIALOG_CONTENT } from '../constants/messagebundle-en.js';

const mapStateToProps = (state) => {
    return {
        selectedRoom: state.selectedRoom,
        infoDialogVisibility: state.infoDialogVisibility
    };
}

const mapDispatchToProps = (dispatch) => {
	return {
		setInfoDialogVisibility: visible => dispatch(setInfoDialogVisibility(visible))
	};
}

class ConnectedInfoDialog extends Component {
    constructor(props) {
        super(props);
        this.closeInfoDialog = this.closeInfoDialog.bind(this);
    }

    closeInfoDialog() {
    	this.props.setInfoDialogVisibility(false);
    }

    render() {
        return (
            <Modal open={this.props.infoDialogVisibility} onClose={this.closeInfoDialog} className="infoDialog">
            	<Modal.Header>{INFO_DIALOG_HEADER}</Modal.Header>
            	<Modal.Content>
            		<div className="infoDialogContent">{INFO_DIALOG_CONTENT}</div>
                    <br/>
                    <hr/>
                    <br/>
                    <div className="contactButtonsContainer">
                        <a className="ui button" href="https://github.wdf.sap.corp/Atlas/project-atlas/issues">Report a bug</a>
                        <a className="ui button" href="https://github.wdf.sap.corp/Atlas/project-atlas/issues">Request a feature</a>
                        <a className="ui button" href="https://github.wdf.sap.corp/Atlas/project-atlas/issues">General feedback</a>
                    </div>
            	</Modal.Content>
            </Modal>
        );
    }
}

const InfoDialog = connect(mapStateToProps, mapDispatchToProps)(ConnectedInfoDialog);

export default InfoDialog;


// If you prefer to receive emails instead of having users post GitHub issues, you can use these and change it to your email.
// <a className="ui button" href="mailto:shea.faigan@sap.com?subject=SAP%20Atlas:%20Bug%20Report&body=Steps to reproduce:%20%0D%0AObserved%20behaviour:%20%0D%0AExpected%20behaviour:%20">Report a bug</a>
// <a className="ui button" href="mailto:shea.faigan@sap.com?subject=SAP%20Atlas:%20Feature%20Request&body=Feature:%20%0D%0AAdditional info:%20">Request a feature</a>
// <a className="ui button" href="mailto:shea.faigan@sap.com?subject=SAP%20Atlas:%20Help%20Request&body=">Request help</a>