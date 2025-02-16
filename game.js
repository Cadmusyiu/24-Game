import React, { useState, useEffect } from 'react';
import { Play, Lock, Trophy, ArrowRight, Star, RotateCcw } from 'lucide-react';

function generateNumbers(level) {
  // Different number generation logic for each level
  switch(level) {
    case 1:
      return [
        Math.floor(Math.random() * 9) + 1,
        Math.floor(Math.random() * 9) + 1,
        Math.floor(Math.random() * 9) + 1,
        Math.floor(Math.random() * 9) + 1
      ];
    case 2:
      return [
        Math.floor(Math.random() * 12) + 1,
        Math.floor(Math.random() * 12) + 1,
        Math.floor(Math.random() * 12) + 1,
        Math.floor(Math.random() * 12) + 1
      ];
    case 3:
      return [
        Math.floor(Math.random() * 15) + 1,
        Math.floor(Math.random() * 15) + 1,
        Math.floor(Math.random() * 15) + 1,
        Math.floor(Math.random() * 15) + 1
      ];
    default:
      return [1, 2, 3, 4];
  }
}

function evaluateExpression(nums, ops) {
  // Implement expression evaluation with all possible combinations
  const permutations = [
    `(${nums[0]} ${ops[0]} ${nums[1]}) ${ops[1]} (${nums[2]} ${ops[2]} ${nums[3]})`,
    `((${nums[0]} ${ops[0]} ${nums[1]}) ${ops[1]} ${nums[2]}) ${ops[2]} ${nums[3]}`,
    `${nums[0]} ${ops[0]} ((${nums[1]} ${ops[1]} ${nums[2]}) ${ops[2]} ${nums[3]})`,
    `(${nums[0]} ${ops[0]} (${nums[1]} ${ops[1]} ${nums[2]})) ${ops[2]} ${nums[3]}`,
    `${nums[0]} ${ops[0]} (${nums[1]} ${ops[1]} (${nums[2]} ${ops[2]} ${nums[3]}))`,
  ];

  for (const expr of permutations) {
    try {
      const result = eval(expr.replace(/×/g, '*').replace(/÷/g, '/'));
      if (Math.abs(result - 24) < 0.0001) return true;
    } catch {
      // Invalid expression, continue
    }
  }
  return false;
}

