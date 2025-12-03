'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIR = { x: 0, y: 0 };

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [dir, setDir] = useState(INITIAL_DIR);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [chasing, setChasing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const move = () => {
    if (gameOver) return;

    // Move food if chasing
    let newFood = food;
    if (chasing) {
      const dx = snake[0].x - food.x;
      const dy = snake[0].y - food.y;
      newFood = {
        x: food.x + Math.sign(dx),
        y: food.y + Math.sign(dy),
      };
      // Clamp to grid
      newFood.x = Math.max(0, Math.min(GRID_SIZE - 1, newFood.x));
      newFood.y = Math.max(0, Math.min(GRID_SIZE - 1, newFood.y));
    }

    // Check collision with snake body
    if (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y)) {
      setGameOver(true);
      return;
    }

    setFood(newFood);

    const newHead = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }

    // Self collision
    if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      setGameOver(true);
      return;
    }

    const newSnake = [newHead, ...snake];

    // Food collision
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore(score + 1);
      setFood(generateFood(newSnake));
      if (score + 1 >= 10) setChasing(true);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const generateFood = (currentSnake: { x: number; y: number }[]) => {
    let pos: { x: number; y: number };
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(seg => seg.x === pos.x && seg.y === pos.y));
    return pos;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const interval = setInterval(move, 200);
    return () => clearInterval(interval);
  }, [snake, dir, gameOver, score, chasing]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (dir.y === 0) setDir({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (dir.y === 0) setDir({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (dir.x === 0) setDir({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (dir.x === 0) setDir({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'green';
    snake.forEach(seg => ctx.fillRect(seg.x * CELL_SIZE, seg.y * CELL_SIZE, CELL_SIZE, CELL_SIZE));
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }, [snake, food]);

  const reset = () => {
    setSnake(INITIAL_SNAKE);
    setDir(INITIAL_DIR);
    setFood({ x: 5, y: 5 });
    setScore(0);
    setGameOver(false);
    setChasing(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border border-gray-300"
      />
      <div className="flex gap-4">
        <span>Score: {score}</span>
        {gameOver && <span className="text-red-600">Game Over</span>}
      </div>
      {gameOver && <Button onClick={reset}>Restart</Button>}
    </div>
  );
}
