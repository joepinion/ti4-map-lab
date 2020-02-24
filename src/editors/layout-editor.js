import React from 'react';
import $ from 'jquery';

import {warp_configs} from "../data/warp_data";

import {
    Map,
    MapSpace,
    areCoordsInList,
} from "../map-logic";
import {
    SYSTEM_FORMATS,
    MapComponent,
    MAP_SPACE_TYPES,
} from "../map-components";
import {
    JSONDownloadButton,
    JSONUploadButton,
} from "../download-helpers";
import {BaseEditor} from "./base-editor";
import {compareByID} from "../utilities";

window.jQuery = $;

export class LayoutEditor extends BaseEditor {
    constructor(props) {
        super(props);
        this.state.map = this.getNewLayout();
        this.state.show_warps = false;
        this.state.show_wormholes = false;
        this.state.show_anomalies = false;
        if(this.props.state_to_import) {
            let matching_options = this.getOptions().filter(option => option.index === this.props.state_to_import.selected_item);
            if (matching_options.length > 0) {
                this.state = this.props.state_to_import;
            }
        }
    }

    handleSelectChange() {
        let new_value = this.getSelectValue();
        if(new_value === "new") {
            this.setNewLayout();
        } else {
            let valIndex = parseInt(new_value);
            this.setLayout(this.state.saved_data[valIndex], new_value);
        }
    }

    isSelectNew(selected_item=null) {
        if(selected_item !== null) return selected_item==="new";
        return this.getSelectValue() === "new";
    }

    getNewStringValue() {
        return "new";
    }

    handleWarpChange() {
        let isChecked = document.getElementById("warp-checkbox").checked;
        this.setState({"show_warps": isChecked});
    }
    handleWormholeChange() {
        let isChecked = document.getElementById("wormhole-checkbox").checked;
        this.setState({"show_wormholes": isChecked});
    }
    handleAnomaliesChange() {
        let isChecked = document.getElementById("anomalies-checkbox").checked;
        this.setState({"show_anomalies": isChecked});
    }

    clickedSpace(index) {
        let new_map = this.state.map.makeCopy();
        let new_message = "";
        let clickedSpace = new_map.spaces[index];
        let go_next_type = false;

        switch(clickedSpace.type) {
            case MAP_SPACE_TYPES.WARP:
                if(!this.state.show_warps) {
                    go_next_type=true;
                    clickedSpace.warp_spaces = null;
                } else {
                    clickedSpace.warp_spaces = this._getNextWarp(new_map, clickedSpace);
                    if(clickedSpace.warp_spaces===null) go_next_type=true;
                }
                break;
            case MAP_SPACE_TYPES.SYSTEM:
                clickedSpace.system = this._getNextSystem(new_map, clickedSpace);
                if(clickedSpace.system===null) go_next_type = true;
                break;
            default:
                go_next_type = true;
                break;
        }
        if(go_next_type) {
            let keep_going = true;
            while(keep_going) {
                clickedSpace.type++;
                if(clickedSpace.type > MAP_SPACE_TYPES.WARP) {
                    clickedSpace.type = 1;
                }
                switch(clickedSpace.type) {
                    case MAP_SPACE_TYPES.SYSTEM:
                        clickedSpace.system = this._getNextSystem(new_map, clickedSpace);
                        if(clickedSpace.system!==null) keep_going = false;
                        break;
                    case MAP_SPACE_TYPES.WARP:
                        if(this.state.show_warps){
                            clickedSpace.warp_spaces = this._getNextWarp(new_map, clickedSpace);
                            if(clickedSpace.warp_spaces!==null) keep_going=false;
                        }
                        break;
                    default:
                        keep_going = false;
                        break;
                }
            }

        }
        if(!new_map.areWarpsLogical()) {
            new_message = "Warps do not yet connect to legal spaces. Layout not usable until warps connect.";
        }
        this.setMap(new_map);
        this.setState({"message": new_message,})
    }

    loadDefault(index) {
        let toLoad = this.default_layouts[index];
        let new_map = this.getLayoutFromJSON(toLoad.data);
        let loadedTitle = toLoad.title;
        let new_message = "Default layout '"+loadedTitle+"' displayed.";
        this.setMap(new_map);
        this.setState({
            "message": new_message,
            "input_title": loadedTitle,
            "selected_item": this.getNewStringValue(),
        });
    }

    getNewLayout() {
        let starting_space = new MapSpace(0,0,0);
        return new Map(true, starting_space, 3);
    }

    setNewLayout() {
        let map = this.getNewLayout();
        this.setMap(map);
        this.setState({"selected_item": this.getNewStringValue(), "message": "", "input_title": ""});
    }

    _getNextWarp(map, space) {
        let proposed_warp = space.warp_spaces;
        if(proposed_warp === null) {
            proposed_warp = 0;
        } else {
            proposed_warp++;
        }
        while(proposed_warp < warp_configs.length) {
            let proposed_config = warp_configs[proposed_warp];
            let is_legal = true;
            for(let one_warp of proposed_config) {
                for(let one_coord of one_warp) {
                    if(!areCoordsInList(
                        space.getWarpDirectionCoordinates(one_coord),
                        map.spaces
                    )) {
                        is_legal = false;
                        break;
                    }
                }
            }
            if(is_legal) {
                break;
            }
            proposed_warp++;
        }
        if(proposed_warp >= warp_configs.length) {
            return null;
        }
        return proposed_warp;
    }

