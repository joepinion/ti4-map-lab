import React from 'react';
import $ from 'jquery';
import ls from "local-storage";

import {WORMHOLES} from "../data/tile_data";
import default_variables from '../data/default_evaluators.json';
import map_string_order from '../data/map_string_order.json';

import {getObjFromCoord, SystemBox} from "../map-logic";
import {
    SYSTEM_FORMATS,
    MapComponent,
    MAP_SPACE_TYPES,
    SystemBankComponent
} from "../map-components";
import {
    JSONDownloadButton,
    JSONUploadButton,
} from "../download-helpers";
import {BaseEditor} from "./base-editor";
import {
    shuffle,
    compareByID,
} from "../utilities";

window.jQuery = $;
const LOOPS_TO_TRY = 10000;

export class MapEditor extends BaseEditor {
    constructor(props) {
        super(props);
        let starting_layout = this.getLayoutFromJSON(this.default_layouts[0].data);
        this.state.map = starting_layout;
        this.state.selected_bank_system = null;
        this.state.system_format = SYSTEM_FORMATS.STREAMLINED_WITH_NAME;
        this.state.draggedSystem = null;
        this.state.option_pair_wormholes = true;
        this.state.option_include_all_wormholes = true;
        this.state.target_blue_total = "random";
        this.state.bank_systems = this.syncBankSystems(starting_layout);
        this.state.eval_option="default_0";
        this.state.eval_variables=default_variables[0];
        this.state.home_values = {};
        this.state.balance_difference = null;
        this.state.map_string = "";
        this.state.balance_options = {
            "dont_move_wormholes": false,
            "dont_move_anomalies": false,
            "dont_move_empty": false,
        };
        this.state.long_op = false;
        if(this.props.state_to_import) {
            let matching_options = this.getOptions().filter(option => option.index === this.props.state_to_import.selected_item);
            let matching_evals = this.getEvalOptions().filter(option => option.index === this.props.state_to_import.eval_option);
            if (matching_options.length > 0 && matching_evals.length > 0) {
                this.state = this.props.state_to_import;
            }
        }
    }

    setMap(new_map, home_values=null, balance_difference=null, eval_var=null) {
        if(new_map.isComplete()) {
            if(home_values===null) {
                if(eval_var===null) eval_var = this.state.eval_variables;
                home_values = this.getHomeValues(new_map, eval_var);
            }
            if(balance_difference===null) {
                balance_difference = this.getBalanceDifference(home_values);
            }
        } else {
            home_values = {};
            balance_difference = null;
        }
        this.setState({
            "map": new_map,
            "bank_systems": this.syncBankSystems(new_map),
            "home_values": home_values,
            "balance_difference": balance_difference,
            "map_string": this.getMapString(new_map),
        });
    }

    syncBankSystems(map) {
        let bank_systems = new SystemBox([], []);
        for(let system of this.system_box.systems) {
            if(map===null || !map.containsSystem(system.id)) {
                 bank_systems.systems.push(system);
             }
        }
        bank_systems.systems.sort(compareByID);
        return bank_systems;
    }

    setActiveBankSystem(system) {
        this.setState({"selected_bank_system": system});
    }

    handleSelectChange() {
        let new_value = this.getSelectValue();
        let new_check = this.getSelectNewMapValue();
        if(!(new_check === null)) {
            if(this.getSelectNewMapType() === "newc") {
                this.loadCustomLayout(new_check);
            } else {
                this.loadDefault(new_check);
            }
        } else {
            let valIndex = parseInt(new_value);
            this.setLayout(this.state.saved_data[valIndex], new_value);
        }
    }

    handleEvalChange(value) {
        let e_kind = value.split("_")[0];
        let e_index = value.split("_")[1];
        let e_var = null;
        if(e_kind==="default") {
            e_var = default_variables[e_index];
        } else {
            e_var = ls.get(this.props.eval_storage_key)[e_index];
        }
        this.setState({
            "eval_option": value,
            "eval_variables": e_var,
        });
        this.setMap(this.state.map, null, null, e_var);
    }