function Game24() {
  const [gamePhase, setGamePhase] = useState('splash');
  const [playerName, setPlayerName] = useState('');
  const [level, setLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('24game_highscores');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (completedLevels.length === 3) {
      const newScore = {
        name: playerName,
        score: totalTime,
        date: new Date().toISOString(),
      };
      const newHighScores = [...highScores, newScore]
        .sort((a, b) => a.score - b.score)
        .slice(0, 10);
      setHighScores(newHighScores);
      localStorage.setItem('24game_highscores', JSON.stringify(newHighScores));
      setGamePhase('ranking');
    }
  }, [completedLevels, totalTime, playerName, highScores]);

  const GameBoard = () => {
    const [numbers, setNumbers] = useState(generateNumbers(level));
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [operators, setOperators] = useState([]);
    const [timer, setTimer] = useState(0);
    const [gameStatus, setGameStatus] = useState('playing');
    const availableOperators = ['×', '÷', '+', '-'];

    // Timer logic
    useEffect(() => {
      const intervalId = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }, []);

    const handleNumberSelect = (num, index) => {
      if (selectedNumbers.length < 4 && !selectedNumbers.includes(index)) {
        setSelectedNumbers([...selectedNumbers, index]);
      }
    };

    const handleOperatorSelect = (op) => {
      if (operators.length < 3) {
        setOperators([...operators, op]);
      }
    };

    const resetSelection = () => {
      setSelectedNumbers([]);
      setOperators([]);
    };

    const checkSolution = () => {
      if (selectedNumbers.length === 4 && operators.length === 3) {
        const selectedNums = selectedNumbers.map(idx => numbers[idx]);
        const result = evaluateExpression(selectedNums, operators);
        
        if (result) {
          setGameStatus('solved');
          setTotalTime(prev => prev + timer);
          
          // Unlock next level if applicable
          if (level < 3 && !unlockedLevels.includes(level + 1)) {
            setUnlockedLevels(prev => [...prev, level + 1]);
          }
          
          // Mark level as completed
          setCompletedLevels(prev => [...prev, level]);
          
          // Optional: Add a short delay before moving to level select
          setTimeout(() => {
            setGamePhase('levels');
          }, 1500);
        } else {
          alert('Not a valid solution for 24!');
        }
      }
    };

    return (
      <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">Level {level}</div>
          <div className="text-xl">Time: {timer}s</div>
        </div>
        
        {/* Number Selection */}
        <div className="grid grid-cols-4 gap-4">
          {numbers.map((num, index) => (
            <button
              key={index}
              onClick={() => handleNumberSelect(num, index)}
              className={`p-4 text-2xl font-bold rounded-lg ${
                selectedNumbers.includes(index) 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              disabled={selectedNumbers.includes(index)}
            >
              {num}
            </button>
          ))}
        </div>
        
        {/* Operator Selection */}
        <div className="grid grid-cols-4 gap-4">
          {availableOperators.map((op, index) => (
            <button
              key={index}
              onClick={() => handleOperatorSelect(op)}
              className={`p-4 text-2xl font-bold rounded-lg ${
                operators.length < 3 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={operators.length >= 3}
            >
              {op}
            </button>
          ))}
        </div>
        
        {/* Current Selection */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {selectedNumbers.map((idx) => (
              <span key={idx} className="text-xl font-bold">{numbers[idx]}</span>
            ))}
            {operators.map((op, idx) => (
              <span key={`op-${idx}`} className="text-xl font-bold">{op}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={resetSelection}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={checkSolution}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={selectedNumbers.length !== 4 || operators.length !== 3}
            >
              <Star size={20} />
            </button>
          </div>
        </div>
        
        {gameStatus === 'solved' && (
          <div className="text-center text-green-600 text-2xl font-bold">
            Great Job! Level Solved!
          </div>
        )}
      </div>
    );
  };

  const SplashScreen = () => (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 text-center space-y-8">
      <div className="space-y-4">
        <div className="text-6xl font-bold relative inline-block">
          <span className="text-blue-600">24</span>
          <div className="absolute -right-12 top-0 flex flex-col gap-1">
            <span className="text-2xl text-green-500">+</span>
            <span className="text-2xl text-red-500">-</span>
            <span className="text-2xl text-yellow-500">×</span>
            <span className="text-2xl text-purple-500">÷</span>
          </div>
        </div>
        <p className="text-gray-600 text-xl">The Math Challenge</p>
      </div>
      <button
        onClick={() => setGamePhase('name')}
        className="w-48 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mx-auto"
      >
        <Play size={24} />
        Start Game
      </button>
    </div>
  );

  const NameInput = () => (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Welcome to 24!</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={() => {
              if (playerName.trim()) {
                setGamePhase('levels');
              }
            }}
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <ArrowRight size={20} />
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const LevelSelect = () => (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Choose Level</h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                if (unlockedLevels.includes(lvl)) {
                  setLevel(lvl);
                  setGamePhase('game');
                }
              }}
              className={`p-6 rounded-lg flex flex-col items-center justify-center gap-2 ${
                unlockedLevels.includes(lvl)
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {unlockedLevels.includes(lvl) ? (
                <>
                  <Trophy size={24} />
                  <span className="text-xl font-bold">Level {lvl}</span>
                </>
              ) : (
                <>
                  <Lock size={24} />
                  <span className="text-xl font-bold">Locked</span>
                </>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => setGamePhase('ranking')}
          className="w-full p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          View Ranking
        </button>
      </div>
    </div>
  );

  const Ranking = () => (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">High Scores</h2>
        <div className="space-y-4">
          {highScores.length === 0 ? (
            <div className="text-center text-gray-500">No scores yet</div>
          ) : (
            highScores.map((score, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{index + 1}.</span>
                  <span>{score.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{score.score}s</span>
                  <span className="text-sm text-gray-500">{new Date(score.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => setGamePhase('levels')}
          className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Levels
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {gamePhase === 'splash' && <SplashScreen />}
      {gamePhase === 'name' && <NameInput />}
      {gamePhase === 'levels' && <LevelSelect />}
      {gamePhase === 'game' && <GameBoard />}
      {gamePhase === 'ranking' && <Ranking />}
    </div>
  );
}

export default Game24;