    _getNextSystem(map, space) {
        let eligible_systems = [];
        let current_id = 0;
        if(space.system!==null) current_id=space.system.id;
        for(let one_system of this.system_box.systems) {
            if(
                map.getSpaceBySystemID(one_system.id)===null
                &&
                one_system.id>current_id
                &&
                (
                    one_system.isMecatolRexSystem()
                    ||
                    (one_system.wormhole!==null && this.state.show_wormholes)
                    ||
                    (one_system.anomaly!==null && this.state.show_anomalies)
                )
            ) {
                eligible_systems.push(one_system);
            }
        }
        if(eligible_systems.length===0) return null;
        eligible_systems.sort(compareByID);
        return eligible_systems[0];
    }

    getOptions() {
        let options = [{
            "index": "new",
            "title": "New Layout",
        }];
        for(let [index, one_saved] of this.state.saved_data.entries()) {
            options.push({
                "index": index.toString(),
                "title": one_saved.title,
            });
        }
        return options;
    }

    render() {
        let options = [];
        for(let opt of this.getOptions()) {
            options.push(
                <option value={opt.index} key={opt.index}>{opt.title}</option>
            );
        }
        let defaults = [];
        for(let [index, one_default] of this.default_layouts.entries()) {
            defaults.push(
                <p className="control" key={index}>
                    <button
                        className="button is-small is-link"
                        onClick={()=>this.loadDefault(index)}
                        key={"default_layout_"+index}
                    >
                        {one_default.title}
                    </button>
                </p>
            )
        }

        return(
            <div className="block">
                <h2 className="title is-size-4">Layout Editor</h2>
                <div className="block map-lab-control-panel">
                    <div className="field is-horizontal">
                        <div className="field-label">
                            <label className="label">Default Layouts:</label>
                        </div>
                        <div className="field-body">
                            <div className="field is-grouped is-grouped-multiline">
                                {defaults}
                            </div>
                        </div>
                    </div>
                    <div className="field is-horizontal">
                        <div className="field-label">
                            <label className="label">Saved Layouts:</label>
                        </div>
                        <div className="field-body">
                            <div className="field is-grouped is-grouped-multiline">
                                <p className="control">
                                    <span className="select is-small">
                                        <select
                                            id="layout-select"
                                            value={this.state.selected_item}
                                            onChange={()=>this.handleSelectChange()}
                                        >
                                            {options}
                                        </select>
                                    </span>
                                </p>
                                <p className="control">
                                    <JSONDownloadButton
                                        title="Download All"
                                        getDownloadInfo={()=>this.getAllLayoutJSONFileInfo()}
                                        className="button is-small"
                                    />
                                </p>
                                <p className="control">
                                    <button onClick={()=>this.deleteAll()} className="button is-small">
                                        Delete All
                                    </button>
                                </p>
                                <p className="control">
                                    <JSONUploadButton
                                        id="layout-json-upload"
                                        title="Upload"
                                        handleJSON={(data)=>this.addLayoutsFromJSON(data)}
                                        className="button is-small"
                                    />
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="field is-horizontal">
                        <div className="field-label">
                            <label className="label">Layout Title:</label>
                        </div>
                        <div className="field-body">
                            <div className="field is-grouped is-grouped-multiline">
                                <p className="control">
                                    <input
                                        type="text"
                                        id="layout-title"
                                        value={this.state.input_title}
                                        className="input is-small"
                                        onChange={function() {
                                            this.setState(
                                                {
                                                    "input_title": document.getElementById("layout-title").value,
                                                    "message": ""
                                                }
                                            );
                                        }.bind(this)}
                                    />
                                </p>
                                <p className="control">
                                    <button className="button is-small" onClick={()=>this.saveCurrent()}>Save</button>
                                </p>
                                <p className="control">
                                    <button className="button is-small" onClick={()=>this.handleSelectChange()}>Reset</button>
                                </p>
                                <p className="control">
                                    <button
                                        onClick={()=>this.deleteCurrent()}
                                        disabled={this.isSelectNew(this.state.selected_item)}
                                        className="button is-small"
                                    >Delete</button>
                                </p>
                                <p className="control">
                                    <JSONDownloadButton
                                        title="Download"
                                        getDownloadInfo={()=>this.getCurrentLayoutJSONFileInfo()}
                                        className="button is-small"
                                    />
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column is-one-fifth-desktop is-narrow-tablet map-controls-column">
                            {this.getMessageHtml()}
                            <div className="field">
                                <label className="label">Click Cycle</label>
                                <p className="control">
                                    <input
                                        type="checkbox"
                                        checked={this.state.show_warps}
                                        onChange={()=>this.handleWarpChange()}
                                        id="warp-checkbox"
                                    />
                                    <label htmlFor="warp-checkbox"> Include Warps in Click Cycle</label>
                                </p>
                                <p className="control">
                                    <input
                                        type="checkbox"
                                        checked={this.state.show_wormholes}
                                        onChange={()=>this.handleWormholeChange()}
                                        id="wormhole-checkbox"
                                    />
                                    <label htmlFor="wormhole-checkbox"> Include Womholes in Click Cycle</label>
                                </p>
                                <p className="control">
                                    <input
                                        type="checkbox"
                                        checked={this.state.show_anomalies}
                                        onChange={()=>this.handleAnomaliesChange()}
                                        id="anomalies-checkbox"
                                    />
                                    <label htmlFor="anomalies-checkbox"> Include Anomalies in Click Cycle</label>
                                </p>
                            </div>
                        </div>
                        <div className="column map-container">
                            <MapComponent
                                map={this.state.map}
                                system_format={SYSTEM_FORMATS.STREAMLINED}
                                system_box={this.system_box}
                                clickedSpace={(index)=>this.clickedSpace(index)}
                                map_class="layout-map"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}