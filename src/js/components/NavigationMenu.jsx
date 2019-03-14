import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Popup, Form, Search, Button, Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { startNavigation } from '../actions/index';

const ROOM_LIST = require('../../data/rooms.json');
const DESK_LIST = require('../../data/desks.json');

const locationList = ROOM_LIST.concat(DESK_LIST);

const mapStateToProps = state => ({
    selectedRoom: state.selectedRoom,
    selectedDesk: state.selectedDesk,
    navigateFrom: state.navigateFrom,
    navigateTo: state.navigateTo,
});

const mapDispatchToProps = dispatch => ({
    onStartNavigationClick: (from, to) => dispatch(startNavigation(from, to)),
});

const propTypes = {
    selectedRoom: PropTypes.string,
    selectedDesk: PropTypes.string,
    navigateFrom: PropTypes.string,
    navigateTo: PropTypes.string,
    onStartNavigationClick: PropTypes.func.isRequired,
};

const defaultProps = {
    selectedRoom: '',
    selectedDesk: '',
    navigateFrom: '',
    navigateTo: '',
};

const center = {
    'text-align': 'center',
};

function getResults(value) {
    let results;
    if (value.length < 1) {
        results = [];
    } else {
        const re = new RegExp(_.escapeRegExp(value), 'i');
        const isMatch = result => re.test(result.title);
        results = locationList.filter(isMatch).slice(0, 6);
    }
    return results;
}

class ConnectedNavigationMenu extends PureComponent {
    constructor(props) {
        super(props);
        this.handleStartNavigation = this.handleStartNavigation.bind(this);
        this.handleSearchFromSelect = this.handleSearchFromSelect.bind(this);
        this.handleSearchFromChange = this.handleSearchFromChange.bind(this);
        this.handleSearchToChange = this.handleSearchToChange.bind(this);
        this.handleSearchToSelect = this.handleSearchToSelect.bind(this);
        this.state = {
            valueFrom: props.navigateFrom || props.selectedRoom || props.selectedDesk || '',
            valueTo: props.navigateTo || '',
            resultsFrom: [],
            resultsTo: [],
        };
    }

    handleStartNavigation() {
        const { valueFrom, valueTo } = this.state;
        const { onStartNavigationClick } = this.props;
        onStartNavigationClick(valueFrom, valueTo);
    }

    handleSearchFromSelect(e, { result }) {
        this.setState({ valueFrom: result.title });
        this.setState({ resultsFrom: [] });
    }

    handleSearchToSelect(e, { result }) {
        this.setState({ valueTo: result.title });
        this.setState({ resultsTo: [] });
    }

    handleSearchFromChange(e, { value }) {
        this.setState({ valueFrom: value }, () => {
            const resultsFrom = getResults(value);
            this.setState({ resultsFrom });
        });
    }

    handleSearchToChange(e, { value }) {
        this.setState({ valueTo: value }, () => {
            const resultsTo = getResults(value);
            this.setState({ resultsTo });
        });
    }

    render() {
        const {
            valueFrom,
            valueTo,
            resultsFrom,
            resultsTo,
        } = this.state;
        return (
            <Popup
                trigger={(
                    <Button className="navigationButton" onClick={this.toggleNavigationVisibility}>
                        { 'Navigation' }
                        <Icon name="location arrow" />
                    </Button>
                )}
                on="click"
                content={(
                    <Form className="navigationForm">
                        <Form.Field>
                            <label class="navigationFromLabel">From</label>
                            <Search
                                value={valueFrom}
                                onSearchChange={_.debounce(this.handleSearchFromChange, 500, { leading: true })}
                                results={resultsFrom}
                                onResultSelect={this.handleSearchFromSelect}
                                showNoResults={false}
                                selectFirstResult
                            />
                        </Form.Field>
                        <Form.Field>
                            <label className="navigationToLabel">To</label>
                            <Search
                                value={valueTo}
                                onSearchChange={_.debounce(this.handleSearchToChange, 500, { leading: true })}
                                results={resultsTo}
                                onResultSelect={this.handleSearchToSelect}
                                showNoResults={false}
                                selectFirstResult
                            />
                        </Form.Field>
                        <Form.Field style={center}>
                            <Button onClick={this.handleStartNavigation}>
                                { 'Start Navigation' }
                            </Button>
                        </Form.Field>
                    </Form>
                )}
            />
        );
    }
}

const NavigationMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedNavigationMenu);
ConnectedNavigationMenu.propTypes = propTypes;
ConnectedNavigationMenu.defaultProps = defaultProps;

export default NavigationMenu;
