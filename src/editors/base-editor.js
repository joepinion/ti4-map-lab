import React from 'react';
import $ from 'jquery';
import ls from "local-storage";

import {
    planet_data,
    system_data,
} from '../data/tile_data.js';
import default_layouts from '../data/default_layouts.json';

import {
    Map,
    MapSpace,
    SystemBox,
    PlanetBox,
    System,
} from "../map-logic";

window.jQuery = $;

export class BaseEditor extends React.Component {
    constructor(props) {
        super(props);
        this.planet_box = new PlanetBox(planet_data);
        this.system_box = new SystemBox(system_data, this.planet_box);
        this.default_layouts = default_layouts;

        this.state = {
            "map": null,
            "message": "",
            "input_title": "",
            "saved_data": ls.get(this.props.storage_key) || [],
            "selected_item": this.getNewStringValue(),
        };
    }

    getMessageHtml() {
        let message = null;
        if(this.state.message !== null && this.state.message!=="") {
            message = (
                <div className="block content for-message">
                      <blockquote>{this.state.message}</blockquote>
                    <div
                        className="close-button"
                        onClick={()=>this.setNoMessage()}
                    >
                        <i className="fa fa-window-close fa-2x"></i>
                    </div>
                </div>
            );
        }
        return message;
    }

    setNoMessage() {
        this.setState({"message": null});
    }

    componentWillUnmount() {
        this.props.sendStateBeforeDeath(this.state);
    }

    setMap(new_map) {
        this.setState({"map": new_map});
    }

    getLayoutFromJSON(data) {
        let new_map = new Map(false);
        for(let one_space_data of data) {
            let space_system = null;
            if(one_space_data.system!==null) {
                space_system = new System(one_space_data.system, this.planet_box);
            }
            new_map.spaces.push(new MapSpace(
                one_space_data.x,
                one_space_data.y,
                one_space_data.z,
                one_space_data.warp_spaces,
                one_space_data.type,
                space_system,
            ));
        }
        return new_map;
    }

    getJSONDataFromSpaces(spaces) {
        let spaces_data = [];
        for(let one_space of spaces) {
            let space_data = Object.assign({}, one_space, {"system": null});
            if(one_space.system !== null) {
                let system_data = Object.assign({}, one_space.system, {"planets":[]});
                for(let one_planet of one_space.system.planets) {
                    system_data.planets.push(one_planet.name);
                }
                space_data.system = system_data;
            }
            spaces_data.push(space_data);
        }
        return spaces_data;
    }

    getCurrentLayoutJSON() {
        let l_title = "Untitled Layout";
        if($('#layout-title').val() !== '') {
            l_title = $('#layout-title').val();
        }
        return {
            "title": l_title,
            "data": this.getJSONDataFromSpaces(this.state.map.spaces),
        };
    }

    getCurrentLayoutJSONFileInfo() {
        let data = this.getCurrentLayoutJSON();
        this.setState({"message": ""});
        return {
            "filename": data.title,
            "data": [data]
        };
    }

    getAllLayoutJSONFileInfo() {
        this.setState({"message": ""});
        let data = ls.get(this.props.storage_key) || [];
        return {
            "filename": "All "+this.props.subject_plural,
            "data": data
        };
    }

    setLayout(data, selected_item="new", new_map=null) {
        if(new_map===null) new_map = this.getLayoutFromJSON(data.data);
        let loadedTitle = data.title;
        let new_message = this.props.subject+" '"+loadedTitle+"' displayed.";
        this.setMap(new_map);
        this.setState({
            "message": new_message,
            "input_title": loadedTitle,
            "selected_item": selected_item.toString(),
        });
    }

    addLayoutsFromJSON(data) {
        if(data.length>0) {
            let saved_data = Object.assign([], this.state.saved_data);
            for(let dataToSave of data) {
                saved_data.push(dataToSave);
            }
            ls.set(this.props.storage_key, saved_data);
            this.setLayout(saved_data[saved_data.length-1], saved_data.length-1);
            let new_map = this.getLayoutFromJSON(saved_data[saved_data.length-1].data);
            this.setMap(new_map);
            this.setState({
                "saved_data": ls.get(this.props.storage_key) || [],
                "message": "Layouts loaded.",
                "selected_item": saved_data.length-1,
                "input_title": saved_data[saved_data.length-1].title,
            });
        } else {
            this.setState({"message": "There were no "+this.props.subject_plural+" to load."})
        }
    }

    getSelectValue() {
        let int_select = document.getElementById("layout-select");
        return int_select.options[int_select.selectedIndex].value;
    }

    saveCurrent() {
        let dataToSave = this.getCurrentLayoutJSON();
        let currentIndex = this.getSelectValue();
        let saved_data = Object.assign([], this.state.saved_data);
        let new_selected = saved_data.length;
        if(
            currentIndex.split("_")[0] === "new" ||
            currentIndex.split("_")[0] === "newc"
        ) {
            saved_data.push(dataToSave);
        } else {
            saved_data[parseInt(currentIndex)] = dataToSave;
            new_selected = parseInt(currentIndex);
        }
        ls.set(this.props.storage_key, saved_data);
        this.setState({
            "selected_item": new_selected.toString(),
            "saved_data": ls.get(this.props.storage_key) || [],
            "message": this.props.subject+" '"+dataToSave.title+"' saved.",
        });
    }

    deleteCurrent() {
        let currentIndex = this.getSelectValue();
        let saved_data = Object.assign([], this.state.saved_data);
        let toDel = saved_data.splice(parseInt(currentIndex), 1)[0];
        ls.set(this.props.storage_key, saved_data);
        this.setMap(this.getNewLayout());
        this.setState({
            "input_title": "",
            "selected_item": this.getNewStringValue(),
            "message": this.props.subject+" '"+toDel.title+"' deleted.",
            "saved_data": ls.get(this.props.storage_key) || [],
        });
    }

    deleteAll() {
        ls.remove(this.props.storage_key);
        this.setMap(this.getNewLayout());
        this.setState({
            "saved_data": ls.get(this.props.storage_key) || [],
            "selected_item": this.getNewStringValue(),
            "input_title": "",
            "message": "All saved "+this.props.subject_plural+" have been deleted.",
            "bank_systems": this.syncBankSystems(this.getNewLayout()),
        });
    }
}