    getSelectNewMapValue(selected_item=null) {
        let new_value = selected_item;
        if(new_value===null) {
            new_value = this.getSelectValue();
        }
        new_value = new_value.toString();
        let new_check = new_value.split("_");
        if(
            new_check.length===2
            &&
            (new_check[0]==="new"||new_check[0]==="newc")) {
            return(parseInt(new_check[1]));
        }
        return null;
    }

    getSelectNewMapType() {
        return this.getSelectValue().split("_")[0];
    }

    getNewStringValue() {
        if(!this.state) return "new_0";
        if(this.state.selected_item.toString().substr(0, 3)==="new") return this.state.selected_item;
        return "new_0";
    }

    isSelectNew(selected_item=null) {
        return this.getSelectNewMapValue(selected_item)!==null;
    }

        handleFormatDisplayChange() {
        let int_select = document.getElementById("select-system-display");
        this.setState({"system_format": parseInt(int_select.options[int_select.selectedIndex].value)});
    }

    onSelectedSystemDrag(event) {
        this.setState({
          draggedSystem: this.state.selected_bank_system,
          message: "",
        });
    }

    onSystemDrag(event, system) {
        this.setState({
          draggedSystem: system,
          message: "",
        });
    }

    onSystemDragEnd(event) {
        this.setState({
          draggedSystem: null,
          message: "",
        });
    }

    onSystemDropped(event, space_index) {
        if(this.state.draggedSystem !== null) {
            let new_map = this.state.map.makeCopy();
            let selected_bank_system = this.state.selected_bank_system;
            let is_changed = false;
            if(space_index !== null) {
                let space = new_map.spaces[space_index];
                if(space.type === MAP_SPACE_TYPES.OPEN) {
                    if(this.state.selected_bank_system !== null && this.state.selected_bank_system.id === this.state.draggedSystem.id) {
                        selected_bank_system = null;
                    }
                    let old_space = new_map.getSpaceBySystemID(this.state.draggedSystem.id);
                    if(old_space) {
                        old_space.type = MAP_SPACE_TYPES.OPEN;
                        old_space.system = null;
                    }
                    space.system = this.state.draggedSystem;
                    space.type = MAP_SPACE_TYPES.SYSTEM;
                    is_changed = true;
                } else if(space.type === MAP_SPACE_TYPES.SYSTEM && !space.system.isMecatolRexSystem()) {
                    let replaced_system = space.system;
                    if (selected_bank_system !== null && selected_bank_system.id === this.state.draggedSystem.id) {
                        selected_bank_system = replaced_system;
                    } else {
                        new_map.getSpaceBySystemID(this.state.draggedSystem.id).system = replaced_system;
                    }
                    space.system = this.state.draggedSystem;
                    is_changed = true;
                }
            } else {
                let old_space = new_map.getSpaceBySystemID(this.state.draggedSystem.id);
                if(old_space) {
                    selected_bank_system = old_space.system;
                    old_space.type = MAP_SPACE_TYPES.OPEN;
                    old_space.system = null;
                    is_changed = true;
                }
            }

            if(is_changed) {
                this.setMap(new_map);
                this.setState({"selected_bank_system": selected_bank_system,});
            }
            this.onSystemDragEnd(event);
        }
    }

    handleIncludeWormholesChange() {
        let isChecked = document.getElementById("require-all-wormholes").checked;
        this.setState(
            {"option_include_all_wormholes": isChecked}
        );
    }

    handlePairWormholesChange() {
        let isChecked = document.getElementById("pair-wormholes").checked;
        this.setState(
            {"option_pair_wormholes": isChecked}
        );
    }

    handleTargetRatioChange() {
        let int_select = document.getElementById("target-ratio");
        let int_value = int_select.options[int_select.selectedIndex].value
        if(int_value !== "random") int_value = parseInt(int_value);
        this.setState({"target_blue_total": int_value});
    }

