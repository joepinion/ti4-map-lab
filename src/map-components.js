import React from 'react';
import {ANOMALIES, PLANET_TRAITS, TECH_SPECIALTIES, WORMHOLES} from "./data/tile_data";
import {warp_configs, WARP_DIRECTIONS} from "./data/warp_data";
import {getObjFromCoord} from './map-logic';

const hexSpace = 6;

function getHexSizeFromScreen() {
    if(window.innerWidth >= 1024) {
        return 110;
    } else if(window.innerWidth >= 769) {
        return 80;
    } else {
        return 55;
    }
}

export class SystemBankComponent extends React.Component {

    getSelectValue() {
        let int_select = document.getElementById("system-bank-select");
        return int_select.options[int_select.selectedIndex].value;
    }

    handleSelectChange() {
        let new_value = this.getSelectValue();
        if(new_value === "none") {
            this.props.setActiveSystem(null);
        } else {
            this.props.setActiveSystem(
                this.props.systems.getSystemByID(parseInt(new_value))
            );
        }
    }

    handleExpansionCheckboxChange(e) {
        this.props.toggleExpansion();
    }
    handleBaseCheckboxChange(e) {
        this.props.toggleBaseSystems();
    }

    selectNoSystems() {
        this.props.setActiveSystem(null);
    }

    render() {
        let hexSize = getHexSizeFromScreen();

        let options = [(<option value="none" key="sys_none">(none)</option>)];
        for(let system of this.props.systems.systems) {
            options.push(<option
                value={system.id} key={"sys_"+system.id}
            >{system.getStringName()}</option>)
        }

        let selected_value = "none";
        let system_to_display = (<span className="hex-container"></span>);
        if(this.props.active_system!==null) {
            selected_value = this.props.active_system.id;
            system_to_display = (
                <SystemComponent
                    system={this.props.active_system}
                    format={this.props.system_format}
                    posStyle={{"position": "relative"}}
                    onClick={()=>{}}
                    hexSize={hexSize}
                    draggable={true}
                    onDrag={(event)=>this.props.onSelectedSystemDrag(event)}
                    onDragEnd={(event)=>this.props.onSystemDragEnd(event)}
                    onDrop={(event)=>this.props.onSystemDropped(event)}
                    eval_variables={this.props.eval_variables}
                />
            );
        }

        return(
                <div
                    className="system-bank field"
                    onDragOver={(event)=>{event.preventDefault();}}
                    onDrop={(event)=>this.props.onSystemDropped(event)}
                >
                    <label className="label">
                        System Bank
                    </label>
		            <p className="control">
		                <input
		                    id="include-base-systems"
		                    type="checkbox"
		                    checked={this.props.include_base_systems}
		                    onChange={(e)=>this.handleBaseCheckboxChange(e)}
		                />
		                <label htmlFor="include-base-systems"> Base Systems</label>
		            </p>
                    <p className="control">
                        <input
                            id="include-expansion-systems"
                            type="checkbox"
                            checked={this.props.include_expansion_systems}
                            onChange={(e)=>this.handleExpansionCheckboxChange(e)}
                        />
                        <label htmlFor="include-expansion-systems"> Expansion Systems</label>
                    </p>
                    <p className="control">
                        <span className="select is-small">
                            <select
                                id="system-bank-select"
                                value={selected_value}
                                onChange={()=>this.handleSelectChange()}
                            >
                                {options}
                            </select>
                        </span>
                    </p>
                    <p className="control">
                        <button
                            disabled={this.props.active_system===null}
                            onClick={()=>this.selectNoSystems()}
                            className="button is-small"
                        >
                            Select None
                        </button>
                    </p>
                    <div className="control">
                        {system_to_display}
                    </div>
                </div>
        );
    }
}

