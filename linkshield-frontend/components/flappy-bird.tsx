import React, { useRef, useEffect, useState } from "react";

// Game constants
const GRAVITY = 0.5;
const FLAP = -7;
const PIPE_WIDTH = 50;
const PIPE_GAP = 120;
const BIRD_SIZE = 32;
const GAME_SPEED = 2;
const GAME_HEIGHT = 320;
const GAME_WIDTH = 400;

function getRandomPipeY() {
  return 40 + Math.random() * (GAME_HEIGHT - PIPE_GAP - 80);
}

const THEME = {
  bg: "#f3f4f6", // subtle gray
  pipe: "#cbd5e1", // light gray
  bird: "#64748b", // slate
  score: "#334155", // dark slate
  label: "#475569", // label color
  lBall: "#64748b", // L ball color
  lText: "#f1f5f9", // L text color
};

const PROBLEM_LABELS = [
  "Phishing",
  "Spam",
  "Malware",
  "Fake Links",
  "Tracking",
  "Data Leak",
  "Bots",
  "Ads",
  "Hijack",
  "Scam",
];

const FlappyLinkShield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'autoplay' | 'playing' | 'gameover'>('autoplay');
  const [isMobile, setIsMobile] = useState(false);
  const [userJoined, setUserJoined] = useState(false);

  // Responsive canvas size
  const [canvasSize, setCanvasSize] = useState({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  });

  useEffect(() => {
    function handleResize() {
      const w = Math.min(window.innerWidth - 32, GAME_WIDTH);
      setCanvasSize({ width: w, height: (w / GAME_WIDTH) * GAME_HEIGHT });
      setIsMobile(window.innerWidth < 600);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setHighScore(Number(localStorage.getItem("flappy_highscore") || 0));
  }, []);

  useEffect(() => {
    if (gameState === "autoplay" || gameState === "playing") {
      runGame(gameState === "autoplay");
    }
    // eslint-disable-next-line
  }, [gameState, canvasSize]);

  function runGame(isAuto: boolean) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    let birdY = canvasSize.height / 2 - BIRD_SIZE / 2;
    let birdV = 0;
    let pipes: { x: number; y: number; label: string }[] = [
      { x: canvasSize.width + 100, y: getRandomPipeY(), label: PROBLEM_LABELS[Math.floor(Math.random() * PROBLEM_LABELS.length)] },
      { x: canvasSize.width + 100 + (canvasSize.width / 2), y: getRandomPipeY(), label: PROBLEM_LABELS[Math.floor(Math.random() * PROBLEM_LABELS.length)] },
    ];
    let frame = 0;
    let currentScore = 0;
    let animation: number;
    let gameOver = false;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      // Background
      ctx.fillStyle = THEME.bg;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      // Pipes (problems)
      pipes.forEach((pipe, i) => {
        ctx.fillStyle = THEME.pipe;
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.y);
        ctx.fillRect(pipe.x, pipe.y + PIPE_GAP, PIPE_WIDTH, canvasSize.height - pipe.y - PIPE_GAP);
        // Label
        ctx.save();
        ctx.fillStyle = THEME.label;
        ctx.font = `bold ${Math.floor(canvasSize.height / 22)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.globalAlpha = 0.85;
        ctx.fillText(pipe.label, pipe.x + PIPE_WIDTH / 2, pipe.y - 6);
        ctx.globalAlpha = 1;
        ctx.restore();
      });
      // L Ball (LinkShield)
      ctx.save();
      ctx.translate(canvasSize.width / 4 + BIRD_SIZE / 2, birdY + BIRD_SIZE / 2);
      ctx.rotate(Math.min(birdV / 10, 0.5));
      ctx.fillStyle = THEME.lBall;
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_SIZE / 2, 0, 2 * Math.PI);
      ctx.fill();
      // Draw 'L'
      ctx.font = `bold ${Math.floor(BIRD_SIZE * 0.7)}px Arial`;
      ctx.fillStyle = THEME.lText;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("L", 0, 2);
      ctx.restore();
      // Score
      ctx.fillStyle = THEME.score;
      ctx.font = `bold ${Math.floor(canvasSize.height / 12)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(currentScore.toString(), canvasSize.width / 2, 40);
    }

    function update() {
      frame++;
      birdV += GRAVITY;
      birdY += birdV;
      // Move pipes
      pipes.forEach((pipe) => (pipe.x -= GAME_SPEED));
      // Add new pipe
      if (pipes[0].x < -PIPE_WIDTH) {
        pipes.shift();
        pipes.push({ x: canvasSize.width, y: getRandomPipeY(), label: PROBLEM_LABELS[Math.floor(Math.random() * PROBLEM_LABELS.length)] });
        currentScore++;
        setScore(currentScore);
      }
      // Collision
      for (const pipe of pipes) {
        if (
          canvasSize.width / 4 + BIRD_SIZE > pipe.x &&
          canvasSize.width / 4 < pipe.x + PIPE_WIDTH
        ) {
          if (
            birdY < pipe.y ||
            birdY + BIRD_SIZE > pipe.y + PIPE_GAP
          ) {
            gameOver = true;
          }
        }
      }
      // Ground/ceiling
      if (birdY < 0 || birdY + BIRD_SIZE > canvasSize.height) {
        gameOver = true;
      }
    }

    function autoFlap() {
      // Predict next pipe
      const nextPipe = pipes.find(
        (pipe) => pipe.x + PIPE_WIDTH > canvasSize.width / 4 - 5
      );
      if (!nextPipe) return false;
      // Calculate the center of the gap
      const gapCenter = nextPipe.y + PIPE_GAP / 2 - BIRD_SIZE / 2;
      // If the bird is below the center, flap
      // Add a small margin to avoid jitter
      if (birdY > gapCenter + 6 && birdV > -2) {
        return true;
      }
      return false;
    }

    function loop() {
      if (gameOver) {
        setGameState("gameover");
        setHighScore((prev) => {
          const newHigh = Math.max(prev, currentScore);
          localStorage.setItem("flappy_highscore", newHigh.toString());
          return newHigh;
        });
        cancelAnimationFrame(animation);
        return;
      }
      // Auto-flap logic (smarter)
      if (isAuto && !userJoined) {
        if (autoFlap()) {
          birdV = FLAP;
        }
      }
      update();
      draw();
      animation = requestAnimationFrame(loop);
    }

    function flap() {
      birdV = FLAP;
    }

    // Controls
    function onKey(e: KeyboardEvent) {
      if ((e.code === "Space" || e.code === "ArrowUp") && (gameState === "autoplay" || gameState === "playing")) {
        e.preventDefault(); // Prevent scroll
        setUserJoined(true);
        setGameState("playing");
        flap();
      }
    }
    function onTouchOrClick(e?: Event) {
      if (e) e.preventDefault();
      setUserJoined(true);
      setGameState("playing");
      flap();
    }
    window.addEventListener("keydown", onKey, { passive: false });
    canvasRef.current?.addEventListener("touchstart", onTouchOrClick, { passive: false });
    canvasRef.current?.addEventListener("mousedown", onTouchOrClick, { passive: false });

    draw();
    animation = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", onKey);
      canvasRef.current?.removeEventListener("touchstart", onTouchOrClick);
      canvasRef.current?.removeEventListener("mousedown", onTouchOrClick);
      cancelAnimationFrame(animation);
    };
  }

  function handleRestart() {
    setScore(0);
    setUserJoined(false);
    setGameState("autoplay");
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="text-base font-semibold text-slate-700 mb-1">Help LinkShield Solve Problems!</div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="rounded-lg border bg-white shadow-md max-w-full h-auto"
        style={{ touchAction: "manipulation", background: THEME.bg }}
      />
      <div className="w-full flex flex-col items-center mt-2">
        {gameState === "gameover" && (
          <div className="flex flex-col items-center gap-2">
            <div className="text-lg font-bold text-red-600">Problem Unsolved!</div>
            <div className="text-gray-700">Score: <b>{score}</b></div>
            <div className="text-gray-700">High Score: <b>{highScore}</b></div>
            <button
              className="px-4 py-2 rounded bg-gradient-to-r from-slate-400 to-slate-500 text-white font-bold shadow hover:from-slate-500 hover:to-slate-600 transition"
              onClick={handleRestart}
            >
              Try Again
            </button>
          </div>
        )}
        {(gameState === "autoplay" || gameState === "playing") && (
          <div className="text-gray-700">Score: <b>{score}</b> &nbsp;|&nbsp; High Score: <b>{highScore}</b></div>
        )}
        <div className="text-xs text-gray-400 mt-1">{userJoined ? "Tap, click, space, or up arrow to help LinkShield!" : "Auto-solving mode. Tap, click, space, or up arrow to join!"}</div>
      </div>
    </div>
  );
};

export default FlappyLinkShield; 