    loadDefault(index) {
        let toLoad = this.default_layouts[index];
        this.setLayout(toLoad, "new_"+index);
        let loadedTitle = toLoad.title;
        let new_message = "Blank map '"+loadedTitle+"' displayed.";
        this.setState({
            "message": new_message,
            "input_title": loadedTitle,
        });
    }

    loadCustomLayout(index) {
        let toLoad = ls.get(this.props.layout_storage_key)[index];
        let new_map = this.getLayoutFromJSON(toLoad.data);
        let loadedTitle = toLoad.title;
        let new_message = "Custom layout '"+loadedTitle+"' displayed.";
        this.setMap(new_map);
        this.setState({
            "message": new_message,
            "input_title": loadedTitle,
            "selected_item": "newc_"+index,
        });
    }

    getNewLayout() {
        let toLoad = this.default_layouts[0];
        let new_map = this.getLayoutFromJSON(toLoad.data);
        return new_map;
    }

    getMapString(map = this.state.map) {
        let final_string = "";
        let is_first = "";
        for(let one_coor of map_string_order) {
            let one_space = getObjFromCoord(one_coor, map.spaces);
            if(one_space && one_space.type===MAP_SPACE_TYPES.SYSTEM && one_space.system) {
                final_string+=is_first+one_space.system.id;
            } else {
                final_string+=is_first+"0";
            }
            is_first = " ";
        }
        return final_string;
    }

    loadMapFromString(map_string = this.state.map_string) {
        let new_map = this.state.map.makeCopy();
        let new_bank = this.state.bank_systems;
        let id_list = map_string.split(" ");
        for(let [index, one_id_string] of id_list.entries()) {
            let one_id = parseInt(one_id_string);
            if(one_id!==0) {
                let one_system = new_bank.getSystemByID(one_id);
                if(!one_system) {
                    let one_system_space = new_map.getSpaceBySystemID(one_id);
                    if(!one_system_space) {
                        this.setState({"message":"Space not found."});
                        return;
                    }
                    one_system = one_system_space.system;
                    one_system_space.type = MAP_SPACE_TYPES.OPEN;
                    one_system_space.system = null;
                    new_bank = this.syncBankSystems(new_map);
                }
                let new_space = getObjFromCoord(map_string_order[index], new_map.spaces);
                if(!new_space) {
                    this.setState({"message":"Invalid: Too many systems listed."});
                    return;
                }
                if(new_space.type!==MAP_SPACE_TYPES.OPEN && new_space.type!==MAP_SPACE_TYPES.SYSTEM) {
                    this.setState({"message":"Invalid: Placing system on improper space."});
                    return;
                }
                if(new_space.type===MAP_SPACE_TYPES.SYSTEM && new_space.system.isMecatolRexSystem()) {
                    this.setState({"message":"Invalid: Systems on top of Mecatol Rex."});
                    return;
                }
                if(new_space.type===MAP_SPACE_TYPES.OPEN) {
                    new_space.type = MAP_SPACE_TYPES.SYSTEM;
                }
                new_space.system = one_system;
                new_bank = this.syncBankSystems(new_map);
            }
        }
        this.setState({"message": "Map string loaded."});
        this.setMap(new_map);
    }

    clickedSpace(index) {
        let newState = Object.assign({},{
            "message": "",
            "selected_bank_system": this.state.selected_bank_system,
        });
        let new_map = this.state.map.makeCopy();
        let clickedSpace = new_map.spaces[index];
        let isChanged = false;

        switch(clickedSpace.type) {
            case MAP_SPACE_TYPES.OPEN:
                if(newState.selected_bank_system !== null) {
                    clickedSpace.system = newState.selected_bank_system;
                    clickedSpace.type = MAP_SPACE_TYPES.SYSTEM;
                    newState.selected_bank_system = null;
                    isChanged = true;
                }
                break;
            case MAP_SPACE_TYPES.SYSTEM:
                if(!clickedSpace.system.isMecatolRexSystem()) {
                    if(newState.selected_bank_system !== null) {
                        let replacement_system = newState.selected_bank_system;
                        newState.selected_bank_system = clickedSpace.system;
                        clickedSpace.system = replacement_system;
                        isChanged = true;
                    } else {
                        newState.selected_bank_system = clickedSpace.system;
                        clickedSpace.system = null;
                        clickedSpace.type = MAP_SPACE_TYPES.OPEN;
                        isChanged = true;
                    }
                }
                break;
            default:
                break;
        }

        if(isChanged) {
            this.setState(newState);
            this.setMap(new_map);
        }

    }

