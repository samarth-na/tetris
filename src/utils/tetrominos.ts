import type { Tetromino, TetrominoType } from "../types";

export const TETROMINOES: Record<TetrominoType, Tetromino> = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        color: "#00f5ff",
        borderColor: "#00b8c4",
    },
    O: {
        shape: [
            [1, 1],
            [1, 1],
        ],
        color: "#ffeb3b",
        borderColor: "#c7b928",
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: "#ba68c8",
        borderColor: "#8e44ad",
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ],
        color: "#66bb6a",
        borderColor: "#388e3c",
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ],
        color: "#ef5350",
        borderColor: "#c62828",
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: "#42a5f5",
        borderColor: "#1565c0",
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: "#ff9800",
        borderColor: "#e65100",
    },
};

export const TETROMINO_TYPES: TetrominoType[] = [
    "I",
    "O",
    "T",
    "S",
    "Z",
    "J",
    "L",
];

export function randomTetromino(): TetrominoType {
    const randomIndex = Math.floor(Math.random() * TETROMINO_TYPES.length);
    return TETROMINO_TYPES[randomIndex];
}

export function rotateMatrix(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated: number[][] = [];

    for (let col = 0; col < cols; col++) {
        rotated[col] = [];
        for (let row = rows - 1; row >= 0; row--) {
            rotated[col].push(matrix[row][col]);
        }
    }

    return rotated;
}

export function createEmptyBoard(): (string | null)[][] {
    return Array(20)
        .fill(null)
        .map(() => Array(10).fill(null));
}
