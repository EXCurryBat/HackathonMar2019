import React, { Component } from 'react';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import _ from 'lodash';
import { Grid, List, Input, Button, Segment, Sidebar, Search, Tab, Icon, Menu, Divider } from 'semantic-ui-react';
import MultiSelect from './MultiSelect';
import Utils from './Utils';
import '../../css/roomlist.css';
import { selectRoom, selectFloor, selectDesk, selectRoomListTab, selectSearchFilters } from '../actions/index';
import { SHOW_NUM_SELECTED } from '../constants/view-types';
import { AV_EQUIPMENT_OPTIONS } from '../constants/av-equipment';
import { ALL_FLOORS, FLOOR1, FLOOR2, FLOOR3 } from '../constants/filters';

const SchedulesJSON = require('../../data/schedules.json');

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
        this.checkSchedule = this.checkSchedule.bind(this);
        this.state = {
            rooms: roomList,
            desks: deskList,
            searchFilterActive: false,
            searchOptionsVisibility: false,
            startDate: new Date(),
            // startTime: ''
        };
        this.handleDateChange = this.handleDateChange.bind(this);
        // this.handleTimeChange = this.handleTimeChange.bind(this);
    }

    // handleTimeChange(time) {
    //     this.setState({
    //       startTime: time
    //     });
    //     console.log(typeof(time))
    //   }

    handleDateChange(date) {
        this.setState({
          startDate: date
        });
        this.filterRooms(this.state.lastSeat, this.state.lastEquip, true, date);
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
            this.setState({
                lastEquip: selectedAVEquipment
            });
        } else {
            seats = parseInt(value.value);
            this.setState({
                lastSeat: seats
            });
        }
        this.props.selectSearchFilters(
            {
                avEquipment: selectedAVEquipment,
                seats: seats
            }
        );
        this.filterRooms(seats, selectedAVEquipment, true, this.state.startDate);

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

    submitSearch() {
        this.filterRooms(this.state.lastSeat, this.state.lastEquip, true, this.state.startDate);
        // alert('Hello!')
        // this.filterRooms(this.state.lastSeat, this.state.lastEquip);

        // let rooms = roomList.slice(0); // make a copy
        // let match;
        // let updatedRoomList = [];

        // for (let i = 0; i < rooms.length; i++) {
        //     let room = rooms[i];
        //     match = true;
        //     if (this.state.lastEquip.length > 0) {
        //         for (let j in this.state.lastEquip) {
        //             if (!room[this.state.lastEquip[j]]) {
        //                 match = false;
        //             }
        //         }
        //     }
        //     if (this.state.lastSeat > room.seats) {
        //         match = false;
        //     }
        //     if (match) {
        //         updatedRoomList.push(room);
        //     }
            
        // }


        // let monthPadding = '';
        // let datePadding = '';
        // let hourPadding = '';
        // let minutePadding = '';

        // if(this.state.startDate.getMonth() + 1 < 10){
        //     monthPadding = '0';
        // }

        // if(this.state.startDate.getDate() < 10){
        //     datePadding = '0';
        // }

        // if(this.state.startDate.getHours() < 10){
        //     hourPadding = '0';
        // }

        // if(this.state.startDate.getMinutes() < 10){
        //     minutePadding = '0';
        // }

        // var targetDateTime = `${monthPadding}${this.state.startDate.getMonth() + 1}-${datePadding}${this.state.startDate.getDate()}-${this.state.startDate.getFullYear()} ${hourPadding}${this.state.startDate.getHours()}${minutePadding}${this.state.startDate.getMinutes()}`;

        // // var currRooms = this.state.rooms;
        // let currRooms = updatedRoomList.splice(0);
        // var updatedRooms = [];
        // for (let i = 0; i < currRooms.length; i++) {
        //     console.log(currRooms[i].title);
        //     let room = currRooms[i];
        //     let isFull = false;

        //     //extract room schedule and compare
        //     let roomSchedule = SchedulesJSON[room.title];
        //     for(let j = 0; j < roomSchedule.length; j++){
        //         isFull = this.checkSchedule(targetDateTime, roomSchedule[j]);
        //         if(isFull){
        //             break;
        //         }
        //     }
        //     if(!isFull){

        //         updatedRooms.push(room);
        //     }

        // }
        // // console.log(targetDateTime);
        // this.setState({
        //     rooms: updatedRooms,
        //     searchFilterActive: true
        // });
    }

    onDeskClick(event) {
        var desk = Utils.getDesk(event.target.innerText);
        if (this.props.selectedFloor  !== desk.floor) {
            this.props.selectFloor(desk.floor);
        }
        Utils.setURLParam('selectedDesk', desk.title)
        this.props.selectDesk(desk.title);
        this.setState({
            searchOptionsVisibility: false
        });
    }

    checkSchedule(inputRange, scheduledSession){
        var targetDay = inputRange.split(" ")[0];
        var schedDay = scheduledSession[0].split(" ")[0];
        var sameDay = targetDay === schedDay;
        var targetStart = parseInt(inputRange.split(" ")[1]);
        var schedStart = parseInt(scheduledSession[0].split(" ")[1]);
        var schedEnd = parseInt(scheduledSession[1].split(" ")[1]);

        if(!sameDay){
            // console.log("DIFFERENT DAY");
            return false;
        }

        if(targetStart == schedStart){
            return true;
        } else if(targetStart < schedStart){

            // // Check if meeting will overlap
            // if(targetEnd <= schedStart){
            //     // console.log("No Conflict")
            //     return false;
            // }
            // // console.log("BIG CONFLICT");
            // return true;
            return false

        } else {
            if(targetStart >= schedEnd){
                // console.log("No Conflict");
                return false;
            }
            // console.log("BIG CONFLICT");
            return true;
        }
    }

    filterRooms(seats, selectedAVEquipment, searchSubmit, inputDate) {
        
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
        
        if(searchSubmit && inputDate != undefined){
            let monthPadding = '';
            let datePadding = '';
            let hourPadding = '';
            let minutePadding = '';

            let currTargetDate = inputDate;

            if(currTargetDate.getMonth() + 1 < 10){
                monthPadding = '0';
            }

            if(currTargetDate.getDate() < 10){
                datePadding = '0';
            }

            if(currTargetDate.getHours() < 10){
                hourPadding = '0';
            }

            if(currTargetDate.getMinutes() < 10){
                minutePadding = '0';
            }

            var targetDateTime = `${monthPadding}${currTargetDate.getMonth() + 1}-${datePadding}${currTargetDate.getDate()}-${currTargetDate.getFullYear()} ${hourPadding}${currTargetDate.getHours()}${minutePadding}${currTargetDate.getMinutes()}`;

            // var currRooms = this.state.rooms;
            let currRooms = updatedRoomList.splice(0);
            var updatedRooms = [];
            for (let i = 0; i < currRooms.length; i++) {
                // console.log(currRooms[i].title);
                let room = currRooms[i];
                let isFull = false;

                //extract room schedule and compare
                let roomSchedule = SchedulesJSON[room.title];
                for(let j = 0; j < roomSchedule.length; j++){
                    if(isFull){
                        continue;
                    } else {
                        isFull = this.checkSchedule(targetDateTime, roomSchedule[j]);
                    }
                }
                if(!isFull){
                    updatedRooms.push(room);
                }

            }
            // console.log(targetDateTime);
            this.setState({
                rooms: updatedRooms,
                searchFilterActive: true
            });
            console.log(this.state.rooms);
        } else {
            this.setState({
                rooms: updatedRoomList,
                searchFilterActive: (seats || selectedAVEquipment.length) ? true : false
            });
        }
        
    }

    componentDidMount() {
        this.filterRooms(this.props.selectedSearchFilters.seats, this.props.selectedSearchFilters.avEquipment, false, this.state.startDate);
        this.setState({
            lastSeat: this.props.selectedSearchFilters.seats,
            lastEquip: this.props.selectedSearchFilters.avEquipment
        });
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
                <Grid.Row className="textFormField">
                    <label className="timeHourLabel">Choose Meeting Date and Time</label>
                </Grid.Row>
                <Grid.Row className="dateFormField">
                    <DatePicker
                    className="dateInput"
                    hintText="Pick your date"
                    selected={this.state.startDate}
                    onChange={this.handleDateChange}
                    />
                </Grid.Row>
                <Grid.Row className="timeFormField">
                    <DatePicker
                    className="timeInput"
                    hintText="Pick your time"
                    selected={this.state.startDate}
                    onChange={this.handleDateChange}
                    showTimeSelect
                    showTimeSelectOnly
                    dateFormat="h:mm aa"
                    timeCaption="Time"
                    />
                </Grid.Row>
                    <Divider horizontal>O</Divider>

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
                <Grid.Row className="roomListButton">
                    <Button onClick={()=>{this.submitSearch()}}>Search</Button>
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
