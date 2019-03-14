import React, { Component } from 'react';
import { connect } from 'react-redux';
import RoomDetails from './RoomDetails';
import RoomList from './RoomList';
import '../../css/sidepanel.css';

const mapStateToProps = (state) => {
    return {
        selectedRoom: state.selectedRoom
    };
};

class ConnectedSidePanel extends Component {
    render() {
        if (this.props.selectedRoom) { // todo: check if it's a valid room
            return (
                <div className="sidePanelContainer">
                    <RoomDetails />
                </div>
            );
        } else {
            return (
                <div className="sidePanelContainer">
                    <RoomList />
                </div>
            );
        }
    }
};

const SidePanel = connect(mapStateToProps)(ConnectedSidePanel);

export default SidePanel;