export class MapComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "system_format": this.props.system_format,
            "hexSize": getHexSizeFromScreen(),
        };
        this.system_box = this.props.system_box;
    }

    updateDimensions() {
        this.setState(Object.assign({}, this.state, {"hexSize": getHexSizeFromScreen()}));
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }


    render() {
		let home_stats = this.props.map.getHomeSystemStats();
        let hexSize = this.state.hexSize;
        let cw = 5.5;
        let ch = 7;
        if(this.props.map.spaces.length>37) {
            cw = 7;
            ch = 9;
        }
        let mapHeight = hexSize*.866*ch + hexSpace*6;
        let mapWidth = hexSize*cw + hexSpace*6;
        let mapCenterH = mapWidth/2;
        let mapCenterV = mapHeight/2;
        let display=[];
        for(let [index, space] of this.props.map.spaces.entries()) {
            let is_draggable=false;
            if(space.type===MAP_SPACE_TYPES.SYSTEM && this.props.systems_draggable) {
                if(!space.system.isMecatolRexSystem()) is_draggable=true;
            }
            let home_value = null;
			let these_stats = null;
            if(
                space.type===MAP_SPACE_TYPES.HOME
                &&
                this.props.home_values !== null
                &&
                (this.props.home_values && index.toString() in this.props.home_values)
            ) {
                home_value = this.props.home_values[index.toString()];
            }
			if(space.type===MAP_SPACE_TYPES.HOME) {
				let stat_container = getObjFromCoord(space, home_stats);
				if(stat_container) these_stats = stat_container.stats;
			}
            display.push(
                <MapSpaceComponent
                    space={space}
                    key={"map_space_"+index}
                    system_format={this.props.system_format}
                    onClick={()=>this.props.clickedSpace(index)}
                    hexSize={hexSize}
                    mapCenterH={mapCenterH}
                    mapCenterV={mapCenterV}
                    draggable={is_draggable}
                    onDrag={(event)=>this.props.onSystemDrag(event, space.system)}
                    onDragEnd={(event)=>this.props.onSystemDragEnd(event)}
                    onDrop={(event)=>{if(this.props.systems_draggable) this.props.onSystemDropped(event, index);}}
                    eval_variables={this.props.eval_variables}
                    home_value={home_value}
					home_stats={these_stats}
                />
            );
        }

        let mapStyle = {
            "width": mapWidth+"px",
            "height": mapHeight+"px",
        };
        return (
            <div className={"map "+this.props.map_class} style={mapStyle}>
                {display}
            </div>
        );
    }
}

export const MAP_SPACE_TYPES = {
    "OPEN": 1,
    "HOME": 2,
    "SYSTEM": 3,
    "CLOSED": 4,
    "WARP": 5,
};

export class HexComponent extends React.Component {
    onDrop(event) {
        if(this.props.onDrop) {
            this.props.onDrop(event);
        }
    }

    render() {
        let hexSize = this.props.hexSize;
        return(
            <div
                className="hex-container"
                style={this.props.posStyle}
                draggable={this.props.draggable}
                onDragStart={(event)=>this.props.onDrag(event)}
                onDragEnd={(event)=>this.props.onDragEnd(event)}
            >
                <svg className="shape-container">
                    <polygon
                        onClick={()=>this.props.onClick()}
                        className={(this.props.outlined ? "outlined ": "")+"hexagon "+this.props.hexClass}
                        points={
                            (hexSize)+", "+(hexSize*.433)+" "+
                            (hexSize*.75)+", "+(hexSize*.866)+" "+
                            (hexSize*.25)+", "+(hexSize*.866)+" "+
                            "0, "+(hexSize*.433)+" "+
                            (hexSize*.25)+", 0 "+
                            (hexSize*.75)+", 0"
                        }
                    >
                    </polygon>
                    {this.props.svgElements}
                </svg>
                <div
                    className={"hex-content "+this.props.hexClass}
                    onClick={()=>this.props.onClick()}
                    onDragOver={(event)=>{event.preventDefault();}}
                    onDrop={(event)=>this.onDrop(event)}
                >
                    {this.props.children}
                </div>
            </div>

        );
    }
}

