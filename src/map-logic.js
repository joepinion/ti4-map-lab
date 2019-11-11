import {MAP_SPACE_TYPES} from "./map-components";
import {warp_configs} from "./data/warp_data";
import {ANOMALIES, PLANET_TRAITS, TECH_SPECIALTIES, WORMHOLES} from "./data/tile_data";

export const PLANET_EVAL_STRATEGIES = {
    "SUM": 1,
    "GREATEST": 2,
    "GREATEST_PLUS_TECH": 3,
};

export class Planet {
    constructor(obj_data) {
        this.trait = obj_data.trait;
        this.tech_specialty = obj_data.tech_specialty;
        this.resources = obj_data.resources;
        this.influence = obj_data.influence;
        this.name = obj_data.name;
    }

    evaluate(variables) {
        let v = variables.data;
        let value = v.BASE_PLANET_MOD;
        let r = this.resources*v.RESOURCES_MULTIPLIER,
            i = this.influence*v.INFLUENCE_MULTIPLIER;
        let t = 0;
        if(this.tech_specialty!==null) {
            t+=v.TECH_MOD;
            switch(this.tech_specialty) {
                case TECH_SPECIALTIES.WARFARE:
                    t+=v.TECH_WARFARE_MOD;
                    break;
                case TECH_SPECIALTIES.PROPULSION:
                    t+=v.TECH_PROPULSION_MOD;
                    break;
                case TECH_SPECIALTIES.BIOTIC:
                    t+=v.TECH_BIOTIC_MOD;
                    break;
                case TECH_SPECIALTIES.CYBERNETIC:
                    t+=v.TECH_CYBERNETIC_MOD;
                    break;
                default:
                    break;
            }
        }
        switch(v.PLANET_STRATEGY) {
            case PLANET_EVAL_STRATEGIES.GREATEST:
                let to_add = r;
                if(i>to_add) to_add = i;
                if(t>to_add) to_add = t;
                value += to_add;
                break;
            case PLANET_EVAL_STRATEGIES.AVERAGE:
                value += (r+i+t)/3;
                break;
            default:
                let high_one = r;
                if(i>high_one) high_one = i;
                value += high_one+t;
                break;
        }
        if(r>0) value+= v.NONZERO_RESOURCES_MOD;
        if(i>0) value+= v.NONZERO_INFLUENCE_MOD;
        switch(this.trait) {
            case PLANET_TRAITS.CULTURAL:
                value+=v.TRAIT_CULTURAL_MOD;
                break;
            case PLANET_TRAITS.HAZARDOUS:
                value+=v.TRAIT_HAZARDOUS_MOD;
                break;
            case PLANET_TRAITS.INDUSTRIAL:
                value+=v.TRAIT_INDUSTRIAL_MOD;
                break;
            default:
                break;
        }
        return value;
    }
}

export class PlanetBox {
    constructor(planet_data) {
        this.planets = [];
        for(let one_planet_data of planet_data) {
            this.planets.push(new Planet(one_planet_data));
        }
    }

    getPlanetByName(name) {
        for(let one_planet of this.planets) {
            if (one_planet.name === name) {
                return one_planet;
            }
        }
        return null;
    }
}

export class System {
    constructor(obj_data, planet_box) {
        this.id = obj_data.id;
        this.anomaly = obj_data.anomaly;
        this.wormhole = obj_data.wormhole;
        this.planets = [];
        for(let planet_name of obj_data.planets) {
            let plToAdd = planet_box.getPlanetByName(planet_name);
            if(plToAdd) this.planets.push(plToAdd);
        }
    }

    evaluate(variables) {
        let v = variables.data;
        let value=0;
        for(let one_planet of this.planets) {
            value+=one_planet.evaluate(variables);
        }
        if(this.planets.length===1) {
            value+=v.SINGLE_PLANET_MOD;
        } else if(this.planets.length>1) {
            value+=v.MULTI_PLANET_MOD;
            if(this.planets[0].trait === this.planets[1].trait) {
                value+=v.MATCHING_PLANETS_MOD;
            } else {
                value+=v.NONMATCHING_PLANETS_MOD;
            }
        }
        if(this.isMecatolRexSystem()) {
            value+=v.MECATOL_REX_SYS_MOD;
        }
        return value;
    }

