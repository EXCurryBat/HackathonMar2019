import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Grid, List, Input, Button, Segment, Sidebar, Search, Tab, Icon, Menu } from 'semantic-ui-react';
import MultiSelect from './MultiSelect';
import Utils from './Utils';
import '../../css/roomlist.css';
import { selectRoom, selectFloor, selectDesk, selectRoomListTab, selectSearchFilters } from '../actions/index';
import { SHOW_NUM_SELECTED } from '../constants/view-types';
import { AV_EQUIPMENT_OPTIONS } from '../constants/av-equipment';
import { ALL_FLOORS, FLOOR1, FLOOR2, FLOOR3 } from '../constants/filters';

const roomList = require('../../data/rooms.json');
const deskList = require('../../data/desks.json');

const mapStateToProps = (state) => {
    return {
        selectedRoom: state.selectedRoom,
        selectedDesk: state.selectedDesk,
        selectedFloor: state.selectedFloor,
        selectedRoomListTab: state.selectedRoomListTab,
        selectedSearchFilters: state.selectedSearchFilters,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        selectRoom: room => dispatch(selectRoom(room)),
        selectDesk: desk => dispatch(selectDesk(desk)),
        selectFloor: floor => dispatch(selectFloor(floor)),
        selectRoomListTab: tab => dispatch(selectRoomListTab(tab)),
        selectSearchFilters: filters => dispatch(selectSearchFilters(filters))
    };
};
class ConnectedRoomList extends Component {
    constructor(props) {
        super(props);
        this.getRooms = this.getRooms.bind(this);
        this.getDesks = this.getDesks.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onRoomClick = this.onRoomClick.bind(this);
        this.onDeskClick = this.onDeskClick.bind(this);
        this.toggleSearchOptionsVisibility = this.toggleSearchOptionsVisibility.bind(this);
        this.getSearchOptionsSidebar = this.getSearchOptionsSidebar.bind(this);
        this.onSearchOptionsChange = this.onSearchOptionsChange.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.filterRooms = this.filterRooms.bind(this);
        this.state = {
            rooms: roomList,
            desks: deskList,
            searchFilterActive: false,
            searchOptionsVisibility: false,
        };
    }
    handleTabChange(event, data) {
        this.props.selectRoomListTab(data.activeIndex);
    }
    onSearchChange(event, { value }) {
        setTimeout(() => {
            if (value.length < 1) {
                this.setState({
                    rooms: roomList,
                    desks: deskList,
                });
            }
            const re = new RegExp(_.escapeRegExp(value), 'i');
            const isMatch = result => re.test(result.title);
            this.setState({
                rooms: _.filter(roomList, isMatch),
                desks: _.filter(deskList, isMatch),
            });
        }, 10);
    }
    toggleSearchOptionsVisibility() {
        this.setState({
            searchOptionsVisibility: !this.state.searchOptionsVisibility
        });
    }
    onSearchOptionsChange(event, value) {
        var selectedAVEquipment = this.props.selectedSearchFilters.avEquipment || [];
        var seats = this.props.selectedSearchFilters.seats || 0;
        if (value.constructor === Array) {
            selectedAVEquipment = value;
        } else {
            seats = parseInt(value.value);
        }
        this.props.selectSearchFilters(
            {
                avEquipment: selectedAVEquipment,
                seats: seats
            }
        );
        this.filterRooms(seats, selectedAVEquipment);
    }
    onRoomClick(event) {
        var room = Utils.getRoomByName(event.target.innerText);
        if (this.props.selectedFloor !== room.floor) {
            this.props.selectFloor(room.floor);
        }
        Utils.setURLParam('selectedRoom', room.title);
        this.props.selectRoom(room.title);
        this.setState({
            searchOptionsVisibility: false
        });
    }
    onDeskClick(event) {
        var desk = Utils.getDesk(event.target.innerText);
        if (this.props.selectedFloor !== desk.floor) {
            this.props.selectFloor(desk.floor);
        }
        Utils.setURLParam('selectedDesk', desk.title)
        this.props.selectDesk(desk.title);
        this.setState({
            searchOptionsVisibility: false
        });
    }
    filterRooms(seats, selectedAVEquipment) {
        let rooms = roomList.slice(0); // make a copy
        let match;
        let updatedRoomList = [];
        for (let i = 0; i < rooms.length; i++) {
            let room = rooms[i];
            match = true;
            if (selectedAVEquipment.length > 0) {
                for (let j in selectedAVEquipment) {
                    if (!room[selectedAVEquipment[j]]) {
                        match = false;
                    }
                }
            }
            if (seats > room.seats) {
                match = false;
            }
            if (match) {
                updatedRoomList.push(room);
            }
        }
        this.setState({
            rooms: updatedRoomList,
            searchFilterActive: (seats || selectedAVEquipment.length) ? true : false
        });
    }
    componentDidMount() {
        this.filterRooms(this.props.selectedSearchFilters.seats, this.props.selectedSearchFilters.avEquipment);
    }
    getRooms(floor = ALL_FLOORS.index) {
        let rooms = Object.values(this.state.rooms);
        if (floor !== ALL_FLOORS.index) {
            rooms = rooms.filter((room) => {
                return (room.floor === floor);
            });
        }
        rooms.sort((roomA, roomB) => roomA.title.localeCompare(roomB.title));
        return rooms.map((room, i) => (
            <List.Item className="listItem" key={i} onClick={this.onRoomClick}>
                {room.title}
            </List.Item>
        ));
    }
    getDesks() {
        const desks = this.state.desks;
        return desks.map((desk, i) => {
            const { selectedDesk } = this.props;
            let listItemClass = 'listItem';
            if (selectedDesk === desk.title) {
                listItemClass += ' active';
            }
            return (
                <List.Item className={listItemClass} key={i} onClick={this.onDeskClick}>
                    {desk.title}
                </List.Item>
            );
        });
    }
    getSearchOptionsSidebar() {
        let avEquipmentOptions = AV_EQUIPMENT_OPTIONS;
        return (
            <Grid padded className="additionalSearchOptionsForm">
                <Grid.Row className="seatsFormField">
                    <Grid.Column>
                        <label className="timeHourLabel">Hour</label>
                        <select id= "floorList"
                            className="timeHourInput"
                            defaultValue={this.props.selectedSearchFilters.seats || undefined}
                            onChange={this.onSearchOptionsChange}
                            ref={(a) => this._attendeesInput = a}
                            >
                            <option value="00">00</option>
                            <option value="01">01</option>
                            <option value="02">02</option>
                            <option value="03">03</option>
                            <option value="04">04</option>
                            <option value="05">05</option>
                            <option value="06">06</option>
                            <option value="07">07</option>
                            <option value="08">08</option>
                            <option value="09">09</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                            <option value="13">13</option>
                            <option value="14">14</option>
                            <option value="15">15</option>
                            <option value="16">16</option>
                            <option value="17">17</option>
                            <option value="18">18</option>
                            <option value="19">19</option>
                            <option value="20">20</option>
                            <option value="21">21</option>
                            <option value="22">22</option>
                            <option value="23">23</option>
                        </select>
                    </Grid.Column>
                    <Grid.Column>
                        <label className="timeMinuteLabel">Minute</label>
                        <select 
                            className="timeHourInput"
                            defaultValue={this.props.selectedSearchFilters.seats || undefined}
                            onChange={this.onSearchOptionsChange}
                            ref={(a) => this._attendeesInput = a}
                            >
                            <option value="00">00</option>
                            <option value="30">30</option>
                        </select>
                    </Grid.Column>
                    
                </Grid.Row>
                <Grid.Row className="seatsFormField">
                    <label className="seatsLabel">Seats</label>
                    <Input
                        placeholder={"Enter a value..."}
                        className="seatsInput"
                        onChange={this.onSearchOptionsChange}
                        defaultValue={this.props.selectedSearchFilters.seats || undefined}
                        ref={(a) => this._attendeesInput = a}/>
                </Grid.Row>
                <Grid.Row className="avEquipmentDropdownFormField">
                    <label className="avEquipmentLabel">A/V Equipment</label>
                    <MultiSelect
                        role="input"
                        ref={(a) => this._avEquipmentInput = a}
                        onChange={this.onSearchOptionsChange}
                        className="avEquipmentDropdown"
                        options={AV_EQUIPMENT_OPTIONS}
                        defaultValue={avEquipmentOptions.filter(item => this.props.selectedSearchFilters.avEquipment.includes(item.key))}
                        content={SHOW_NUM_SELECTED}
                        text={"Select an option..."}
                    />
                </Grid.Row>
            </Grid>
        );
    }
    render() {
        const panes = [
            {
                menuItem: "All",
                render: () => (
                    <Tab.Pane attached='top'>
                        <List selection className="roomList" verticalAlign='middle'>
                            {this.getRooms(ALL_FLOORS.index)}
                        </List>
                    </Tab.Pane>
                )
            },
            {
                menuItem: "1",
                render: () => (
                    <Tab.Pane attached='top'>
                        <List selection className="roomList" verticalAlign='middle'>
                            {this.getRooms(FLOOR1.index)}
                        </List>
                    </Tab.Pane>
                )
            },
            {
                menuItem: "2",
                render: () => (
                    <Tab.Pane attached='top'>
                        <List selection className="roomList" verticalAlign='middle'>
                            {this.getRooms(FLOOR2.index)}
                        </List>
                    </Tab.Pane>
                )
            },
            {
                menuItem: "3",
                render: () => (
                    <Tab.Pane attached='top'>
                        <List selection className="roomList" verticalAlign='middle'>
                            {this.getRooms(FLOOR3.index)}
                        </List>
                    </Tab.Pane>
                )
            },
            {
                menuItem: (
                    <Menu.Item key='desks'>
                        Desks
                    </Menu.Item>
                ),
                render: () => (
                    <Tab.Pane attached='top'>
                        <List selection className="roomList" verticalAlign='middle'>
                            {this.getDesks()}
                        </List>
                    </Tab.Pane>
                )
            }
        ]
        return (
            <div className="roomListContainer">
                <div className="searchbarOuterContainer">
                    <div className="searchbarContainer">
                        <Search fluid className="searchbar" open={false} placeholder="Search..." onSearchChange={this.onSearchChange} />
                    </div>
                    <div className="filterSearchButtonContainer">
                        <Button className="filterSearchButton" color={this.state.searchFilterActive ? 'blue' : 'white'} onClick={this.toggleSearchOptionsVisibility} icon ref={(a) => this._filterSearchButton = a}>
                            <Icon name="options"/>
                        </Button>
                    </div>
                </div>
                <Sidebar.Pushable as={Segment} className="sidebarPushable">
                    <Sidebar as={Segment} className="additionalSearchOptions" animation='overlay' direction='top' width="wide" visible={this.state.searchOptionsVisibility}>
                        {this.getSearchOptionsSidebar()}
                    </Sidebar>
                    <Sidebar.Pusher>
                        {<Tab className="roomListTab" menu={{attached: 'bottom'}} panes={panes} onTabChange={this.handleTabChange} activeIndex={this.props.selectedRoomListTab}/>}
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </div>
        );
    }
};
const RoomList = connect(mapStateToProps, mapDispatchToProps)(ConnectedRoomList);
export default RoomList;