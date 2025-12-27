import { useState, useEffect } from "react";
import "./App.css";
import { Play, Settings } from "lucide-react";

type GameState = "SETUP" | "PLAYING" | "FINISHED";

const DEFAULT_WORDS =
  "Szampan, Fajerwerki, Sylwester, Postanowienie, Kac, Konfetti, Północ, Polsat, Sałatka jarzynowa, Kevin sam w domu";

function App() {
  const [gameState, setGameState] = useState<GameState>("SETUP");
  const [score, setScore] = useState(0);

  const [wordsInput, setWordsInput] = useState(DEFAULT_WORDS);
  const [timeLimit, setTimeLimit] = useState(60);

  const [wordsPool, setWordsPool] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const parseWords = (input: string) => {
    return input
      .split(",")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
  };

  const startGame = () => {
    const parsedWords = parseWords(wordsInput);
    if (parsedWords.length === 0) {
      alert("Wpisz przynajmniej jedno hasło!");
      return;
    }
    setScore(0);
    setWordsPool(parsedWords);
    setGameState("PLAYING");
    nextRound(parsedWords);
  };

  const handleCorrectGuess = () => {
    setScore((prev) => prev + 1);
    nextRound();
  };

  const nextRound = (currentPool: string[] = wordsPool) => {
    if (currentPool.length === 0) {
      setGameState("FINISHED");
      setIsActive(false);
      return;
    }

    const randomIndex = Math.floor(Math.random() * currentPool.length);
    const word = currentPool[randomIndex];

    const newPool = currentPool.filter((_, index) => index !== randomIndex);

    setWordsPool(newPool);
    setCurrentWord(word);

    setTimeLeft(timeLimit);
    setIsActive(true);
  };

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsActive(false);
    }
  }, [timeLeft, isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="app-container">
      {gameState === "SETUP" && (
        <div className="card">
          <h1>Sketchy</h1>
          <p className="subtitle"></p>

          <div className="input-group">
            <label>Words list (split by comma):</label>
            <textarea
              value={wordsInput}
              onChange={(e) => setWordsInput(e.target.value)}
              rows={6}
            />
          </div>

          <div className="input-group">
            <label>Time to guess the word (in seconds):</label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            />
          </div>

          <button className="btn-primary" onClick={startGame}>
            <Play size={20} /> Start
          </button>
        </div>
      )}

      {gameState === "PLAYING" && (
        <div className={`card game-card ${timeLeft === 0 ? "time-up" : ""}`}>
          <div className="stats-header">
            <div className="stat-item">
              <span className="stat-label">SCORE</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">TIME</span>
              <span className="stat-value">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="word-display">
            {timeLeft === 0 ? (
              <span className="text-fail">TIME'S UP!</span>
            ) : (
              <span>{currentWord}</span>
            )}
          </div>

          <div className="controls">
            {timeLeft === 0 ? (
              <button className="btn-primary" onClick={() => nextRound()}>
                Next Word <Play size={20} />
              </button>
            ) : (
              <>
                <button className="btn-success" onClick={handleCorrectGuess}>
                  Guessed! +1
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setIsActive(!isActive)}
                >
                  {isActive ? "Pause" : "Resume"}
                </button>
              </>
            )}
          </div>

          <div className="pool-info">Words left: {wordsPool.length}</div>

          <button className="btn-text" onClick={() => setGameState("SETUP")}>
            <Settings size={16} /> Quit to Setup
          </button>
        </div>
      )}

      {gameState === "FINISHED" && (
        <div className="card">
          <h1>Game Over! 🎉</h1>
          <p>Final Score:</p>
          <div className="final-score">{score}</div>
          <button className="btn-primary" onClick={() => setGameState("SETUP")}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