export class MapSpaceComponent extends React.Component {
    getPositionStyle() {
        let hexSize = this.props.hexSize;
        let mapCenterH = this.props.mapCenterH;
        let mapCenterV = this.props.mapCenterV;
        let spaceOffsetV = hexSize *.5*.866;
        let spaceOffsetH = hexSize*.5;
        let x = this.props.space.x;
        let y = this.props.space.y;
        let z = this.props.space.z;

        let xhmod = x*hexSize*.75/2 + x*hexSpace*.5;
        let xvmod = 0;
        let yhmod = -y*hexSize*.75/2 - y*hexSpace*.5;
        let yvmod = -y*(hexSize*.866/2) - y*(hexSpace/2);
        let zhmod = -z*hexSize*.75/2 - z*hexSpace*.5;
        let zvmod = z*(hexSize*.866/2) + z*(hexSpace/2);

        let left = mapCenterH - spaceOffsetH + xhmod + yhmod + zhmod;
        let top = mapCenterV - spaceOffsetV + xvmod + yvmod + zvmod;

        return {"left": left+"px", "top": top+"px"};
    }

    render() {
        let display = null;
        let type = this.props.space.type;
        let posStyle = this.getPositionStyle();
        switch(type) {
            case MAP_SPACE_TYPES.OPEN:
                display = (
                    <HexComponent
                        onClick={()=>this.props.onClick()}
                        posStyle={posStyle}
                        hexSize={this.props.hexSize}
                        hexClass="open"
                        onDrop={(event)=>this.props.onDrop(event)}
                    >
                        +
                    </HexComponent>
                );
                break;
            case MAP_SPACE_TYPES.HOME:
                let home_text = null
                if(this.props.home_value !== null) {
                    home_text = (<div>{this.props.home_value}</div>);
                }
                display = (
                    <HexComponent
                        onClick={()=>this.props.onClick()}
                        posStyle={posStyle}
                        hexSize={this.props.hexSize}
                        hexClass="home"
                    >
                        {home_text}<div>{this.props.home_stats}</div>
                    </HexComponent>
                );
                break;
            case MAP_SPACE_TYPES.SYSTEM:
                display = (
                    <SystemComponent
                        system={this.props.space.system}
                        format={this.props.system_format}
                        posStyle={posStyle}
                        onClick={()=>this.props.onClick()}
                        hexSize={this.props.hexSize}
                        draggable={this.props.draggable}
                        onDrag={(event)=>this.props.onDrag(event)}
                        onDragEnd={(event)=>this.props.onDragEnd(event)}
                        onDrop={(event)=>this.props.onDrop(event)}
                        eval_variables={this.props.eval_variables}
                    />
                );
                break;
            case MAP_SPACE_TYPES.CLOSED:
                display = (
                    <HexComponent
                        onClick={()=>this.props.onClick()}
                        posStyle={posStyle}
                        hexSize={this.props.hexSize}
                        hexClass="closed"
                    >
                    </HexComponent>
                );
                break;
            case MAP_SPACE_TYPES.WARP:
                display = (
                    <WarpComponent
                        posStyle={posStyle}
                        onClick={()=>this.props.onClick()}
                        warps={this.props.space.warp_spaces}
                        hexSize={this.props.hexSize}
                    />
                );
                break;
            default:
                break;
        }
        return display;
    }
}

export class WarpComponent extends React.Component {
    get_endpoint_coords(coords, hexSize) {
        switch(coords) {
            case WARP_DIRECTIONS.NORTH:
                return {
                    "x": hexSize*.5,
                    "y": 0,
                };
            case WARP_DIRECTIONS.NORTHEAST:
                return {
                    "x": hexSize*(7/8),
                    "y": .866*hexSize*(1/4),
                };
            case WARP_DIRECTIONS.SOUTHEAST:
                return {
                    "x": hexSize*(7/8),
                    "y": .866*hexSize*(3/4),
                };
            case WARP_DIRECTIONS.SOUTH:
                return {
                    "x": hexSize*.5,
                    "y": hexSize*.866,
                };
            case WARP_DIRECTIONS.SOUTHWEST:
                return {
                    "x": hexSize*(1/8),
                    "y": hexSize*.866*(3/4),
                };
            case WARP_DIRECTIONS.NORTHWEST:
                return {
                    "x": hexSize*(1/8),
                    "y": hexSize*.866*(1/4),
                };
            default:
                return {
                    "x": 0,
                    "y": 0,
                };
        }
    }


