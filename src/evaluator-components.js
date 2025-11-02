import React from 'react';
import {PLANET_EVAL_STRATEGIES} from "./map-logic";

export const EVAL_ASPECTS = {
    "BASE_PLANET_MOD": "BASE_PLANET_MOD",
    "RESOURCES_MULTIPLIER": "RESOURCES_MULTIPLIER",
    "INFLUENCE_MULTIPLIER": "INFLUENCE_MULTIPLIER",
    "TECH_MOD": "TECH_MOD",
    "TECH_PROPULSION_MOD": "TECH_PROPULSION_MOD",
    "TECH_WARFARE_MOD": "TECH_WARFARE_MOD",
    "TECH_BIOTIC_MOD": "TECH_BIOTIC_MOD",
    "TECH_CYBERNETIC_MOD": "TECH_CYBERNETIC_MOD",
    "PLANET_STRATEGY": "PLANET_STRATEGY",
    "NONZERO_RESOURCES_MOD": "NONZERO_RESOURCES_MOD",
    "NONZERO_INFLUENCE_MOD": "NONZERO_INFLUENCE_MOD",
    "TRAIT_CULTURAL_MOD": "TRAIT_CULTURAL_MOD",
    "TRAIT_HAZARDOUS_MOD": "TRAIT_HAZARDOUS_MOD",
    "TRAIT_INDUSTRIAL_MOD": "TRAIT_INDUSTRIAL_MOD",
    "SINGLE_PLANET_MOD": "SINGLE_PLANET_MOD",
    "MULTI_PLANET_MOD": "MULTI_PLANET_MOD",
    "MATCHING_PLANETS_MOD": "MATCHING_PLANETS_MOD",
    "NONMATCHING_PLANETS_MOD": "NONMATCHING_PLANETS_MOD",
    "MECATOL_REX_SYS_MOD": "MECATOL_REX_SYS_MOD",
    "LEGENDARY_PLANET_SYS_MOD": "LEGENDARY_PLANET_SYS_MOD",
    "SPACE_STATION_SYS_MOD": "SPACE_STATION_SYS_MOD",
    "DISTANCE_MOD_BASE": "DISTANCE_MOD_BASE",
    "DISTANCE_MOD_PLANET": "DISTANCE_MOD_PLANET",
    "DISTANCE_MOD_EMPTY": "DISTANCE_MOD_EMPTY",
    "DISTANCE_MOD_SUPERNOVA": "DISTANCE_MOD_SUPERNOVA",
    "DISTANCE_MOD_ASTEROID_FIELD": "DISTANCE_MOD_ASTEROID_FIELD",
    "DISTANCE_MOD_GRAVITY_RIFT": "DISTANCE_MOD_GRAVITY_RIFT",
    "DISTANCE_MOD_EMPTY_WORMHOLE": "DISTANCE_MOD_EMPTY_WORMHOLE",
    "DISTANCE_MOD_PLANET_WORMHOLE": "DISTANCE_MOD_PLANET_WORMHOLE",
    "DISTANCE_MOD_NEBULA": "DISTANCE_MOD_NEBULA",
    "DISTANCE_MOD_ENTROPIC_SCAR": "DISTANCE_MOD_ENTROPIC_SCAR",
    "DISTANCE_MOD_ADJACENT_TO_OPPONENT": "DISTANCE_MOD_ADJACENT_TO_OPPONENT",
    "DISTANCE_MULTIPLIER": "DISTANCE_MULTIPLIER",
};


