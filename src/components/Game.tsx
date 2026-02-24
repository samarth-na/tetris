import { useEffect, useRef, useCallback } from "react";
import { useTetris } from "../hooks/useTetris";
import { useGameLoop } from "../hooks/useGameLoop";
import { TETROMINOES } from "../utils/tetrominos";
import "./Game.css";

const CELL_SIZE = 30;
const BOARD_WIDTH = 20 * CELL_SIZE;
const BOARD_HEIGHT = 30 * CELL_SIZE;

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ghostCanvasRef = useRef<HTMLCanvasElement>(null);

  const {
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
  } = useTetris();

  // Handle keyboard input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!gameStarted) return;

      switch (e.key) {
        case "ArrowLeft":
        case "h":
        case "H":
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case "ArrowRight":
        case "l":
        case "L":
          e.preventDefault();
          movePiece(1, 0);
          break;
        case "ArrowDown":
        case "j":
        case "J":
          e.preventDefault();
          drop();
          break;
        case "ArrowUp":
        case "k":
        case "K":
          e.preventDefault();
          rotatePiece();
          break;
        case " ":
          e.preventDefault();
          hardDrop();
          break;
        case "p":
        case "P":
          e.preventDefault();
          togglePause();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, movePiece, rotatePiece, hardDrop, drop, togglePause]);

  // Game loop
  useGameLoop(drop, getSpeed(), gameStarted && !gameOver && !paused);

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ghostCanvas = ghostCanvasRef.current;
    if (!canvas || !ghostCanvas) return;

    const ctx = canvas.getContext("2d");
    const ghostCtx = ghostCanvas.getContext("2d");
    if (!ctx || !ghostCtx) return;

    // Clear canvases
    ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    ghostCtx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Draw board background
    ctx.fillStyle = "#282c34";
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Draw grid
    ctx.strokeStyle = "#3e4451";
    ctx.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, BOARD_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(BOARD_WIDTH, y);
      ctx.stroke();
    }

    // Draw placed pieces
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          drawBlock(ctx, x, y, cell, "#00000033");
        }
      });
    });

    // Draw ghost piece
    if (currentPiece && !gameOver && !paused) {
      const ghostPiece = getDropPosition();
      if (ghostPiece) {
        ghostCtx.globalAlpha = 0.3;
        ghostPiece.shape.forEach((row, dy) => {
          row.forEach((value, dx) => {
            if (value) {
              drawBlock(
                ghostCtx,
                ghostPiece.x + dx,
                ghostPiece.y + dy,
                ghostPiece.color,
                "#00000050"
              );
            }
          });
        });
        ghostCtx.globalAlpha = 1;
      }
    }

    // Draw current piece
    if (currentPiece && !gameOver) {
      currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
          if (value && currentPiece.y + dy >= 0) {
            drawBlock(
              ctx,
              currentPiece.x + dx,
              currentPiece.y + dy,
              currentPiece.color,
              currentPiece.borderColor
            );
          }
        });
      });
    }
  }, [board, currentPiece, gameOver, paused, getDropPosition]);

  // Draw on every state change
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="game-container">
      <div className="game-wrapper">
        {/* Left Panel */}
        <div className="side-panel left-panel">
          <div className="panel-box">
            <h3 className="panel-title">NEXT</h3>
            <div className="next-piece-container">
              {gameStarted && !gameOver && (
                <NextPiecePreview type={nextPiece} />
              )}
            </div>
          </div>

          <div className="panel-box">
            <h3 className="panel-title">CONTROLS</h3>
            <div className="controls-list">
              <div className="control-item">
                <kbd>←</kbd>
                <kbd>→</kbd> / <kbd>H</kbd>
                <kbd>L</kbd> Move
              </div>
              <div className="control-item">
                <kbd>↑</kbd> / <kbd>K</kbd> Rotate
              </div>
              <div className="control-item">
                <kbd>↓</kbd> / <kbd>J</kbd> Soft Drop
              </div>
              <div className="control-item">
                <kbd>Space</kbd> Hard Drop
              </div>
              <div className="control-item">
                <kbd>P</kbd> Pause
              </div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="board-container">
          <div className="board-frame">
            <canvas
              ref={ghostCanvasRef}
              width={BOARD_WIDTH}
              height={BOARD_HEIGHT}
              className="game-canvas ghost-canvas"
            />
            <canvas
              ref={canvasRef}
              width={BOARD_WIDTH}
              height={BOARD_HEIGHT}
              className="game-canvas"
            />
          </div>

          {/* Overlays */}
          {!gameStarted && (
            <div className="overlay">
              <h1 className="game-title">TETRIS</h1>
              <button className="start-button" onClick={startGame}>
                START GAME
              </button>
            </div>
          )}

          {gameOver && (
            <div className="overlay">
              <h2 className="game-over-title">GAME OVER</h2>
              <p className="final-score">Score: {score}</p>
              <button className="start-button" onClick={startGame}>
                PLAY AGAIN
              </button>
            </div>
          )}

          {paused && gameStarted && !gameOver && (
            <div className="overlay">
              <h2 className="pause-title">PAUSED</h2>
              <button className="start-button" onClick={togglePause}>
                RESUME
              </button>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="side-panel right-panel">
          <div className="panel-box">
            <h3 className="panel-title">SCORE</h3>
            <p className="score-value">{score.toLocaleString()}</p>
          </div>

          <div className="panel-box">
            <h3 className="panel-title">LEVEL</h3>
            <p className="score-value">{level}</p>
          </div>

          <div className="panel-box">
            <h3 className="panel-title">LINES</h3>
            <p className="score-value">{lines}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  borderColor: string
) {
  const size = CELL_SIZE;
  const padding = 1;

  // Main block
  ctx.fillStyle = color;
  ctx.fillRect(
    x * size + padding,
    y * size + padding,
    size - padding * 2,
    size - padding * 2
  );

  // Highlight (top-left)
  ctx.fillStyle = "#ffffff60";
  ctx.fillRect(
    x * size + padding + 2,
    y * size + padding + 2,
    size - padding * 2 - 4,
    (size - padding * 2) / 2 - 2
  );

  // Shadow (bottom-right)
  ctx.fillStyle = "#00000040";
  ctx.fillRect(
    x * size + padding + 2,
    y * size + padding + (size - padding * 2) / 2,
    size - padding * 2 - 4,
    (size - padding * 2) / 2 - 2
  );

  // Border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(
    x * size + padding + 1,
    y * size + padding + 1,
    size - padding * 2 - 2,
    size - padding * 2 - 2
  );
}

