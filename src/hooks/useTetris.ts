import { useState, useCallback, useRef } from "react";
import type { Board, Piece } from "../types";
import {
    TETROMINOES,
    randomTetromino,
    createEmptyBoard,
    rotateMatrix,
} from "../utils/tetrominos";
import { isValidPosition } from "../utils/collisions";

const BOARD_ROWS = 10;
const BOARD_COLS = 20;

function createPiece(type: ReturnType<typeof randomTetromino>): Piece {
    const tetromino = TETROMINOES[type];
    return {
        type,
        shape: tetromino.shape.map((row) => [...row]),
        x: Math.floor((BOARD_COLS - tetromino.shape[0].length) / 2),
        y: -2,
        color: tetromino.color,
        borderColor: tetromino.borderColor,
    };
}

export function useTetris() {
    const [board, setBoard] = useState<Board>(createEmptyBoard());
    const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
    const [nextPiece, setNextPiece] =
        useState<ReturnType<typeof randomTetromino>>(randomTetromino());
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [paused, setPaused] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const dropIntervalRef = useRef<number>(1000);

    const spawnPiece = useCallback(() => {
        const piece = createPiece(nextPiece);
        setNextPiece(randomTetromino());

        // Check if piece can spawn
        if (!isValidPosition(board, piece, 0, 0)) {
            setGameOver(true);
            return;
        }

        setCurrentPiece(piece);
    }, [board, nextPiece]);

    const startGame = useCallback(() => {
        setBoard(createEmptyBoard());
        setScore(0);
        setLines(0);
        setLevel(1);
        setGameOver(false);
        setPaused(false);
        setGameStarted(true);
        dropIntervalRef.current = 1000;
        setNextPiece(randomTetromino());

        // Spawn first piece after a small delay to ensure state is set
        setTimeout(() => {
            setCurrentPiece(createPiece(randomTetromino()));
        }, 0);
    }, []);

    const togglePause = useCallback(() => {
        if (!gameOver && gameStarted) {
            setPaused((p) => !p);
        }
    }, [gameOver, gameStarted]);

    const movePiece = useCallback(
        (dirX: number, dirY: number): boolean => {
            if (!currentPiece || gameOver || paused) return false;

            if (isValidPosition(board, currentPiece, dirX, dirY)) {
                setCurrentPiece((prev) =>
                    prev
                        ? { ...prev, x: prev.x + dirX, y: prev.y + dirY }
                        : null
                );
                return true;
            }
            return false;
        },
        [board, currentPiece, gameOver, paused]
    );

    const rotatePiece = useCallback(() => {
        if (!currentPiece || gameOver || paused) return;

        const rotatedShape = rotateMatrix(currentPiece.shape);
        const rotatedPiece = { ...currentPiece, shape: rotatedShape };

        // Wall kick - try to move piece if rotation causes collision
        const kicks = [0, -1, 1, -2, 2];
        for (const kick of kicks) {
            if (
                isValidPosition(board, {
                    ...rotatedPiece,
                    x: rotatedPiece.x + kick,
                })
            ) {
                setCurrentPiece({ ...rotatedPiece, x: rotatedPiece.x + kick });
                return;
            }
        }
    }, [board, currentPiece, gameOver, paused]);

    const hardDrop = useCallback(() => {
        if (!currentPiece || gameOver || paused) return;

        let dropDistance = 0;
        while (isValidPosition(board, currentPiece, 0, dropDistance + 1)) {
            dropDistance++;
        }

        setCurrentPiece((prev) =>
            prev ? { ...prev, y: prev.y + dropDistance } : null
        );
        setScore((s) => s + dropDistance * 2);
    }, [board, currentPiece, gameOver, paused]);

    const lockPiece = useCallback(() => {
        if (!currentPiece) return;

        const newBoard = board.map((row) => [...row]);
        const { shape, x, y, color } = currentPiece;

        // Place piece on board
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] && y + row >= 0) {
                    newBoard[y + row][x + col] = color;
                }
            }
        }

        // Check for cleared lines
        let linesCleared = 0;
        for (let row = BOARD_ROWS - 1; row >= 0; row--) {
            if (newBoard[row].every((cell) => cell !== null)) {
                newBoard.splice(row, 1);
                newBoard.unshift(Array(BOARD_COLS).fill(null));
                linesCleared++;
                row++; // Check same row again
            }
        }

        // Update score
        if (linesCleared > 0) {
            const lineScores = [0, 100, 300, 500, 800];
            setScore((s) => s + lineScores[linesCleared] * level);
            setLines((l) => {
                const newLines = l + linesCleared;
                // Level up every 10 lines
                const newLevel = Math.floor(newLines / 10) + 1;
                if (newLevel > level) {
                    setLevel(newLevel);
                    dropIntervalRef.current = Math.max(
                        100,
                        1000 - (newLevel - 1) * 100
                    );
                }
                return newLines;
            });
        }

        setBoard(newBoard);
        spawnPiece();
    }, [board, currentPiece, level, spawnPiece]);

    const drop = useCallback(() => {
        if (!currentPiece || gameOver || paused) return;

        if (!movePiece(0, 1)) {
            lockPiece();
        }
    }, [currentPiece, gameOver, paused, movePiece, lockPiece]);

    const getDropPosition = useCallback(() => {
        if (!currentPiece) return currentPiece;

        let dropY = currentPiece.y;
        while (
            isValidPosition(board, currentPiece, 0, dropY - currentPiece.y + 1)
        ) {
            dropY++;
        }

        return { ...currentPiece, y: dropY };
    }, [board, currentPiece]);

    const getSpeed = useCallback(() => {
        return dropIntervalRef.current;
    }, []);

    return {
        board,
        currentPiece,
        nextPiece,
        score,
        lines,
        level,
        gameOver,
        paused,
        gameStarted,
        startGame,
        togglePause,
        movePiece,
        rotatePiece,
        hardDrop,
        drop,
        getDropPosition,
        getSpeed,
    };
}

export type UseTetrisReturn = ReturnType<typeof useTetris>;
