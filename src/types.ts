export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Tetromino {
  shape: number[][];
  color: string;
  borderColor: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  color: string;
  borderColor: string;
}

export type Board = (string | null)[][];

export interface GameState {
  board: Board;
  currentPiece: Piece | null;
  nextPiece: TetrominoType;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
}
