export const WARP_DIRECTIONS = {
    "NORTH": {"x": 0, "y": 1, "z": -1},
    "NORTHEAST": {"x": 1, "y": 0, "z": -1},
    "SOUTHEAST": {"x": 1, "y": -1, "z": 0},
    "SOUTH": {"x": 0, "y": -1, "z": 1},
    "SOUTHWEST": {"x": -1, "y": 0, "z": 1},
    "NORTHWEST": {"x": -1, "y": 1, "z": 0},
};

export let warp_configs = [
    [
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTHEAST],
    ],
    [
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTH],
    ],
    [
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTHWEST],
    ],
    [
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.SOUTH],
    ],
    [
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.SOUTHWEST],
    ],
    [
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.NORTHWEST],
    ],
    [
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.SOUTHWEST],
    ],
    [
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.NORTHWEST],
    ],
    [
        [WARP_DIRECTIONS.SOUTH, WARP_DIRECTIONS.NORTHWEST],
    ],
    [
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTHEAST],
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTH],
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTHWEST],
    ],
    [
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.NORTHWEST],
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.SOUTH],
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.SOUTHWEST],
    ],
    [
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.NORTH],
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.NORTHWEST],
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.SOUTHWEST],
    ],
    [
        [WARP_DIRECTIONS.SOUTH, WARP_DIRECTIONS.NORTH],
        [WARP_DIRECTIONS.SOUTH, WARP_DIRECTIONS.NORTHWEST],
        [WARP_DIRECTIONS.SOUTH, WARP_DIRECTIONS.NORTHEAST],
    ],
    [
        [WARP_DIRECTIONS.SOUTHWEST, WARP_DIRECTIONS.NORTH],
        [WARP_DIRECTIONS.SOUTHWEST, WARP_DIRECTIONS.NORTHEAST],
        [WARP_DIRECTIONS.SOUTHWEST, WARP_DIRECTIONS.SOUTHEAST],
    ],
    [
        [WARP_DIRECTIONS.NORTHWEST, WARP_DIRECTIONS.SOUTHEAST],
        [WARP_DIRECTIONS.NORTHWEST, WARP_DIRECTIONS.SOUTH],
        [WARP_DIRECTIONS.NORTHWEST, WARP_DIRECTIONS.NORTHEAST],
    ],
    [
        [WARP_DIRECTIONS.NORTHWEST, WARP_DIRECTIONS.SOUTH],
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTH],
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTHEAST],
    ],
    [
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTHWEST],
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.SOUTHWEST],
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.SOUTH],
    ],
    [
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.NORTHWEST],
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.NORTHWEST],
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.SOUTHWEST],
    ],
    [
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTH],
        [WARP_DIRECTIONS.SOUTH, WARP_DIRECTIONS.NORTHEAST],
        [WARP_DIRECTIONS.SOUTHWEST, WARP_DIRECTIONS.NORTH],
    ],
    [
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.SOUTHWEST],
        [WARP_DIRECTIONS.SOUTHWEST, WARP_DIRECTIONS.SOUTHEAST],
        [WARP_DIRECTIONS.NORTHWEST, WARP_DIRECTIONS.NORTHEAST],
    ],
    [
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.NORTHWEST],
        [WARP_DIRECTIONS.NORTHWEST, WARP_DIRECTIONS.SOUTH],
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTHEAST],
    ],
    [
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTH],
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTHWEST],
    ],
    [
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.SOUTHWEST],
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.NORTHWEST],
    ],
    [
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.NORTHWEST],
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.NORTH],
    ],
    [
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTH],
        [WARP_DIRECTIONS.SOUTH, WARP_DIRECTIONS.NORTHEAST],
    ],
    [
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.SOUTHWEST],
        [WARP_DIRECTIONS.SOUTHWEST, WARP_DIRECTIONS.SOUTHEAST],
    ],
    [
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.NORTHWEST],
        [WARP_DIRECTIONS.NORTHWEST, WARP_DIRECTIONS.SOUTH],
    ],
    [
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTH],
        [WARP_DIRECTIONS.NORTH, WARP_DIRECTIONS.SOUTHEAST],
    ],
    [
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.SOUTHWEST],
        [WARP_DIRECTIONS.NORTHEAST, WARP_DIRECTIONS.SOUTH],
    ],
    [
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.NORTHWEST],
        [WARP_DIRECTIONS.SOUTHEAST, WARP_DIRECTIONS.SOUTHWEST],
    ],
    [
        [WARP_DIRECTIONS.SOUTH, WARP_DIRECTIONS.NORTH],
        [WARP_DIRECTIONS.SOUTH, WARP_DIRECTIONS.NORTHWEST],
    ],
    [
        [WARP_DIRECTIONS.SOUTHWEST, WARP_DIRECTIONS.NORTHEAST],
        [WARP_DIRECTIONS.SOUTHWEST, WARP_DIRECTIONS.NORTH],
    ],
    [
        [WARP_DIRECTIONS.NORTHWEST, WARP_DIRECTIONS.SOUTHEAST],
        [WARP_DIRECTIONS.NORTHWEST, WARP_DIRECTIONS.NORTHEAST],
    ],
];
