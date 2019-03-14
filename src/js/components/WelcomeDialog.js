import React, { Component } from 'react';
import { Modal } from 'semantic-ui-react';
import '../../css/welcomedialog.css'
import { WELCOME_DIALOG_HEADER, WELCOME_DIALOG_CONTENT, RECRUITMENT_MESSAGE, BEGIN_FEATURE_LIST, FEATURE_LIST } from '../constants/messagebundle-en.js';

function getWelcomeDialogVisibility(cachedValue) {
    if (cachedValue) {
        return cachedValue === 'true' ? true : false;
    }
    return true;
}

export default class WelcomeDialog extends Component {
    constructor(props) {
        super(props);
        this.closeWelcomeDialog = this.closeWelcomeDialog.bind(this);
        this.getFeatureList = this.getFeatureList.bind(this);
        this.state = {
            visible: getWelcomeDialogVisibility(localStorage.getItem("showWelcomeDialog"))
        }
    }

    closeWelcomeDialog() {
    	localStorage.setItem("showWelcomeDialog", false)
        this.setState({visible: false});
    }

    getFeatureList() {
        return FEATURE_LIST.map(feature => (
            <li>{feature}</li>
        ));
    }
    
    render() {
        return (
            <Modal closeIcon closeOnDimmerClick={false} open={this.state.visible} onClose={this.closeWelcomeDialog} className="welcomeDialog">
            	<Modal.Header>{WELCOME_DIALOG_HEADER}</Modal.Header>
            	<Modal.Content>
            		<div className="welcomeDialogContent">{WELCOME_DIALOG_CONTENT}</div>
                    <br/>
                    {BEGIN_FEATURE_LIST}
                    <ul className="featureList">
                        {this.getFeatureList()}
                    </ul>
            	</Modal.Content>
            </Modal>
        );
    }
}