    render() {
        let posStyle = this.props.posStyle;

        let warp_lines = [];
        let hexSize = this.props.hexSize;
        for(let [index, one_warp] of warp_configs[this.props.warps].entries()) {
            let start_coords = this.get_endpoint_coords(one_warp[0], hexSize);
            let end_coords = this.get_endpoint_coords(one_warp[1], hexSize);
            warp_lines.push(
                <line className="warp-line"
                    x1={start_coords.x}
                    y1={start_coords.y}
                    x2={end_coords.x}
                    y2={end_coords.y}
                    onClick={()=>this.props.onClick()}
                    key={"warp_line_"+index}
                />
            );
        }

        return(
            <HexComponent
                onClick={()=>this.props.onClick()}
                posStyle={posStyle}
                hexSize={this.props.hexSize}
                hexClass={"warp"}
                svgElements={warp_lines}
            >
            </HexComponent>
        );
    }
}

export const SYSTEM_FORMATS = {
    "STREAMLINED": 0,
    "STREAMLINED_WITH_NAME": 1,
    "COLORBLIND_FRIENDLY": 2,
    "COLORBLIND_FRIENDLY_WITH_NAME": 3,
    "ID_ONLY": 4,
};

export class SystemComponent extends React.Component {

    render() {
        let system = this.props.system;
        let format = this.props.format;
        let posStyle = this.props.posStyle;
        let display = null;
        let id_div = (<div className="id">{system.id}</div>);
        let extras = [];
        let value_div = null;
        if(this.props.eval_variables && system.planets.length>0) {
            value_div = (<div className="value">={system.evaluate(this.props.eval_variables)}</div>);
        }
        if(system.wormhole !== null) {
            switch(system.wormhole) {
                case WORMHOLES.ALPHA:
                    extras.push(<div className="wormhole alpha" key="alpha_wh">a</div>);
                    break;
                case WORMHOLES.BETA:
                    extras.push(<div className="wormhole beta" key="alpha_wh">b</div>);
                    break;
                default: break;
            }
        }
        if(system.anomaly !== null) {
            switch(system.anomaly) {
                case ANOMALIES.SUPERNOVA:
                    extras.push(<div className="supernova" key="supernova"></div>);
                    break;
                case ANOMALIES.GRAVITY_RIFT:
                    extras.push(<div className="gravity-rift" key="gravity-rift"></div>);
                    break;
                case ANOMALIES.NEBULA:
                    extras.push(<div className="nebula" key="nebula"></div>);
                    break;
                case ANOMALIES.ASTEROID_FIELD:
                    extras.push(
                        <div className="asteroid-field" key="asteroid-field">
                            <div className="asteroid a"></div>
                            <div className="asteroid b"></div>
                            <div className="asteroid c"></div>
                            <div className="asteroid d"></div>
                            <div className="asteroid e"></div>
                        </div>
                    );
                    break;
                default:
                    break;
            }
        }
        let rex_class = "";
        if(system.isMecatolRexSystem()) rex_class = "rex";
        let hex_props = {
            onClick:()=>this.props.onClick(),
            posStyle:posStyle,
            hexSize:this.props.hexSize,
            hexClass:rex_class,
            draggable:this.props.draggable,
            onDrag:(event)=>this.props.onDrag(event),
            onDragEnd:(event)=>this.props.onDragEnd(event),
            onDrop:(event)=>this.props.onDrop(event),
			outlined:system.isLegendary() || system.isMecatolRexSystem(),
        };

        switch(format) {
            case SYSTEM_FORMATS.ID_ONLY:
                display = (
                    <HexComponent {...hex_props} >
                        <span className="id-alone">
                            {system.id}
                        </span>
                    </HexComponent>
                );
                break;
            case SYSTEM_FORMATS.STREAMLINED_WITH_NAME:
                display = (
                    <HexComponent {...hex_props} >
                        {id_div}
                        {value_div}
                        {system.planets.map(function(planet, index) {
                            return(
                                <PlanetComponent
                                    planet={planet}
                                    key={planet.name}
                                    format={PLANET_FORMATS.STREAMLINED_WITH_NAME}
                                />
                            )
                        }, this)}
                        {extras}
                    </HexComponent>
                );
                break;
            case SYSTEM_FORMATS.STREAMLINED:
                display = (
                    <HexComponent {...hex_props} >
                        {id_div}
                        {value_div}
                        {system.planets.map(function(planet, index) {
                            return(
                                <PlanetComponent
                                    planet={planet}
                                    key={planet.name}
                                    format={PLANET_FORMATS.STREAMLINED}
                                />
                            )
                        }, this)}
                        {extras}
                    </HexComponent>
                );
                break;
            case SYSTEM_FORMATS.COLORBLIND_FRIENDLY:
                display = (
                    <HexComponent {...hex_props} >
                        {id_div}
                        {value_div}
                        {system.planets.map(function(planet, index) {
                            return(
                                <PlanetComponent
                                    planet={planet}
                                    key={planet.name}
                                    format={PLANET_FORMATS.COLORBLIND_FRIENDLY}
                                />
                            )
                        }, this)}
                    </HexComponent>
                );
                break;
            case SYSTEM_FORMATS.COLORBLIND_FRIENDLY_WITH_NAME:
                display = (
                    <HexComponent {...hex_props} >
                        {id_div}
                        {value_div}
                        {system.planets.map(function(planet, index) {
                            return(
                                <PlanetComponent
                                    planet={planet}
                                    key={planet.name}
                                    format={PLANET_FORMATS.COLORBLIND_FRIENDLY_WITH_NAME}
                                />
                            )
                        }, this)}
                    </HexComponent>
                );
                break;
            default:
                break;
        }
        return display;
    }
}