    autoCompleteStart() {
        if(!this.state.long_op) {
            this.setState({
                    "message": "Thinking...",
                    "long_op": true,
                },
                () => {
                    setTimeout(this.autoComplete.bind(this), 1);
                }
            );
        }
    }

    autoComplete() {
        let map_history = [{
            "map": this.state.map.makeCopy(this.planet_box),
            "system_box": this.state.bank_systems.makeCopy(),
        }];
        let gotamap = true;
        while(!map_history[map_history.length-1].map.isComplete()) {
            map_history = this._autoCompleteSteps(map_history, 1);
            if(map_history===false) {
                gotamap=false;
                break;
            }
        }
        let message = "Unable to find a legal completion of this map.";
        if(gotamap) {
            this.setMap(map_history[map_history.length-1].map);
            message = "Map completed randomly.";
            this.setState({
                "message": message,
                "selected_bank_system": null,
                "long_op": false,
            });
        }
    }

    _autoCompleteSteps(current_history, steps_forward, current_try_total=0, backwards_length=null) {
        if(backwards_length===null) backwards_length=current_history.length;
        let starting_length = current_history.length;
        for(let tries=current_try_total; tries<LOOPS_TO_TRY; tries++) {
            let new_history = this._addOneSystem(current_history[current_history.length-1]);
            if(!(new_history===false)) {
                current_history.push(new_history);
                if(current_history.length >= starting_length+steps_forward) {
                    return current_history;
                } else {
                    return this._autoCompleteSteps(current_history, steps_forward-1, tries, backwards_length);
                }
            }
        }
        let steps_forward_add = 0;
        while(current_history.length>=backwards_length) {
            steps_forward_add++;
            current_history.pop();
        }
        if(current_history.length===0) {
            return false;
        }
        return this._autoCompleteSteps(
            current_history,
            steps_forward+steps_forward_add,
            0,
            backwards_length-1);
    }

    _addOneSystem(newest_history) {
        let avail_sys_pool = [];
        let system_box = newest_history.system_box;
        let map = newest_history.map;
        for(let one_sys of system_box.systems) {
            let can_add = true;
            if (
                this.state.option_include_all_wormholes &&
                one_sys.wormhole === null &&
                system_box.getWormholeSystems().length >= map.getOpenSpacesTotal()
            ) {
                can_add = false;
            } else {
                if (this.state.option_pair_wormholes) {
                    let total_needed = 0;
                    let b_holes = system_box.getWormholeSystems(WORMHOLES.BETA).length;
                    let a_holes = system_box.getWormholeSystems(WORMHOLES.ALPHA).length;
                    if (b_holes === 1) total_needed++;
                    if (a_holes === 1) total_needed++;
                    if (
                        total_needed >= map.getOpenSpacesTotal()
                        &&
                        (
                            one_sys.wormhole === null
                            ||
                            (one_sys.wormhole !== WORMHOLES.BETA && a_holes !== 1)
                            ||
                            (one_sys.wormhole !== WORMHOLES.ALPHA && b_holes !== 1)
                        )
                    ) can_add = false;
                }
                if (can_add) avail_sys_pool.push(one_sys);
            }
        }
        if(this.state.target_blue_total!=="random") {
            let target_ratio = this.state.target_blue_total/(map.getPossibleSystemTotal()-this.state.target_blue_total);
            let current_ratio = map.getBlueSystemTotal()/map.getRedSystemTotal();
            if(target_ratio<current_ratio) {
                let replacement_pool = [];
                for(let one_sys of avail_sys_pool) {
                    if(one_sys.isRed()) replacement_pool.push(one_sys);
                }
                if(replacement_pool.length>0) avail_sys_pool = replacement_pool;
            } else if(target_ratio>current_ratio) {
                let replacement_pool = [];
                for(let one_sys of avail_sys_pool) {
                    if(one_sys.isBlue()) replacement_pool.push(one_sys);
                }
                if(replacement_pool.length>0) avail_sys_pool = replacement_pool;
            }
        }
        let chosen_system = avail_sys_pool[Math.floor(Math.random() * avail_sys_pool.length)];
        let avail_space_pool = [];
        for(let [index, one_space] of map.spaces.entries()) {
            if(one_space.type===MAP_SPACE_TYPES.OPEN) avail_space_pool.push(index);
        }
        let chosen_space_index = avail_space_pool[Math.floor(Math.random() * avail_space_pool.length)];
        let new_map = map.makeCopy();
        new_map.spaces[chosen_space_index].type = MAP_SPACE_TYPES.SYSTEM;
        new_map.spaces[chosen_space_index].system = chosen_system;
        let new_box = this.syncBankSystems(new_map);

        if(new_map.isLegal()) {
            return {
                "map": new_map,
                "system_box": new_box,
            }
        } else {
            return false;
        }
    }

