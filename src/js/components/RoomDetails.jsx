import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Divider, Header, Button, Icon, List, ListItem } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { selectRoom } from '../actions/index';
import Utils from './Utils';
import '../../css/roomdetails.css';

const SchedulesJSON = require('../../data/schedules.json');
// const RoomSchedule = JSON.parse('../../data/schedules.json');

const mapStateToProps = state => ({
    selectedRoom: state.selectedRoom,
});

const mapDispatchToProps = dispatch => ({
    onBackButtonClicked: () => dispatch(selectRoom('')),
});

const propTypes = {
    onBackButtonClicked: PropTypes.func.isRequired,
    selectedRoom: PropTypes.string,
};

const defaultProps = {
    selectedRoom: '',
};

const avEquipment = {
    lcd: 'LCD Display',
    projector: 'Projector',
    roundtable_device: 'Roundtable Device',
    smart_collaboration: 'Smart Collaboration',
    skype_collaboration: 'Skype Collaboration',
    surface_hub: 'Surface Hub',
};

const getRoomBookings = (selectedRoom) => {
    const selectRoomTitle = selectedRoom.title;
    const currSchedule = SchedulesJSON[selectRoomTitle];

    return currSchedule.map((entry, i) => (
        <List.Item
            className="listItem"
            key={i}
        >
            {entry[0]}
        </List.Item>
    ))
}

const getRoomEquipmentList = (selectedRoom) => {
    const roomEquipment = Object.keys(avEquipment).map(equipment => (
        <ListItem key={equipment}>
            <Icon
                name={selectedRoom[equipment] ? 'checkmark' : 'x'}
                color={selectedRoom[equipment] ? 'green' : 'red'}
            />
            {avEquipment[equipment]}
        </ListItem>));
    // All rooms have winked walls, need to be added at the end
    roomEquipment.push((
        <ListItem key="winked_wall">
            <Icon
                name="checkmark"
                color="green"
            />
            { 'Winked Wall' }
        </ListItem>));

    return roomEquipment;
};

function ConnectedRoomDetails({ selectedRoom, onBackButtonClicked }) {
    const selectedRoomInfo = Utils.getRoomByName(selectedRoom);
    // var imagePath = './images/rooms/' + this.getSelectedRoom().picture;
    return (
        <div className="roomDetailsContainer">
            <Grid textAlign="center" verticalAlign="middle">
                <Grid.Column width={3}>
                    <Button onClick={onBackButtonClicked} compact icon>
                        <Icon name="arrow left" />
                    </Button>
                </Grid.Column>
                <Grid.Column width={10}>
                    <Header as="h3">{selectedRoomInfo.title}</Header>
                </Grid.Column>
                <Grid.Column width={3} />
            </Grid>
            <Divider />
            <List>
                <List.Item
                    header="Room Code:"
                    description={selectedRoomInfo.code || 'N/A'}
                />
                <List.Item
                    header="Phone Number:"
                    description={selectedRoomInfo.phone_number || 'N/A'}
                />
                <List.Item
                    header="Seats:"
                    description={selectedRoomInfo.seats || 'N/A'}
                />
            </List>
            <Header as="h4" className="avEquipementHeader">
                <Icon name="tv" />
                <Header.Content>A/V Equipment</Header.Content>
            </Header>
            <List>
                {getRoomEquipmentList(selectedRoomInfo)}
            </List>
            <Header
                as="h4"
                className="avEquipmentHeader"
            >
                <Header.Content>Scheduled Bookings</Header.Content>
            </Header>
            <List>
                {getRoomBookings(selectedRoomInfo)}
            </List>
        </div>
    );
}

const RoomDetails = connect(mapStateToProps, mapDispatchToProps)(ConnectedRoomDetails);
ConnectedRoomDetails.propTypes = propTypes;
ConnectedRoomDetails.defaultProps = defaultProps;

export default RoomDetails;