function NextPiecePreview({
  type,
}: {
  type: ReturnType<typeof import("../utils/tetrominos").randomTetromino>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tetromino = TETROMINOES[type];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#282c34";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const blockSize = 25;
    const offsetX = (canvas.width - tetromino.shape[0].length * blockSize) / 2;
    const offsetY = (canvas.height - tetromino.shape.length * blockSize) / 2;

    tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          drawBlockPreview(
            ctx,
            x,
            y,
            tetromino.color,
            tetromino.borderColor,
            blockSize,
            offsetX,
            offsetY
          );
        }
      });
    });
  }, [type, tetromino]);

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={100}
      className="next-piece-canvas"
    />
  );
}

function drawBlockPreview(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  borderColor: string,
  size: number,
  offsetX: number,
  offsetY: number
) {
  const padding = 1;

  ctx.fillStyle = color;
  ctx.fillRect(
    offsetX + x * size + padding,
    offsetY + y * size + padding,
    size - padding * 2,
    size - padding * 2
  );

  ctx.fillStyle = "#ffffff60";
  ctx.fillRect(
    offsetX + x * size + padding + 2,
    offsetY + y * size + padding + 2,
    size - padding * 2 - 4,
    (size - padding * 2) / 2 - 2
  );

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(
    offsetX + x * size + padding + 1,
    offsetY + y * size + padding + 1,
    size - padding * 2 - 2,
    size - padding * 2 - 2
  );
}
