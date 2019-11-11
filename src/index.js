import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

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
                    />
                );
                break;
            case SCREENS.LAYOUT_EDITOR:
                screen_return = (
                    <LayoutEditor
                        storage_key="layouts"
                        subject="Layout"
                        subject_plural="Layouts"
                    />
                );
                break;
            case SCREENS.SYSTEM_EVALUATOR:
                screen_return = (
                    <EvaluationEditor
                        storage_key="evaluators"
                        subject="Evaluator"
                        subject_plural="Evaluators"
                    />
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
                </div>
            </div>
        );
    }

}

ReactDOM.render(
    <MapLabNavigator />,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