export const PLANET_FORMATS = {
    "STREAMLINED": 0,
    "STREAMLINED_WITH_NAME": 1,
    "COLORBLIND_FRIENDLY": 2,
    "COLORBLIND_FRIENDLY_WITH_NAME": 3,
};

export class PlanetComponent extends React.Component {

    render() {
        let planet = this.props.planet;
        let format = this.props.format;
        let trait_class = "";
        let trait_abbr = "";
        switch(planet.trait) {
            case PLANET_TRAITS.INDUSTRIAL:
                trait_class = "industrial";
                trait_abbr = "I";
                break;
            case PLANET_TRAITS.HAZARDOUS:
                trait_class = "hazardous";
                trait_abbr = "H";
                break;
            case PLANET_TRAITS.CULTURAL:
                trait_class="cultural";
                trait_abbr = "C";
                break;
            default:
                break;
        }
        let tech_class = "";
        let tech_abbr = "";
        switch(planet.tech_specialty) {
            case TECH_SPECIALTIES.CYBERNETIC:
                tech_class = "cybernetic";
                tech_abbr = "Y";
                break;
            case TECH_SPECIALTIES.PROPULSION:
                tech_class = "propulsion";
                tech_abbr = "B";
                break;
            case TECH_SPECIALTIES.BIOTIC:
                tech_class = "biotic";
                tech_abbr = "G";
                break;
            case TECH_SPECIALTIES.WARFARE:
                tech_class = "warfare";
                tech_abbr = "R";
                break;
            default:
                break;
        }
		let legendary_class = "";
		if(planet.name==="Primor" || planet.name==="Hope's End") {
			legendary_class = " legendary";
		}
        let name_stuff = null;
        if(
            format===PLANET_FORMATS.STREAMLINED_WITH_NAME
            || format===PLANET_FORMATS.COLORBLIND_FRIENDLY_WITH_NAME
        ) {
            name_stuff=(<span className="name">{ planet.name }</span>);
        }
        let values = (
            <div className="value_container">
                <span className="resources">{ planet.resources }</span>
                <span className="influence">{ planet.influence }</span>
            </div>);
        if(
            format===PLANET_FORMATS.COLORBLIND_FRIENDLY_WITH_NAME
            || format===PLANET_FORMATS.COLORBLIND_FRIENDLY
        ) {
            values = (
                <div className="value_container">
                    <span className={"tech "+tech_class}>{tech_abbr}</span>
                    <span className="resources">{ planet.resources }</span>
                    <span className="influence">{ planet.influence }</span>
                    <span className={"trait "+trait_class}>{trait_abbr}</span>
                </div>
            )
        }
        return (
            <div className={"planet "+trait_class+" "+tech_class+legendary_class}>
                {values}
                {name_stuff}
            </div>
        );
    }
}
