import React from 'react';
import $ from 'jquery';

import {
    JSONDownloadButton,
    JSONUploadButton,
} from "../download-helpers";
import {BaseEditor} from "./base-editor";
import {EvaluatorForm, EVAL_ASPECTS} from '../evaluator-components';
import default_evaluators from '../data/default_evaluators.json';
import ls from "local-storage";

window.jQuery = $;

export class EvaluationEditor extends BaseEditor {
    constructor(props) {
        super(props);
        this.default_evaluators = default_evaluators;
        this.state.values = Object.assign({}, this.default_evaluators[0].data);
        if(this.props.state_to_import) {
            let matching_options = this.getOptions().filter(option => option.index === this.props.state_to_import.selected_item);
            if (matching_options.length > 0) {
                this.state = this.props.state_to_import;
            }
        }
    }

    changeHandler(which_aspect, value, distance) {
        let new_values = Object.assign(this.state.values);
        if(which_aspect === EVAL_ASPECTS.DISTANCE_MULTIPLIER) {
            new_values[which_aspect][distance] = value;
        } else {
            new_values[which_aspect] = value;
        }
        this.setState({"values": new_values});
    }

    setValues(new_values) {
        this.setState({
            "values": Object.assign({}, new_values),
        });
    }

    isSelectNew(selected_item=null) {
        if(selected_item !== null) return selected_item==="new";
        return this.getSelectValue() === "new";
    }

    getNewStringValue() {
        return "new";
    }

    handleSelectChange() {
        let new_value = this.getSelectValue();
        if(new_value === "new") {
            this.setValuesFull(Object.assign({}, this.default_evaluators[0]));
        } else {
            let valIndex = parseInt(new_value);
            this.setValuesFull(Object.assign({}, this.state.saved_data[valIndex]), new_value);
        }
    }

    setValuesFull(data, selected_item="new", new_eval=null) {
        if(new_eval===null) new_eval = data.data;
        let loadedTitle = data.title;
        let new_message = this.props.subject+" '"+loadedTitle+"' displayed.";
        this.setValues(new_eval);
        this.setState({
            "message": new_message,
            "input_title": loadedTitle,
            "selected_item": selected_item.toString(),
        });
    }

    getCurrentLayoutJSON() {
        let l_title = "Untitled Evaluator";
        if($('#layout-title').val() !== '') {
            l_title = $('#layout-title').val();
        }
        return {
            "title": l_title,
            "data": Object.assign(this.state.values),
        };
    }

    deleteAll() {
        ls.remove(this.props.storage_key);
        this.setValuesFull(Object.assign({}, this.default_evaluators[0]));
        this.setState({
            "saved_data": ls.get(this.props.storage_key) || [],
            "selected_item": this.getNewStringValue(),
            "input_title": "",
            "message": "All saved "+this.props.subject_plural+" have been deleted.",
        });
    }

    deleteCurrent() {
        let currentIndex = this.getSelectValue();
        let saved_data = Object.assign([], this.state.saved_data);
        let toDel = saved_data.splice(parseInt(currentIndex), 1)[0];
        ls.set(this.props.storage_key, saved_data);
        this.setValuesFull(Object.assign(this.default_evaluators[0]));
        this.setState({
            "input_title": "",
            "selected_item": this.getNewStringValue(),
            "message": this.props.subject+" '"+toDel.title+"' deleted.",
            "saved_data": ls.get(this.props.storage_key) || [],
        });
    }

    loadDefault(index) {
        let toLoad = this.default_evaluators[index];
        let new_values = toLoad.data;
        let loadedTitle = toLoad.title;
        let new_message = "Default evaluator '"+loadedTitle+"' displayed.";
        this.setValues(new_values);
        this.setState({
            "message": new_message,
            "input_title": loadedTitle,
            "selected_item": this.getNewStringValue(),
        });
    }

    addLayoutsFromJSON(data) {
        if(data.length>0) {
            let saved_data = Object.assign([], this.state.saved_data);
            for(let dataToSave of data) {
                saved_data.push(dataToSave);
            }
            ls.set(this.props.storage_key, saved_data);
            this.setValuesFull(saved_data[saved_data.length-1], saved_data.length-1);
            this.setState({
                "saved_data": ls.get(this.props.storage_key) || [],
                "message": "Evaluators loaded.",
                "selected_item": saved_data.length-1,
                "input_title": saved_data[saved_data.length-1].title,
            });
        } else {
            this.setState({"message": "There were no "+this.props.subject_plural+" to load."})
        }
    }

    getOptions() {
        let options = [{
            "index": "new",
            "title": "New Evaluator",
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
        for(let [index, one_default] of this.default_evaluators.entries()) {
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
        let message = null;
        if(this.state.message !== null && this.state.message!=="") {
            message = (<blockquote>{this.state.message}</blockquote>);
        }

        return(
            <div className="block">
                <h2 className="title is-size-4">Evaluator Editor</h2>
                <div className="block map-lab-control-panel">
                    <div className="field is-horizontal">
                        <div className="field-label">
                            <label className="label">Default Evaluators:</label>
                        </div>
                        <div className="field-body">
                            <div className="field is-grouped is-grouped-multiline">
                                {defaults}
                            </div>
                        </div>
                    </div>
                    <div className="field is-horizontal">
                        <div className="field-label">
                            <label className="label">Saved Evaluators:</label>
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
                            <label className="label">Evaluator Title:</label>
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
                    <div className="block content for-message">
                        {message}
                    </div>
                </div>
                <EvaluatorForm
                    values={this.state.values}
                    changeHandler={(which_aspect, value, distance)=>this.changeHandler(which_aspect, value, distance)}
                />
            </div>
        );
    }
}