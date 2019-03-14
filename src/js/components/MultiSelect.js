import React, { Component } from 'react';
import { SHOW_VALUES, SHOW_NUM_SELECTED } from '../constants/view-types';
import '../../css/multiselect.css';

class ListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
        active: this.props.active // initial
    };
  }
  
  render() {
    return (
      <a
      onClick={() => {
        this.setState(prevState => {
          let newState = !prevState.active;
          this.props.handleClick(newState, this.props.value);
          return {
            active: newState
          };
        });
      }}
      className={!this.state.active ? '' : 'selected'}
      href="#">
      {this.props.value.text}</a>
    )
  }
}

class MultiSelect extends Component {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.hideList = this.hideList.bind(this);
    this.state = {
      showList: false,
      selectedItems: this.props.defaultValue
    }
  }

  hideList(e) {
    if(!this.node.contains(e.target)) {
      this.setState({showList: false})
    }
  }
  
  componentDidMount() {
    document.addEventListener('mousedown', this.hideList)
  }
  
  componentWillUnmount() {
     document.removeEventListener('mousedown', this.hideList);
  }
  
  renderValue() {
    var text = this.props.text ? this.props.text : '';
    switch (this.props.content) {
      case SHOW_VALUES:
        if (!this.state.selectedItems.length) {
            return text;
        } else {
            return this.state.selectedItems.join(', ');
        }

      case SHOW_NUM_SELECTED:
        if (!this.state.selectedItems.length) {
            return text;
        } else {
            return this.state.selectedItems.length + " item(s) selected";
        }

      default:
        return text;
    }
  }
  
  toggleList() {
    this.setState(prevState => ({showList: !prevState.showList}))
  }
  
  handleItemClick(active, newItem) {
    let newSelected = [];
    let selectedItems = this.state.selectedItems;
    if (active) {
        newSelected = [...selectedItems, newItem];
    } else {
        newSelected = selectedItems.filter(item => item.key !== newItem.key);
    }

    this.setState({
        selectedItems: newSelected
    });

    if (this.props.onChange) {
        this.props.onChange(null, newSelected.map(item => item.key));
    }
  }
  
  render() {
    return (
      <div 
      ref={node => this.node = node}
      className="select">
        <button className="multiselect_btn ui selection dropdown" onClick={this.toggleList.bind(this)}>
          <span className="select_value">
            {this.renderValue()}
          </span>
          <i aria-hidden="true" className="dropdown icon"></i>
        </button>
        <div
        className={"select_list " + (!this.state.showList && 'hide')}>
            {this.props.options.map((item) => (
                <ListItem handleClick={this.handleItemClick} value={item} active={this.props.defaultValue.find(opt => opt.key === item.key)}/>
            ))}
        </div>
      </div>
    )
  }
}

export default MultiSelect;