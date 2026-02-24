import type { Board, Piece } from "../types";

export function isValidPosition(
    board: Board,
    piece: Piece,
    offsetX: number = 0,
    offsetY: number = 0
): boolean {
    const { shape, x, y } = piece;
    const BOARD_ROWS = board.length;
    const BOARD_COLS = board[0].length;

    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col] === 0) continue;

            const newX = x + col + offsetX;
            const newY = y + row + offsetY;

            // Check boundaries
            if (newX < 0 || newX >= BOARD_COLS || newY >= BOARD_ROWS) {
                return false;
            }

            // Check collision with placed pieces (only if newY >= 0)
            if (newY >= 0 && board[newY][newX] !== null) {
                return false;
            }
        }
    }

    return true;
}

export function checkCollision(
    board: Board,
    piece: Piece,
    moveX: number = 0,
    moveY: number = 0
): boolean {
    return !isValidPosition(board, piece, moveX, moveY);
}
