import React, { Component } from 'react';
import { Grid, Dropdown, Button, Icon } from 'semantic-ui-react';
import MultiSelect from './MultiSelect';
import { selectFloor, selectMapFilters, setInfoDialogVisibility } from '../actions/index';
import { connect } from 'react-redux';
import '../../css/toolbar.css';
import { FILTER_OPTIONS, FLOOR_OPTIONS } from '../constants/filters';
import NavigationMenu from './NavigationMenu';

const mapStateToProps = (state) => {
    return {
        selectedFloor: state.selectedFloor,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectFloor: floor => dispatch(selectFloor(floor)),
        selectMapFilters: filters => dispatch(selectMapFilters(filters)),
        setInfoDialogVisibility: visible => dispatch(setInfoDialogVisibility(visible))
    };
};

class ConnectedToolbar extends Component {
    constructor(props) {
        super(props);
        this.handleFloorChange = this.handleFloorChange.bind(this);
        this.handleMapFilterChange = this.handleMapFilterChange.bind(this);
        this.openInfoDialog = this.openInfoDialog.bind(this);
    }

    handleFloorChange(event, item) {
        localStorage.setItem('floor', item.value);
        this.props.selectFloor(item.value);
    }

    handleMapFilterChange(event, selectedFilters) {
        this.props.selectMapFilters(selectedFilters);
    }

    openInfoDialog() {
        this.props.setInfoDialogVisibility(true);
    }

    render() {
        return (
            <div className="toolbar">
                <Grid centered={true} columns={3}>
                    <Grid.Column>
                        <div className="sapLogoContainer">
                            <img alt="" src={require('../../images/saplogo.png')} className="sapLogo"/>
                        </div>
                    </Grid.Column>
                    <Grid.Column className="filterGridColumn">
                        <Dropdown
                            ref={(a) => this._selectedFloor = a}
                            className="floorDropdown"
                            selection
                            options={FLOOR_OPTIONS}
                            defaultValue={FLOOR_OPTIONS.key}
                            onChange={this.handleFloorChange}
                            value={this.props.selectedFloor}
                        />
                        <MultiSelect
                            ref={(a) => this._selectedFilters = a}
                            options={FILTER_OPTIONS}
                            defaultValue={FILTER_OPTIONS}
                            onChange={this.handleMapFilterChange}
                            text={"Filters"}
                        />
                    </Grid.Column>
                    <Grid.Column className="navInfoGridColumn">
                        <Button className="infoButton" onClick={this.openInfoDialog} icon>
                            <Icon name="info"/>
                        </Button>
                        <NavigationMenu />
                    </Grid.Column>
                </Grid>
            </div>
        );
    }
};

const Toolbar = connect(mapStateToProps, mapDispatchToProps)(ConnectedToolbar);

export default Toolbar;