    getDistanceModifier(variables = {}) {
        let v = variables.data;
        let value = v.DISTANCE_MOD_BASE;
        if(this.isBlue()) {
            if(v.DISTANCE_MOD_PLANET===false) return false;
            value+=v.DISTANCE_MOD_PLANET;
            if(this.wormhole!==null) {
                if(v.DISTANCE_MOD_PLANET_WORMHOLE===false) return false;
                value+=v.DISTANCE_MOD_PLANET_WORMHOLE;
            }
        } else if(this.anomaly===null) {
            if(this.wormhole!==null) {
                if(v.DISTANCE_MOD_EMPTY_WORMHOLE===false) return false;
                value+=v.DISTANCE_MOD_EMPTY_WORMHOLE;
            } else {
                if(v.DISTANCE_MOD_EMPTY===false) return false;
                value+=v.DISTANCE_MOD_EMPTY;
            }
        } else {
            switch(this.anomaly) {
                case ANOMALIES.ASTEROID_FIELD:
                    if(v.DISTANCE_MOD_ASTEROID_FIELD===false) return false;
                    value+=v.DISTANCE_MOD_ASTEROID_FIELD;
                    break;
                case ANOMALIES.GRAVITY_RIFT:
                    if(v.DISTANCE_MOD_GRAVITY_RIFT===false) return false;
                    value+=v.DISTANCE_MOD_GRAVITY_RIFT;
                    break;
                case ANOMALIES.NEBULA:
                    if(v.DISTANCE_MOD_NEBULA===false) return false;
                    value+=v.DISTANCE_MOD_NEBULA;
                    break;
                case ANOMALIES.SUPERNOVA:
                    if(v.DISTANCE_MOD_SUPERNOVA===false) return false;
                    value+=v.DISTANCE_MOD_SUPERNOVA;
                    break;
                default:
                    return false;
            }
        }
        return value;
    }

    isMecatolRexSystem() {
        for(let planet of this.planets) {
            if (planet.name === "Mecatol Rex") return true;
        }
        return false;
    }

    isRed() {
        if(this.planets.length<1) return true;
        return false;
    }

    isBlue() {
        return !this.isRed();
    }

    getStringName() {
        let system = this;
        let name_array = [];
        for(let planet of system.planets) {
            name_array.push(planet.name+" ("+planet.resources+"/"+planet.influence+")");
        }
        if(system.wormhole !== null) {
            switch(system.wormhole) {
                case WORMHOLES.ALPHA:
                    name_array.push("(a)");
                    break;
                case WORMHOLES.BETA:
                    name_array.push("(b)");
                    break;
                default: break;
            }
        }
        if(system.anomaly !== null) {
            switch(system.anomaly) {
                case ANOMALIES.SUPERNOVA:
                    name_array.push("Supernova");
                    break;
                case ANOMALIES.GRAVITY_RIFT:
                    name_array.push("Gravity Rift");
                    break;
                case ANOMALIES.NEBULA:
                    name_array.push("Nebula");
                    break;
                case ANOMALIES.ASTEROID_FIELD:
                    name_array.push("Asteroid Field");
                    break;
                default:
                    break;
            }
        }
        if(name_array.length===0) name_array.push("Empty Space");
        return system.id+": "+name_array.join(", ");
    }
}

export class SystemBox {
    constructor(system_data, planet_box) {
        this.systems = [];
        this.planet_box = planet_box;
        for(let one_system_data of system_data) {
            this.systems.push(new System(one_system_data, planet_box));
        }
    }

    getBlueSystemTotal() {
        let total = 0;
        for(let system of this.systems) {
            if(system.isBlue()) {
                total++;
            }
        }
        return total;
    }