export class EvaluatorLine extends React.Component {
    render() {
        let null_box = null;
        let nul_val = this.props.num_value===false;
        if(this.props.hasNullBox) {
            null_box = (<p className="control checkbox-holder"><input
                    id={this.props.id+"-null-box"}
                    type="checkbox"
                    checked={nul_val}
                    onChange={event => this.props.onNullChange(event.target.checked)}
            /> Impassable&nbsp;</p>);
        }
        let num_value = this.props.num_value;
        if(num_value===false) num_value = "";
        return(
            <div className="field line-container">
                <div>
                    <label className="label">{this.props.label}:</label>
                </div>
                <div>
                    <div className="field all-parts">
                        <div className="both-controls">
                            <div className="field is-horizontal input-only">
                                <div className="m">
                                    {this.props.m}
                                </div>
                                <p className="control">
                                     <input
                                        type="number"
                                        id={this.props.id+"-num"}
                                        value={num_value}
                                        className="input is-small"
                                        onChange={event => this.props.onInputChange(parseInt(event.target.value))}
                                        disabled={nul_val}
                                    />
                                </p>
                            </div>
                            {null_box}
                        </div>
                        <div className="info-container">
                            <i className="fas fa-info-circle"></i>
                            <div className="input-info">
                                {this.props.helperText}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export class EvaluatorForm extends React.Component {
    reportChange(which_aspect, value, distance=null) {
        this.props.changeHandler(which_aspect, value, distance);
    }

    reportNullChange(which_aspect, value) {
        if(value===false) {
            this.reportChange(which_aspect, 0);
        } else {
            this.reportChange(which_aspect, false);
        }
    }

    render() {
        return(
            <div className="block content evaluator-form">
                <div className="form-container">
                    <h3>Planet Evaluation</h3>
                    <EvaluatorLine
                        m="+"
                        label="Base Planet"
                        num_value={this.props.values.BASE_PLANET_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.BASE_PLANET_MOD, value)}
                        helperText="Base value of each planet."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Resources"
                        num_value={this.props.values.RESOURCES_MULTIPLIER}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.RESOURCES_MULTIPLIER, value)}
                        helperText="Number to multiply planet resource value by."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Influence"
                        num_value={this.props.values.INFLUENCE_MULTIPLIER}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.INFLUENCE_MULTIPLIER, value)}
                        helperText="Number to multiply planet influence value by."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Tech"
                        num_value={this.props.values.TECH_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.TECH_MOD, value)}
                        helperText="Number to add if the planet has a tech specialty."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Propulsion Tech"
                        num_value={this.props.values.TECH_PROPULSION_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.TECH_PROPULSION_MOD, value)}
                        helperText="Number to add if the planet has a propulsion tech specialty."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Warfare Tech"
                        num_value={this.props.values.TECH_WARFARE_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.TECH_WARFARE_MOD, value)}
                        helperText="Number to add if the planet has a warfare tech specialty."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Biotic Tech"
                        num_value={this.props.values.TECH_BIOTIC_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.TECH_BIOTIC_MOD, value)}
                        helperText="Number to add if the planet has a biotic tech specialty."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Cybernetic Tech"
                        num_value={this.props.values.TECH_CYBERNETIC_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.TECH_CYBERNETIC_MOD, value)}
                        helperText="Number to add if the planet has a cybernetic tech specialty."
                    />
                    <div className="field line-container">
                        <div>
                            <label className="label">Planet Eval Strategy:</label>
                        </div>
                        <div>
                            <div className="field is-grouped">
                                <div className="field is-horizontal">
                                    <p className="control">
                                        <span className="select is-small">
                                            <select
                                                value={this.props.values.PLANET_STRATEGY}
                                                onChange={event => this.reportChange(
                                                    EVAL_ASPECTS.PLANET_STRATEGY, event.target.value
                                                )}
                                            >
                                                <option
                                                    value={PLANET_EVAL_STRATEGIES.SUM}
                                                    key={PLANET_EVAL_STRATEGIES.SUM}
                                                >
                                                    Sum
                                                </option>
                                                <option
                                                    value={PLANET_EVAL_STRATEGIES.GREATEST}
                                                    key={PLANET_EVAL_STRATEGIES.GREATEST}
                                                >
                                                    Greatest
                                                </option>
                                                <option
                                                    value={PLANET_EVAL_STRATEGIES.GREATEST_PLUS_TECH}
                                                    key={PLANET_EVAL_STRATEGIES.GREATEST_PLUS_TECH}
                                                >
                                                    Greatest+Tech
                                                </option>
                                            </select>
                                        </span>
                                    </p>
                                </div>
                                <div className="info-container">
                                    <i className="fas fa-info-circle"></i>
                                    <div className="input-info">
                                        How to combine resources, influence and tech values above.
                                        <br /><br />Sum = R+I+T
                                        <br /><br />Greatest = largest of R/I/T
                                        <br /><br />Greatest+Tech = largest of R/I, +T
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <EvaluatorLine
                        m="+"
                        label="Resources > 0"
                        num_value={this.props.values.NONZERO_RESOURCES_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.NONZERO_RESOURCES_MOD, value)}
                        helperText="Number to add if planet resource value is greater than 0."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Influence > 0"
                        num_value={this.props.values.NONZERO_INFLUENCE_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.NONZERO_INFLUENCE_MOD, value)}
                        helperText="Number to add if planet influence value is greater than 0."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Cultural Trait"
                        num_value={this.props.values.TRAIT_CULTURAL_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.TRAIT_CULTURAL_MOD, value)}
                        helperText="Number to add if the planet has the cultural trait."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Hazardous Trait"
                        num_value={this.props.values.TRAIT_HAZARDOUS_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.TRAIT_HAZARDOUS_MOD, value)}
                        helperText="Number to add if the planet has the hazardous trait."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Industrial Trait"
                        num_value={this.props.values.TRAIT_INDUSTRIAL_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.TRAIT_INDUSTRIAL_MOD, value)}
                        helperText="Number to add if the planet has the industrial trait."
                    />
                    <h3>System Evaluation</h3>
                    <EvaluatorLine
                        m="+"
                        label="Single Planet System"
                        num_value={this.props.values.SINGLE_PLANET_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.SINGLE_PLANET_MOD, value)}
                        helperText="Number to add if the system has exactly 1 planet."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Multi-planet System"
                        num_value={this.props.values.MULTI_PLANET_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.MULTI_PLANET_MOD, value)}
                        helperText="Number to add if the system has more than 1 planet."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Matching Planets System"
                        num_value={this.props.values.MATCHING_PLANETS_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.MATCHING_PLANETS_MOD, value)}
                        helperText="Number to add if a system has 2 planets with the same trait."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Non-Matching Planets System"
                        num_value={this.props.values.NONMATCHING_PLANETS_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.NONMATCHING_PLANETS_MOD, value)}
                        helperText="Number to add if a system has 2 planets with different traits."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Mecatol Rex System"
                        num_value={this.props.values.MECATOL_REX_SYS_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.MECATOL_REX_SYS_MOD, value)}
                        helperText="Number to add if the system contains Mecatol Rex."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Legendary Planet System"
                        num_value={this.props.values.LEGENDARY_PLANET_SYS_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.LEGENDARY_PLANET_SYS_MOD, value)}
                        helperText="Number to add if the system contains a Legendary Planet."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Space Station System"
                        num_value={this.props.values.SPACE_STATION_SYS_MOD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.SPACE_STATION_SYS_MOD, value)}
                        helperText="Number to add if the system contains a Space Station."
                    />
                    <h3>Home to System Distance Evaluation</h3>
                    <h4>Distance Measurement</h4>
                    <EvaluatorLine
                        m="+"
                        label="Distance Base"
                        num_value={this.props.values.DISTANCE_MOD_BASE}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MOD_BASE, value)}
                        helperText="Base distance unit for every space moved through."
                    />
                    <EvaluatorLine
                        m="+"
                        label="Moving Through Planet"
                        num_value={this.props.values.DISTANCE_MOD_PLANET}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MOD_PLANET, value)}
                        helperText="Distance modifier for systems with 1 or more planets."
                        hasNullBox
                        onNullChange={value => this.reportNullChange(EVAL_ASPECTS.DISTANCE_MOD_PLANET, value)}
                    />
                    <EvaluatorLine
                        m="+"
                        label="Moving Through Empty Space"
                        num_value={this.props.values.DISTANCE_MOD_EMPTY}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MOD_EMPTY, value)}
                        helperText="Distance modifier for empty space systems."
                        hasNullBox
                        onNullChange={value => this.reportNullChange(EVAL_ASPECTS.DISTANCE_MOD_EMPTY, value)}
                    />
                    <EvaluatorLine
                        m="+"
                        label="Moving Through Supernova"
                        num_value={this.props.values.DISTANCE_MOD_SUPERNOVA}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MOD_SUPERNOVA, value)}
                        helperText="Distance modifier for supernova systems."
                        hasNullBox
                        onNullChange={value => this.reportNullChange(EVAL_ASPECTS.DISTANCE_MOD_SUPERNOVA, value)}
                    />
                    <EvaluatorLine
                        m="+"
                        label="Moving Through Asteroid"
                        num_value={this.props.values.DISTANCE_MOD_ASTEROID_FIELD}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MOD_ASTEROID_FIELD, value)}
                        helperText="Distance modifier for asteroid field systems."
                        hasNullBox
                        onNullChange={value => this.reportNullChange(EVAL_ASPECTS.DISTANCE_MOD_ASTEROID_FIELD, value)}
                    />
                    <EvaluatorLine
                        m="+"
                        label="Moving Through Gravity Rift"
                        num_value={this.props.values.DISTANCE_MOD_GRAVITY_RIFT}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MOD_GRAVITY_RIFT, value)}
                        helperText="Distance modifier for gravity rift systems."
                        hasNullBox
                        onNullChange={value => this.reportNullChange(EVAL_ASPECTS.DISTANCE_MOD_GRAVITY_RIFT, value)}
                    />
                    <EvaluatorLine
                        m="+"
                        label="Moving Through Wormholes Without Planets"
                        num_value={this.props.values.DISTANCE_MOD_EMPTY_WORMHOLE}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MOD_EMPTY_WORMHOLE, value)}
                        helperText="Distance modifier for wormhole systems without planets."
                        hasNullBox
                        onNullChange={value => this.reportNullChange(EVAL_ASPECTS.DISTANCE_MOD_EMPTY_WORMHOLE, value)}
                    />
                    <EvaluatorLine
                        m="+"
                        label="Moving Through Wormholes With a Planet"
                        num_value={this.props.values.DISTANCE_MOD_PLANET_WORMHOLE}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MOD_PLANET_WORMHOLE, value)}
                        helperText="Distance modifier for wormhole systems with a planet."
                        hasNullBox
                        onNullChange={value => this.reportNullChange(EVAL_ASPECTS.DISTANCE_MOD_PLANET_WORMHOLE, value)}
                    />
                    <EvaluatorLine
                        m="+"
                        label="Moving Through Nebula"
                        num_value={this.props.values.DISTANCE_MOD_NEBULA}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MOD_NEBULA, value)}
                        helperText="Distance modifier for nebula systems."
                        hasNullBox
                        onNullChange={value => this.reportNullChange(EVAL_ASPECTS.DISTANCE_MOD_NEBULA, value)}
                    />
                    <EvaluatorLine
                        m="+"
                        label="Moving Through Entropic Scar"
                        num_value={this.props.values.DISTANCE_MOD_ENTROPIC_SCAR}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MOD_ENTROPIC_SCAR, value)}
                        helperText="Distance modifier for entropic scar systems."
                        hasNullBox
                        onNullChange={value => this.reportNullChange(EVAL_ASPECTS.DISTANCE_MOD_ENTROPIC_SCAR, value)}
                    />
                    <EvaluatorLine
                        m="+"
                        label="Moving Through Opponent Adj Sys"
                        num_value={this.props.values.DISTANCE_MOD_ADJACENT_TO_OPPONENT}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MOD_ADJACENT_TO_OPPONENT, value)}
                        helperText="Distance modifier for systems adjacent to your opponents' home systems."
                        hasNullBox
                        onNullChange={value => this.reportNullChange(EVAL_ASPECTS.DISTANCE_MOD_ADJACENT_TO_OPPONENT, value)}
                    />
                    <h4>System Value Multipliers Based on Modified Distance</h4>
                    <EvaluatorLine
                        m="x"
                        label="Modified Distance of <1"
                        num_value={this.props.values.DISTANCE_MULTIPLIER[0]}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MULTIPLIER, value, 0)}
                        helperText="Number to multiply the system's value by when the modified distance to the home planet is 0 or less."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Modified Distance of 1"
                        num_value={this.props.values.DISTANCE_MULTIPLIER[1]}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MULTIPLIER, value, 1)}
                        helperText="Number to multiply the system's value by when the modified distance to the home planet is 1."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Modified Distance of 2"
                        num_value={this.props.values.DISTANCE_MULTIPLIER[2]}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MULTIPLIER, value, 2)}
                        helperText="Number to multiply the system's value by when the modified distance to the home planet is 2."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Modified Distance of 3"
                        num_value={this.props.values.DISTANCE_MULTIPLIER[3]}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MULTIPLIER, value, 3)}
                        helperText="Number to multiply the system's value by when the modified distance to the home planet is 3."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Modified Distance of 4"
                        num_value={this.props.values.DISTANCE_MULTIPLIER[4]}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MULTIPLIER, value, 4)}
                        helperText="Number to multiply the system's value by when the modified distance to the home planet is 4."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Modified Distance of 5"
                        num_value={this.props.values.DISTANCE_MULTIPLIER[5]}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MULTIPLIER, value, 5)}
                        helperText="Number to multiply the system's value by when the modified distance to the home planet is 5."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Modified Distance of 6"
                        num_value={this.props.values.DISTANCE_MULTIPLIER[6]}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MULTIPLIER, value, 6)}
                        helperText="Number to multiply the system's value by when the modified distance to the home planet is 6."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Modified Distance of 7"
                        num_value={this.props.values.DISTANCE_MULTIPLIER[7]}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MULTIPLIER, value, 7)}
                        helperText="Number to multiply the system's value by when the modified distance to the home planet is 7."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Modified Distance of 8"
                        num_value={this.props.values.DISTANCE_MULTIPLIER[8]}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MULTIPLIER, value, 8)}
                        helperText="Number to multiply the system's value by when the modified distance to the home planet is 8."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Modified Distance of 9"
                        num_value={this.props.values.DISTANCE_MULTIPLIER[9]}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MULTIPLIER, value, 9)}
                        helperText="Number to multiply the system's value by when the modified distance to the home planet is 9."
                    />
                    <EvaluatorLine
                        m="x"
                        label="Modified Distance of 10+"
                        num_value={this.props.values.DISTANCE_MULTIPLIER[10]}
                        onInputChange={value => this.reportChange(EVAL_ASPECTS.DISTANCE_MULTIPLIER, value, 10)}
                        helperText="Number to multiply the system's value by when the modified distance to the home planet is greater than 9."
                    />
                </div>
            </div>
        );
    }
}