    getHomeValues(map = this.state.map, evars = this.state.eval_variables) {
        let home_values = {};
        for(let [index, one_space] of map.spaces.entries()) {
            if(one_space.type === MAP_SPACE_TYPES.HOME) {
                home_values[index.toString()] = map.getHomeValue(
                    one_space, evars,
                );
            }
        }
        return home_values;
    }

    getBalanceDifference(home_values = this.state.home_values) {
        let max = null;
        let min = null;
        for(let one_home_key in home_values) {
            if(home_values.hasOwnProperty(one_home_key)) {
                if (max === null || home_values[one_home_key] > max) max = home_values[one_home_key];
                if (min === null || home_values[one_home_key] < min) min = home_values[one_home_key];
            }
        }
        return max-min;
    }

    handleBalanceOptionChange(which_option) {
        let options = Object.assign({}, this.state.balance_options);
        options[which_option] = !options[which_option];
        this.setState({"balance_options": options});
    }

    improveBalanceStart() {
        if(!this.state.long_op) {
            this.setState({
                    "message": "Thinking...",
                    "long_op": true,
                },
                ()=>{
                    setTimeout(this.improveBalance.bind(this), 1);
                }
            );
        }
    }

    improveBalance() {
        return new Promise((resolve)=> {
            let map = this.state.map;
            let eligible_system_spaces = [];
            for (let [index, one_space] of map.spaces.entries()) {
                if (one_space.type === MAP_SPACE_TYPES.SYSTEM) {
                    if (
                        !one_space.system.isMecatolRexSystem()
                        &&
                        (!this.state.balance_options.dont_move_wormholes
                            || one_space.system.wormhole === null)
                        &&
                        (!this.state.balance_options.dont_move_anomalies
                            || one_space.system.anomaly === null)
                        &&
                        (!this.state.balance_options.dont_move_empty
                            || one_space.system.wormhole !== null
                            || one_space.system.anomaly !== null
                            || one_space.system.planets.length > 0)
                    ) eligible_system_spaces.push(index);
                }
            }
            shuffle(eligible_system_spaces);
            let found_it = false;
            let new_map = null;
            let new_hv = null;
            let new_diff = null;
            for(let a=0; a<eligible_system_spaces.length; a++) {
                for(let b=0; b<eligible_system_spaces.length; b++) {
                    if(a!==b) {
                        new_map = this.state.map.makeCopy();
                        let replaced_system = new_map.spaces[eligible_system_spaces[b]].system;
                        new_map.spaces[eligible_system_spaces[b]].system = new_map.spaces[eligible_system_spaces[a]].system;
                        new_map.spaces[eligible_system_spaces[a]].system = replaced_system;
                        if (new_map.isLegal()) {
                            new_hv = this.getHomeValues(new_map);
                            new_diff = this.getBalanceDifference(new_hv);
                            if (new_diff < this.state.balance_difference) {
                                found_it = true;
                                break;
                            }
                        }
                    }
                }
                if(found_it) break;
            }
            if (found_it) {
                this.setMap(new_map, new_hv, new_diff);
                this.setState({
                    "message": "Balance gap has been improved.",
                    "long_op": false,
                });
            } else {
                this.setState({
                    "message": "Failed to improve balance gap.",
                    "long_op": false,
                });
            }
        });
    }