    getRedSystemTotal() {
        let total = 0;
        for(let system of this.systems) {
            if(system.isRed()) {
                total++;
            }
        }
        return total;
    }

    getSystemIndexByID(id) {
        for(let [index, system] of this.systems.entries()) {
            if(system.id === id) return index;
        }
        return null;
    }

    getSystemByID(id, splice=false) {
        let sysindex = this.getSystemIndexByID(id);
        if (sysindex!==null && splice) return this.systems.splice(sysindex, 1);
        if (sysindex!==null) return this.systems[sysindex];
        return null;
    }

    makeCopy() {
        let new_system_box = new SystemBox([], this.planet_box);
        for(let one_system of this.systems) {
            new_system_box.systems.push(one_system);
        }
        return new_system_box;
    }

    getWormholeSystems(type=null) {
        let systems_to_return = [];
        for(let one_sys of this.systems) {
            if(
                one_sys.wormhole!==null
                &&
                (
                    type===null
                    ||
                    one_sys.wormhole===type
                )
            ) {
                systems_to_return.push(one_sys);
            }
        }
        return systems_to_return;
    }
}

export function getDistanceMultiplier(modded_distance, variables) {
    let v = variables.data;
    let d = modded_distance;
    if(d<0) d = 0;
    if(d>10) d = 10;
    return v.DISTANCE_MULTIPLIER[d];
}

export class Map {
    constructor(load_default=true, starting_space=null, iterations=3) {
        if(load_default) {
            this.spaces = [starting_space];
            for(let i=0; i<iterations; i++) {
                this.addAdjacentSpaces();
            }
        } else {
            this.spaces = [];
        }
    }

    makeCopy() {
        let new_map = new Map(false);
        for(let one_space of this.spaces) {
            let new_space = new MapSpace(
                one_space.x,
                one_space.y,
                one_space.z,
                one_space.warp_spaces,
                one_space.type,
                one_space.system,
            );
            new_map.spaces.push(new_space);
        }
        return new_map;
    }

    containsSystem(system_id) {
        return (this.getSpaceBySystemID(system_id) !== null);
    }

    getSpaceBySystemID(id) {
        for(let one_space of this.spaces) {
            if(
                one_space.system!==null
                && one_space.system.id===id
            ) return one_space;
        }
        return null;
    }

    getOpenSpacesTotal() {
        let total = 0;
        for(let space of this.spaces) {
            if(space.type===MAP_SPACE_TYPES.OPEN) {
                total++;
            }
        }
        return total;
    }

    getBlueSystemTotal() {
        let total = 0;
        for(let space of this.spaces) {
            if(space.type===MAP_SPACE_TYPES.SYSTEM && space.system.isBlue()) {
                total++;
            }
        }
        return total;
    }

    getRedSystemTotal() {
        let total = 0;
        for(let space of this.spaces) {
            if(space.type===MAP_SPACE_TYPES.SYSTEM && space.system.isRed()) {
                total++;
            }
        }
        return total;
    }

    getPossibleSystemTotal() {
        let total = 0;
        for(let space of this.spaces) {
            if(
                space.type===MAP_SPACE_TYPES.SYSTEM
                || space.type===MAP_SPACE_TYPES.OPEN
            ) {
                total++;
            }
        }
        return total;
    }

