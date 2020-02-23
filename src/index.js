import React from 'react';
import ReactDOM from 'react-dom';

import "./styles/map-lab.scss";
import {MapEditor} from "./editors/map-editor";
import {LayoutEditor} from './editors/layout-editor';
import {EvaluationEditor} from "./editors/eval-editor";

import $ from "jquery";
window.jQuery = $;

const SCREENS = {
    "MAP_EDITOR": 1,
    "LAYOUT_EDITOR": 2,
    "SYSTEM_EVALUATOR": 3,
    "INSTRUCTIONS": 4,
};

function toggleMenu() {
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
}


class MapLabNavigator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "active_screen": SCREENS.MAP_EDITOR,
        };
        this.map_state = null;
        this.layout_state = null;
        this.eval_state = null;
    }

    storeState(which_screen, state) {
        switch(which_screen) {
            case SCREENS.SYSTEM_EVALUATOR:
                this.eval_state = state;
                break;
            case SCREENS.LAYOUT_EDITOR:
                this.layout_state = state;
                break;
            case SCREENS.MAP_EDITOR:
                this.map_state = state;
                console.log(state);
                break;
            default:
                break;
        }
    }

    changeScreen(new_screen) {
        this.setState({
            "active_screen": new_screen,
        });
    }

    render() {
        let screen_return = null;
        switch(this.state.active_screen) {
            case SCREENS.MAP_EDITOR:
                screen_return = (
                    <MapEditor
                        storage_key="maps"
                        subject="Map"
                        subject_plural="Maps"
                        layout_storage_key="layouts"
                        eval_storage_key="evaluators"
                        state_to_import={this.map_state}
                        sendStateBeforeDeath={(state_to_store)=>this.storeState(SCREENS.MAP_EDITOR, state_to_store)}
                    />
                );
                break;
            case SCREENS.LAYOUT_EDITOR:
                screen_return = (
                    <LayoutEditor
                        storage_key="layouts"
                        subject="Layout"
                        subject_plural="Layouts"
                        state_to_import={this.layout_state}
                        sendStateBeforeDeath={(state_to_store)=>this.storeState(SCREENS.LAYOUT_EDITOR, state_to_store)}
                    />
                );
                break;
            case SCREENS.SYSTEM_EVALUATOR:
                screen_return = (
                    <EvaluationEditor
                        storage_key="evaluators"
                        subject="Evaluator"
                        subject_plural="Evaluators"
                        state_to_import={this.eval_state}
                        sendStateBeforeDeath={(state_to_store)=>this.storeState(SCREENS.SYSTEM_EVALUATOR, state_to_store)}
                    />
                );
                break;
            case SCREENS.INSTRUCTIONS:
                screen_return = (
                    <div className="block content">
                        <h2>Getting Started</h2>
                        <h3>Basic Map Generation</h3>
                        <ol>
                            <li>Go to the Map Editor screen (the default screen).</li>
                            <li>If you don't want the default 6-player map, choose another "new from" option under
                                "Saved/Defaults"</li>
                            <li>Scroll down and click "Auto-Complete Map."</li>
                            <li>Click the "Improve Balance" button a few times to make the map more fair according to the.
                                current Evaluator algorithm. The number in each Home System represents the strength of that
                                home system's position based on the quality of and distance from systems on the map.</li>
                            <li>Change "Simple Slice" to another evaluator to get a different view on the
                                strength of the home system positions.</li>
                            <li>Drag and drop systems to switch them with each other as you wish (On mobile, click a
                                system to send it back to the system bank, or click a space to put the currently selected
                                system bank system in that space.)</li>
                            <li>Name your map via "Map Title" and click "Save" at the top. Saves in your browser only.
                                Can be loaded in the future from the "Saved/Defaults" dropdown.</li>
                            <li>Copy the Map String or download the json file to share.</li>
                        </ol>
                        <h3>Building a Map From Scratch</h3>
                        <ol>
                            <li>Choose the layout you want to build from the "Saved/Defaults" dropdown.</li>
                            <li>Scroll down to the System Bank and select the first system you want to place. (Suggestion:
                                Start with the wormholes.) The system appears under the dropdown.</li>
                            <li>Drag the system to the space where you want it. (On mobile, just touch the space.)</li>
                            <li>Continue the above steps until you've placed all the systems you care about.</li>
                            <li>Choose the desired blue/red target ratio from the dropdown under Auto-Complete.</li>
                            <li>Click Auto-Complete to fill out the rest of the map.</li>
                            <li>Change the "Simple Slice" dropdown to another evaluator algorithm for different perspectives
                                on the strength of each home space's position.</li>
                            <li>Use the "Lock" checkboxes to fix certain spaces in place, before clicking "Improve Balance"
                                a few times to improve the overall system allocation.</li>
                            <li>Don't forget to save your map at the top early and often.</li>
                        </ol>
                        <h3>Creating New Layouts</h3>
                        <ol>
                            <li>Choose "Layout Editor" at the top.</li>
                            <li>Click spaces to cycle through "open" (open for systems), home system, closed, and
                                Mecatol Rex.</li>
                            <li>Use the checkboxes under "Click Cycle" to also include things like warp (hyperlane)
                                hexes, anomalies, and/or wormholes.</li>
                            <li>Be sure to name and save your layout. Once saved, as long as it doesn't have nonsensical
                                warp hexes, it will appear in the map editor under its own "New from..." option.</li>
                        </ol>
                        <h3>Customize an Evaluator</h3>
                        <ol>
                            <li>Use the "System Evaluator" menu item at the top to make your own custom evaluations of
                                planets, systems, and home system positions.</li>
                            <li>The variables under "Planet Evaluation" define how much a planet is worth.</li>
                            <li>The variables under "System Evaluation" define how much a system is worth by taken
                                their planet values and adding these modifiers.</li>
                            <li>The variables under "Home to System Distance Evaluation" define how far (in an abstracted
                                sense) a home system is to each system, based on the kinds of hexes it has to go through
                                to get there. "Distance Base" is added for every hex that must be moved into. The other modifiers,
                                if set ot 1 or more, will increase that base hex number for those types of hexes. (Example:
                                The path to a 2-planet system is through empty space, then through a nebula. In the evaluator, Base Hex
                                is set to 2, empty space is set to 0, and nebula is set to 1. Therefore, it is 2 distance
                                to move into the empty space, 3 to move into the nebula, and 2 to move into the 2-planet system.
                                Therefore, the total modified distance is 7, even though the physical distance is only
                                three hexes.)</li>
                            <li>The variables under "System Value Multipliers Based on Distance" define what to multiply
                                a system's worth by, based on the modified distance it is from a home system. Any modified
                                distance above 10 is not eligible to hold value to the home system.</li>
                            <li>Don't forget to save your evaluator. Then, it will show up uner the "Improve Balance" dropdown
                                on the Map Editor screen.</li>
                        </ol>
                    </div>
                );
                break;
            default:
                break;
        }


        return(
            <div className="block map-lab">
                <nav className="navbar is-primary">
                    <div className="navbar-brand">
                        <h1 className="title is-3 is-marginless">TI4 Map Lab</h1>
                        {/*eslint-disable-next-line*/}
                        <a
                            role="button"
                            className="navbar-burger is-"
                            aria-label="menu"
                            aria-expanded="false"
                            onClick={()=>toggleMenu()}
                        >
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>
                    <div className="navbar-menu">
                        <div className="navbar-start">
                        </div>
                            <div className="navbar-end">
                                {/*eslint-disable-next-line*/}
                                <a role="button"
                                    disabled={this.state.active_screen===SCREENS.INSTRUCTIONS}
                                    onClick={()=>this.changeScreen(SCREENS.INSTRUCTIONS)}
                                    className="navbar-item"
                                >
                                    Instructions
                                </a>
                                {/*eslint-disable-next-line*/}
                                <a role="button"
                                    disabled={this.state.active_screen===SCREENS.MAP_EDITOR}
                                    onClick={()=>this.changeScreen(SCREENS.MAP_EDITOR)}
                                    className="navbar-item"
                                >
                                    Map Editor
                                </a>
                                {/*eslint-disable-next-line*/}
                                <a role="button"
                                    disabled={this.state.active_screen===SCREENS.LAYOUT_EDITOR}
                                    onClick={()=>this.changeScreen(SCREENS.LAYOUT_EDITOR)}
                                    className="navbar-item"
                                >
                                    Layout Editor
                                </a>
                                {/*eslint-disable-next-line*/}
                                <a role="button"
                                    disabled={this.state.active_screen===SCREENS.SYSTEM_EVALUATOR}
                                    onClick={()=>this.changeScreen(SCREENS.SYSTEM_EVALUATOR)}
                                    className="navbar-item"
                                >
                                    System Evaluator
                                </a>
                        </div>
                    </div>
                </nav>
                {screen_return}
                <div className="block footer">
                    This is a fan project by J. Arthur Ellis.&nbsp;
                    <a href="https://twitter.com/joepinion">@joepinion</a>
                    <br /><a href="https://www.github.com/joepinion/ti4-map-lab">github.com/joepinion/ti4-map-lab</a>
                </div>
            </div>
        );
    }

}

ReactDOM.render(
    <MapLabNavigator />,
    document.getElementById('root')
);