    getEvalOptions() {
        let options = [];
        for(let [index, one_default] of default_variables.entries()) {
            options.push({
                "index": "default_"+index,
                "title": one_default.title,
            })
        }
        for(let [index, one_saved] of (ls.get(this.props.eval_storage_key).entries() || [])) {
            options.push({
                "index": "custom_"+index.toString(),
                "title": one_saved.title,
            });
        }
        return options;
    }

    getOptions() {
        let options = [];
        for(let [index, one_default] of this.default_layouts.entries()) {
            options.push({
                "index": "new_"+index,
                "title": "New from default layout "+one_default.title,
            });
        }
        for(let [index, one_custom_l] of (ls.get(this.props.layout_storage_key) || []).entries()) {
            if(this.getLayoutFromJSON(one_custom_l.data).areWarpsLogical()) {
                options.push({
                    "index": "newc_" + index,
                    "title": "New from custom layout " + one_custom_l.title,
                });
            }
        }
        for(let [index, one_saved] of this.state.saved_data.entries()) {
            options.push({
                "index": index,
                "title": one_saved.title
            });
        }
        return options;
    }

    render() {
        let is_legal = (<label className="button is-outlined is-small is-danger">Illegal</label>);
        if(this.state.map.isLegal()) is_legal = (<label className="button is-small is-outlined is-success">Legal</label>);
        let is_complete = (<label className="button is-outlined is-small is-danger">Incomplete</label>);
        if(this.state.map.isComplete()) is_complete = (<label className="button is-small is-outlined is-success">Complete</label>);

        let options = [];
        for(let opt of this.getOptions()) {
            options.push(
                <option value={opt.index} key={opt.index}>{opt.title}</option>
            );
        }

        let eval_options = [];
        for(let opt of this.getEvalOptions()) {
            eval_options.push(
                <option value={opt.index} key={opt.index}>{opt.title}</option>
            );
        }

        let auto_complete_ratios = [(<option value="random" key="random">B/R Target Ratio: Random</option>)];
        let red_total = this.state.map.getRedSystemTotal();
        let blue_total = this.state.map.getBlueSystemTotal();
        let open_spaces = this.state.map.getOpenSpacesTotal();
        let blue_avail = this.state.bank_systems.getBlueSystemTotal();
        let red_avail = this.state.bank_systems.getRedSystemTotal();
        for(let s=0; s<=open_spaces; s++) {
            if(s<=blue_avail && open_spaces-s<=red_avail) {
                auto_complete_ratios.push((
                    <option
                        value={s+blue_total}
                        key={s+blue_total}
                    >
                        B/R Target Ratio: {s+blue_total}/{open_spaces-s+red_total}
                    </option>
                ));
            }

        }

        let bal_diff =  null;
        if(this.state.balance_difference!==null) {
            bal_diff = (<p className="control"><label className="label">Balance Gap: {this.state.balance_difference}</label></p>);
        }

        let message = null;
        if(this.state.message !== null && this.state.message!=="") {
            message = (<blockquote>{this.state.message}</blockquote>);
        }


        return(
            <div className="block">
                <h2 className="title is-size-4">Map Editor</h2>
                <div className="block map-lab-control-panel">
                    <div className="field is-horizontal">
                        <div className="field-label">
                            <label className="label">Saved/Defaults:</label>
                        </div>
                        <div className="field-body">
                            <div className="field is-grouped is-grouped-multiline">
                                <p className="control">
                                    <span className="select is-small">
                                        <select id="layout-select" value={this.state.selected_item}
                                                onChange={() => this.handleSelectChange()}>
                                            {options}
                                        </select>
                                    </span>
                                </p>
                                <p className="control">
                                    <JSONDownloadButton
                                        title="Download All"
                                        getDownloadInfo={() => this.getAllLayoutJSONFileInfo()}
                                        className="button is-small"
                                    />
                                </p>
                                <p className="control">
                                    <button onClick={() => this.deleteAll()} className="button is-small">Delete All
                                    </button>
                                </p>
                                <JSONUploadButton
                                    id="layout-json-upload"
                                    title="Upload"
                                    handleJSON={(data) => this.addLayoutsFromJSON(data)}
                                    className="button is-small"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="field is-horizontal">
                        <div className="field-label">
                            <label className="label">Map Title:</label>
                        </div>
                        <div className="field-body">
                            <div className="field is-grouped is-grouped-multiline">
                                <p className="control">
                                    <input
                                        className="input is-small"
                                        type="text"
                                        id="layout-title"
                                        value={this.state.input_title}
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
                                        className="button is-small"
                                        onClick={()=>this.deleteCurrent()}
                                        disabled={this.isSelectNew(this.state.selected_item)}
                                    >Delete</button>
                                </p>
                                <p className="control">
                                    <JSONDownloadButton
                                        title="Download"
                                        className="button is-small"
                                        getDownloadInfo={()=>this.getCurrentLayoutJSONFileInfo()}
                                    />
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="field is-horizontal">
                        <div className="field-label">
                            <label className="label">System Display:</label>
                        </div>
                        <div className="field-body">
                             <div className="field is-grouped is-grouped-multiline">
                                <p className="control">
                                    <span className="select is-small">
                                        <select
                                            id="select-system-display"
                                            value={this.state.system_format}
                                            onChange={()=>this.handleFormatDisplayChange()}
                                        >
                                            <option value={SYSTEM_FORMATS.STREAMLINED}>Streamlined</option>
                                            <option value={SYSTEM_FORMATS.STREAMLINED_WITH_NAME}>Streamlined + Name</option>
                                            <option value={SYSTEM_FORMATS.COLORBLIND_FRIENDLY}>Colorblind Friendly</option>
                                            <option value={SYSTEM_FORMATS.COLORBLIND_FRIENDLY_WITH_NAME}>Colorblind Friendly + Name</option>
                                            <option value={SYSTEM_FORMATS.ID_ONLY}>ID Only</option>
                                        </select>
                                    </span>
                                </p>
                                <p className="control">
                                    <label className="label">Map Status:</label>
                                </p>
                                <p className="control">
                                    {is_complete}
                                </p>
                                <p className="control">
                                    {is_legal}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="field is-horizontal">
                        <div className="field-label">
                            <label className="label">Map String:</label>
                        </div>
                        <div className="field-body">
                            <div className="field is-grouped is-grouped-multiline">
                                <p className="control is-expanded">
                                    <input
                                        className="input is-small"
                                        type="text"
                                        id="map-string"
                                        value={this.state.map_string}
                                        onChange={function() {
                                            this.setState(
                                                {
                                                    "map_string": document.getElementById("map-string").value,
                                                    "message": ""
                                                }
                                            );
                                        }.bind(this)}
                                    />
                                </p>
                                <p className="control">
                                    <button className="button is-small" onClick={()=>this.loadMapFromString()}>
                                        Load From String
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="columns">
                    <div className="column is-one-fifth-desktop is-narrow-tablet map-controls-column">
                        <div className="block content for-message">
                            {message}
                        </div>
                        <div className="field">
                            <label className="label">Auto-Complete</label>
                            <p className="control">
                                <input
                                    id="require-all-wormholes"
                                    type="checkbox"
                                    checked={this.state.option_include_all_wormholes}
                                    onChange={()=>this.handleIncludeWormholesChange()}
                                />
                                <label htmlFor="require-all-wormholes"> Require Wormholes</label>
                            </p>
                            <p className="control">
                                <input
                                    id="pair-wormholes"
                                    type="checkbox"
                                    checked={this.state.option_pair_wormholes}
                                    onChange={()=>this.handlePairWormholesChange()}
                                />
                                <label htmlFor="pair-wormholes"> Pair Wormholes</label>
                            </p>
                            <p className="control">
                                <span className="select is-small">
                                    <select
                                        id="target-ratio"
                                        value={this.state.target_blue_total}
                                        onChange={()=>this.handleTargetRatioChange()}
                                    >
                                        {auto_complete_ratios}
                                    </select>
                                </span>
                            </p>
                            <p className="control">
                                <button
                                    onClick={()=>this.autoCompleteStart()}
                                    disabled={
                                        !this.state.map.isLegal()
                                        || this.state.map.isComplete()
                                        || this.state.long_op===true
                                    }
                                    className="button is-small is-primary"
                                >
                                    Auto-Complete Map
                                </button>
                            </p>
                        </div>
                        <div className="field">
                            <label className="label">Improve Balance</label>
                            <p className="control">
                                <span className="select is-small">
                                    <select id="eval-select" value={this.state.eval_option}
                                            onChange={(event) => this.handleEvalChange(event.target.value)}>
                                        {eval_options}
                                    </select>
                                </span>
                            </p>
                            {bal_diff}
                            <p className="control">
                                <input
                                    id="dont-move-wormholes"
                                    type="checkbox"
                                    checked={this.state.balance_options.dont_move_wormholes}
                                    onChange={()=>this.handleBalanceOptionChange("dont_move_wormholes")}
                                />
                                <label htmlFor="dont-move-wormholes"> Lock Wormholes</label>
                            </p>
                            <p className="control">
                                <input
                                    id="dont-move-anomalies"
                                    type="checkbox"
                                    checked={this.state.balance_options.dont_move_anomalies}
                                    onChange={()=>this.handleBalanceOptionChange("dont_move_anomalies")}
                                />
                                 <label htmlFor="dont-move-anomalies"> Lock Anomalies</label>
                            </p>
                            <p className="control">
                                <input
                                    id="dont-move-empty"
                                    type="checkbox"
                                    checked={this.state.balance_options.dont_move_empty}
                                    onChange={()=>this.handleBalanceOptionChange("dont_move_empty")}
                                />
                                <label htmlFor="dont-move-empty"> Lock Empty Spaces</label>
                            </p>
                            <p className="control">
                                <button
                                    onClick={()=>this.improveBalanceStart()}

                                    disabled={!this.state.map.isComplete() || this.state.long_op===true}
                                    className="button is-small is-primary"
                                >
                                    Improve Balance
                                </button>
                            </p>
                        </div>
                        <SystemBankComponent
                            systems={this.state.bank_systems}
                            active_system={this.state.selected_bank_system}
                            setActiveSystem={(system)=>this.setActiveBankSystem(system)}
                            system_format={this.state.system_format}
                            onSelectedSystemDrag={(event)=>this.onSelectedSystemDrag(event)}
                            onSystemDragEnd={(event)=>this.onSystemDragEnd(event)}
                            onSystemDropped={(event)=>this.onSystemDropped(event,null)}
                            eval_variables={this.state.eval_variables}
                        />
                    </div>
                    <div className="column map-container">
                        <MapComponent
                            map={this.state.map}
                            eval_variables={this.state.eval_variables}
                            system_format={this.state.system_format}
                            system_box={this.system_box}
                            clickedSpace={(index)=>this.clickedSpace(index)}
                            map_class="map-map"
                            systems_draggable={!this.state.long_op}
                            onSystemDrag={(event, system)=>this.onSystemDrag(event, system)}
                            onSystemDragEnd={(event)=>this.onSystemDragEnd(event)}
                            onSystemDropped={(event, space)=>this.onSystemDropped(event, space)}
                            home_values={this.state.home_values}
                        />
                    </div>
                </div>
            </div>
        );
    }
}