   areWarpsLogical() {
        for(let space of this.spaces) {
            if (space.type === MAP_SPACE_TYPES.WARP) {
                for(let one_warp of warp_configs[space.warp_spaces]) {
                    for(let one_warp_dir of one_warp) {
                        if(!this.doesWarpDirectionConnect(one_warp_dir, space, [space])) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    doesWarpDirectionConnect(warp_direction, space, checked_spaces) {
        let whereItGoes = space.getWarpDirectionCoordinates(warp_direction);
        let spaceItGoes = getObjFromCoord(whereItGoes, this.spaces);
        if(!spaceItGoes) return false;
        if(areCoordsInList(spaceItGoes, checked_spaces)) return false;
        if(spaceItGoes.type === MAP_SPACE_TYPES.CLOSED) return false;
        if(spaceItGoes.type === MAP_SPACE_TYPES.WARP) {
            let oppositeDirection = {
                "x": warp_direction.x*-1,
                "y": warp_direction.y*-1,
                "z": warp_direction.z*-1,
            };
            let directions_to_check = [];
            for(let one_next_warp of warp_configs[spaceItGoes.warp_spaces]) {
                if(areCoordsInList(oppositeDirection, [one_next_warp[0]])) {
                    directions_to_check.push(one_next_warp[1]);
                } else if(areCoordsInList(oppositeDirection, [one_next_warp[1]])) {
                    directions_to_check.push(one_next_warp[0]);
                }
            }
            if(directions_to_check.length === 0) return false;
            checked_spaces.push(spaceItGoes);
            for(let one_direction of directions_to_check) {
                if(!this.doesWarpDirectionConnect(one_direction, spaceItGoes, checked_spaces)) {
                    return false;
                }
            }
        }
        return true;
    }

    isComplete() {
        for(let map_space of this.spaces) {
            if(map_space.type===MAP_SPACE_TYPES.OPEN) {
                return false;
            }
        }
        return true;
    }

    isLegal() {
        let is_legal = true;
        for(let map_space of this.spaces) {
            if(map_space.type===MAP_SPACE_TYPES.SYSTEM && map_space.system.wormhole !== null) {
                for(let one_sys of this.getAdjacentSystems(map_space)) {
                    if(one_sys.type===MAP_SPACE_TYPES.SYSTEM && one_sys.system.wormhole===map_space.system.wormhole) {
                        is_legal = false;
                        break;
                    }
                }
            }
            if(map_space.type===MAP_SPACE_TYPES.SYSTEM && map_space.system.anomaly !== null) {
                for(let one_sys of this.getAdjacentSystems(map_space)) {
                    if(one_sys.type===MAP_SPACE_TYPES.SYSTEM && one_sys.system.anomaly!==null) {
                        is_legal = false;
                        break;
                    }
                }
            }
            if(!is_legal) break;
        }
        return is_legal;
    }

    getHomeValue(space, variables) {
        let home_total = 0;
        let spaces_to_get_to = [];
        for(let one_space of this.spaces) {
            if(
                one_space.type===MAP_SPACE_TYPES.SYSTEM &&
                one_space.system.evaluate(variables) > 0
            ) {
                spaces_to_get_to.push(one_space);
            }
        }
        for(let one_space of spaces_to_get_to) {
            let shortest_distance = this._getShortestModdedDistance(
                space, one_space, variables
            );
            if(!(shortest_distance===null)) {
                home_total+=getDistanceMultiplier(
                    shortest_distance, variables
                )*one_space.system.evaluate(variables);
            }
        }
        return home_total;
    }

    _getShortestModdedDistance(start_space, dest_space, variables) {
        let finished_paths = [];
        let act_paths = [];

        let first_steps = this.getAdjacentSystemsIncludingWormholes(start_space);
        for(let one_step of first_steps) {
            if(
                one_step.system.getDistanceModifier(variables)!==false
                && this.getMapDistanceModifier(start_space, dest_space, variables)!==false
            ) {
                let new_path = [one_step.system.id];
                if(one_step.system.id===dest_space.system.id) {
                    finished_paths.push(new_path);
                } else {
                    act_paths.push(new_path);
                }
            }
        }
        while(act_paths.length>0) {
            let new_active_paths = [];
            for(let one_path of act_paths) {
                let results = this._extendPath(start_space, dest_space, one_path, variables);
                for(let one_done of results.finished) {
                    finished_paths.push(one_done);
                }
                for(let one_ongoing of results.ongoing) {
                    new_active_paths.push(one_ongoing);
                }
            }
            act_paths=new_active_paths;
        }
        let first_yet = false;
        let shortest = null;
        for(let one_path of finished_paths) {
            let path_length = this._calculateModdedDistanceFromRaw(one_path, variables, start_space);
            if(!first_yet || path_length<shortest) {
                shortest = path_length;
                first_yet = true;
            }
        }
        return shortest;
    }

    _extendPath(start_space, dest_space, path, variables) {
        let completed_paths = [];
        let ongoing_paths = [];
        let last_step = this.getSpaceBySystemID(path[path.length-1]);
        let next_steps = this.getAdjacentSystemsIncludingWormholes(last_step);
        for(let one_step of next_steps) {
            if(one_step.system.id===dest_space.system.id) {
                let path_copy = [...path];
                path_copy.push(one_step.system.id);
                completed_paths.push(path_copy);
            } else if (
                !(one_step.system.id in path)
                && one_step.system.getDistanceModifier(variables)!==false
                && this.getMapDistanceModifier(start_space, dest_space, variables)!==false
                && path.length<4
            ) {
                let path_copy = [...path];
                path_copy.push(one_step.system.id);
                ongoing_paths.push(path_copy);
            }
        }
        return({
            "finished": completed_paths,
            "ongoing": ongoing_paths,
        });
    }


    _calculateModdedDistanceFromRaw(path, variables, start_space) {
        let modded_dist = 0;
        for(let one_index of path) {
            let one_sys = this.getSpaceBySystemID(one_index);
            modded_dist+=
                one_sys.system.getDistanceModifier(variables)
                +this.getMapDistanceModifier(start_space, one_sys, variables);
        }
        return modded_dist;
    }

    getMapDistanceModifier(start_space, dest_space, variables) {
        let adj_spaces = this.getAdjacentSpacesIncludingWormholes(dest_space);
        for(let one_space of adj_spaces) {
            if(
                one_space.type===MAP_SPACE_TYPES.HOME &&
                !areCoordsInList(start_space, [one_space]
                )
            ) {
                return variables.data.DISTANCE_MOD_ADJACENT_TO_OPPONENT;
            }
        }
        return 0;
    }



    addAdjacentSpaces() {
        let coords_to_add = [];
        for(let map_space of this.spaces) {
            let adjacent_coords = map_space.getAdjacentCoordinates();
            for(let one_adjacent_coords of adjacent_coords) {
                if(
                    !areCoordsInList(one_adjacent_coords, coords_to_add) &&
                    !areCoordsInList(one_adjacent_coords, this.spaces)
                ) {
                    coords_to_add.push(one_adjacent_coords);
                }
            }
        }
        for(let one_coords_to_add of coords_to_add) {
            this.spaces.push(new MapSpace(
                one_coords_to_add.x,
                one_coords_to_add.y,
                one_coords_to_add.z,
            ));
        }
    }

    _getAdjacentSpacesThroughWarps(system_space, warp_space) {
        let adj_systems = [];
        let direction_from = {
            "x": system_space.x - warp_space.x,
            "y": system_space.y - warp_space.y,
            "z": system_space.z - warp_space.z,
        };
        let warps_to_follow = [];
        for(let one_warp of warp_configs[warp_space.warp_spaces]) {
            if(areCoordsInList(direction_from, one_warp)) {
                warps_to_follow.push(one_warp);
            }
        }
        for(let one_warp of warps_to_follow) {
            for(let one_warp_direction of one_warp) {
                if(!areCoordsInList(one_warp_direction, [direction_from])) {
                    let next_space = getObjFromCoord(
                        warp_space.getWarpDirectionCoordinates(one_warp_direction),
                        this.spaces
                    );
                    if(next_space!==null) {
                        if(next_space.type!==MAP_SPACE_TYPES.WARP) {
                            if (!areCoordsInList(next_space, adj_systems)) {
                                adj_systems.push(next_space);
                            }
                        } else {
                            let farther_systems = this._getAdjacentSpacesThroughWarps(warp_space, next_space);
                            for(let one_far_sys of farther_systems) {
                                if(!areCoordsInList(one_far_sys, adj_systems)) {
                                    adj_systems.push(one_far_sys);
                                }
                            }
                        }
                    }
                }
            }
        }
        return adj_systems;
    }

    getAdjacentSystems(space) {
        let adj_spaces = this.getAdjacentSpaces(space);
        let adj_systems = [];
        for(let one_space of adj_spaces) {
            if(one_space.type===MAP_SPACE_TYPES.SYSTEM){
                adj_systems.push(one_space);
            }
        }
        return adj_systems;
    }

    getAdjacentSpaces(space) {
        let adj_coords = space.getAdjacentCoordinates();
        let adj_systems = [];
        for(let one_coord of adj_coords) {
            let potential_space = getObjFromCoord(one_coord, this.spaces);
            if(potential_space !== null) {
                if(potential_space.type!==MAP_SPACE_TYPES.WARP){
                    if(!areCoordsInList(potential_space, adj_systems)) {
                        adj_systems.push(potential_space);
                    }
                } else {
                    let potential_systems = this._getAdjacentSpacesThroughWarps(space, potential_space);
                    for(let one_system_space of potential_systems) {
                        if(!areCoordsInList(one_system_space, adj_systems)) {
                            adj_systems.push(one_system_space);
                        }
                    }
                }
            }
        }
        return adj_systems;
    }

    getAdjacentSystemsIncludingWormholes(space) {
        let adj_spaces = this.getAdjacentSpacesIncludingWormholes(space);
        let adj_systems = [];
        for(let one_space of adj_spaces) {
            if(one_space.type===MAP_SPACE_TYPES.SYSTEM) {
                adj_systems.push(one_space);
            }
        }
        return adj_systems;
    }

    getAdjacentSpacesIncludingWormholes(space) {
        let adj_systems = this.getAdjacentSpaces(space);
        let wh_systems = this.getMatchingWormholeSpaces(space);
        for(let one_whs of wh_systems) {
            if(!areCoordsInList(one_whs, adj_systems)) {
                adj_systems.push(one_whs);
            }
        }
        return adj_systems;
    }

    getMatchingWormholeSpaces(space) {
        let matching_spaces = [];
        if(space.type===MAP_SPACE_TYPES.SYSTEM && space.system.wormhole!==null) {
            for(let one_space of this.spaces) {
                if(
                    one_space.type===MAP_SPACE_TYPES.SYSTEM &&
                    one_space.system.wormhole===space.system.wormhole &&
                    one_space.system.id !== space.system.id
                ) {
                    matching_spaces.push(one_space);
                }
            }
        }
        return matching_spaces;
    }

}

export function getObjFromCoord(coords, list) {
        for(let existing_coords of list) {
        if(
            coords.x === existing_coords.x &&
            coords.y === existing_coords.y &&
            coords.z === existing_coords.z
        ) {
            return existing_coords;
        }
    }
    return null;
}

export function areCoordsInList(coords, list) {
    if(getObjFromCoord(coords, list)) {
        return true;
    }
    return false;
}

export class MapSpace {
    constructor(x, y, z, warp_spaces=null, type=MAP_SPACE_TYPES.OPEN, system=null) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.warp_spaces = warp_spaces;
        this.type = type;
        this.system = system;
    }

    getAdjacentCoordinates() {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        return [
            {"x":x+1,"y":y-1,"z":z},
            {"x":x+1,"y":y,"z":z-1},
            {"x":x-1,"y":y+1,"z":z},
            {"x":x,"y":y+1,"z":z-1},
            {"x":x-1,"y":y,"z":z+1},
            {"x":x,"y":y-1,"z":z+1},
        ];
    }

    getWarpDirectionCoordinates(warp_direction) {
        return {
            "x": this.x+warp_direction.x,
            "y": this.y+warp_direction.y,
            "z": this.z+warp_direction.z,
        }
    }
}