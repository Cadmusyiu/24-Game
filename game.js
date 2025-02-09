import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Play, X, RotateCcw, Star } from 'lucide-react';

export default function Game24() {
  const [gamePhase, setGamePhase] = useState('name');
  const [playerName, setPlayerName] = useState('');
  const [level, setLevel] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [solvedCount, setSolvedCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const levelConfig = {
    1: { cardCount: 2, targetQuestions: 24, timeLimit: 60 },
    2: { cardCount: 3, targetQuestions: 24, timeLimit: 240 },
    3: { cardCount: 4, targetQuestions: 24, timeLimit: null }
  };

  useEffect(() => {
    let timer;
    if (gamePhase === 'playing' && startTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeElapsed(elapsed);
        
        const currentLimit = levelConfig[level].timeLimit;
        if (currentLimit && elapsed >= currentLimit) {
          setGamePhase('finished');
        }
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gamePhase, startTime, level]);

  const canMake24 = (numbers) => {
    if (numbers.length === 1) {
      return Math.abs(numbers[0] - 24) < 0.0001;
    }

    for (let i = 0; i < numbers.length; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        const a = numbers[i];
        const b = numbers[j];
        const remainingNumbers = numbers.filter((_, index) => index !== i && index !== j);

        // Try all operations
        const results = [
          a + b,
          Math.abs(a - b),
          a * b,
          b !== 0 ? Math.max(a, b) / Math.min(a, b) : null
        ].filter(x => x !== null);

        for (const result of results) {
          if (remainingNumbers.length === 0 && Math.abs(result - 24) < 0.0001) {
            return true;
          }
          if (remainingNumbers.length > 0 && canMake24([...remainingNumbers, result])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const generateCards = () => {
    const currentConfig = levelConfig[level];
    let newCards;
    let attempts = 0;
    
    // Known solvable combinations for each level
    const knownCombinations = {
      1: [
        [3, 8],     // 3 × 8 = 24
        [4, 6],     // 4 × 6 = 24
        [12, 2],    // 12 × 2 = 24
        [24, 1],    // 24 × 1 = 24
        [32, 8],    // 32 - 8 = 24
        [16, 8],    // 16 + 8 = 24
      ],
      2: [
        [2, 3, 4],  // 2 × 3 × 4 = 24
        [1, 4, 6],  // (1 + 4) × 6 = 24
        [2, 6, 6],  // (6 + 6) × 2 = 24
        [3, 3, 8],  // 3 × 8 = 24
      ],
      3: [
        [1, 2, 3, 4], // (1 + 3) × (2 × 4) = 24
        [2, 2, 2, 6], // 2 × 2 × 2 × 6 = 24
        [1, 1, 4, 6], // (1 + 1) × 4 × 6 = 24
        [2, 3, 4, 4], // 2 × 3 × 4 = 24
      ]
    };
    
    // First try to generate a random solvable combination
    do {
      newCards = [];
      while (newCards.length < currentConfig.cardCount) {
        const maxNum = level === 1 ? 32 : 9;
        const num = Math.floor(Math.random() * maxNum) + 1;
        if (!newCards.includes(num)) {
          newCards.push(num);
        }
      }
      attempts++;
    } while (!canMake24(newCards) && attempts < 20);

    // If we couldn't find a random solvable combination, use a known one
    if (!canMake24(newCards)) {
      const combinations = knownCombinations[level];
      newCards = combinations[Math.floor(Math.random() * combinations.length)];
    }

    setCards(newCards);
    setSelectedCards([]);
  };

  const startGame = () => {
    setGamePhase('playing');
    setSolvedCount(0);
    setWrongCount(0);
    setTimeElapsed(0);
    setStartTime(Date.now());
    generateCards();
  };

  const handleCardClick = (index) => {
    if (gamePhase === 'playing' && level !== 1) {
      if (selectedCards.includes(index)) {
        setSelectedCards(prev => prev.filter(i => i !== index));
      } else if (selectedCards.length < 2) {
        setSelectedCards(prev => [...prev, index]);
      }
    }
  };

  const handleOperation = (operation) => {
    if (level === 1) {
      // Level 1 logic
      const [num1, num2] = cards;
      let result;

      switch (operation) {
        case '+': result = num1 + num2; break;
        case '-': result = Math.abs(num1 - num2); break;
        case '×': result = num1 * num2; break;
        case '÷': result = Math.max(num1, num2) / Math.min(num1, num2); break;
        default: return;
      }

      if (Math.abs(result - 24) < 0.0001) {
        handleSuccess();
      } else {
        handleWrong();
      }
    } else {
      // Level 2 and 3 logic
      if (selectedCards.length !== 2) return;

      let num1 = cards[selectedCards[0]];
      let num2 = cards[selectedCards[1]];
      
      if (operation === '÷') {
        if (num1 < num2) [num1, num2] = [num2, num1];
        if (num2 === 0) return;
      }

      let result;
      switch (operation) {
        case '+': result = num1 + num2; break;
        case '-': result = Math.abs(num1 - num2); break;
        case '×': result = num1 * num2; break;
        case '÷': result = num1 / num2; break;
        default: return;
      }

      const newCards = [...cards];
      newCards[selectedCards[0]] = result;
      newCards.splice(selectedCards[1], 1);
      setCards(newCards);
      setSelectedCards([]);

      if (newCards.length === 1) {
        if (Math.abs(newCards[0] - 24) < 0.0001) {
          handleSuccess();
        } else {
          handleWrong();
        }
      }
    }
  };

  // Update handleSuccess function
  const handleSuccess = () => {
    const newSolvedCount = solvedCount + 1;
    setSolvedCount(newSolvedCount);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1000);

    if (newSolvedCount === levelConfig[level].targetQuestions) {
      const timeToComplete = Math.floor((Date.now() - startTime) / 1000);
      // Update level times
      setLevelTimes(prev => ({
        ...prev,
        [`level${level}`]: timeToComplete
      }));

      if (level === 3) {
        // If completed level 3, save score and show rankings
        const totalTime = timeToComplete + levelTimes.level1 + levelTimes.level2;
        const newScore = {
          name: playerName,
          level1Time: levelTimes.level1,
          level2Time: levelTimes.level2,
          level3Time: timeToComplete,
          totalTime: totalTime,
          date: new Date().toISOString()
        };

        setHighScores(prev => {
          const newHighScores = [...prev, newScore]
            .sort((a, b) => a.totalTime - b.totalTime)
            .slice(0, 10);
          localStorage.setItem('24game_highscores', JSON.stringify(newHighScores));
          return newHighScores;
        });

        setGamePhase('ranking');
      } else if (timeToComplete <= levelConfig[level].timeLimit) {
        setGamePhase('promoted');
      } else {
        setGamePhase('finished');
      }
    } else {
      generateCards();
    }
  };

  const handleWrong = () => {
    setWrongCount(prev => prev + 1);
    generateCards();
  };

  // Add state for high scores
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('24game_highscores');
    return saved ? JSON.parse(saved) : [];
  });

  // Save score function
  const saveScore = () => {
    const newScore = {
      name: playerName,
      level1Time: levelTimes.level1 || 0,
      level2Time: levelTimes.level2 || 0,
      level3Time: levelTimes.level3 || 0,
      totalTime: levelTimes.level1 + levelTimes.level2 + levelTimes.level3,
      date: new Date().toISOString()
    };

    const newHighScores = [...highScores, newScore]
      .sort((a, b) => a.totalTime - b.totalTime)
      .slice(0, 10); // Keep top 10

    setHighScores(newHighScores);
    localStorage.setItem('24game_highscores', JSON.stringify(newHighScores));
  };

  // Add state for level completion times
  const [levelTimes, setLevelTimes] = useState({
    level1: 0,
    level2: 0,
    level3: 0
  });

  // Update handlePromotion to save level time
  const handlePromotion = () => {
    setLevelTimes(prev => ({
      ...prev,
      [`level${level}`]: timeElapsed
    }));
    
    if (level === 3) {
      saveScore();
      setGamePhase('ranking');
    } else {
      setLevel(prev => prev + 1);
      setGamePhase('ready');
      generateCards();
    }
  };

  if (gamePhase === 'name') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center">Welcome to 24!</h2>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2 border rounded"
            />
            <button
              onClick={() => {
                if (playerName.trim()) {
                  setGamePhase('ready');
                  generateCards();
                }
              }}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Continue
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2">
              <Star className="text-yellow-500" size={24} />
              <h2 className="text-xl font-bold">Level {level}</h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-500">Time</div>
              <div className="text-lg font-bold">{timeElapsed}s</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Solved</div>
              <div className="text-lg font-bold">{solvedCount}/24</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Wrong</div>
              <div className="text-lg font-bold">{wrongCount}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Target</div>
              <div className="text-lg font-bold">{levelConfig[level].timeLimit || '∞'}s</div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            {cards.map((card, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                disabled={gamePhase !== 'playing' || level === 1}
                className={`
                  w-16 h-24 bg-white border-2 rounded-lg shadow
                  transition-all duration-300 ease-in-out
                  ${selectedCards.includes(index) ? 'border-blue-500 -translate-y-2' : 'border-gray-300'}
                  ${(gamePhase !== 'playing' || level === 1) ? 'opacity-50' : 'hover:scale-105'}
                `}
              >
                <div className="text-2xl font-bold">{card}</div>
                {selectedCards.includes(index) && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {selectedCards.indexOf(index) + 1}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            {['+', '-', '×', '÷'].map((op) => (
              <button
                key={op}
                onClick={() => handleOperation(op)}
                disabled={gamePhase !== 'playing' || (level !== 1 && selectedCards.length !== 2)}
                className="w-12 h-12 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
              >
                <div className="text-xl font-bold">{op}</div>
              </button>
            ))}
          </div>

          {gamePhase === 'ready' && (
            <button
              onClick={startGame}
              className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <Play size={20} /> Start Level {level}
            </button>
          )}

          {gamePhase === 'playing' && (
            <div className="flex gap-4">
              <button
                onClick={generateCards}
                className="flex-1 p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Pass
              </button>
              <button
                onClick={() => setGamePhase('finished')}
                className="flex-1 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                End Game
              </button>
            </div>
          )}

          {gamePhase === 'promoted' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <h3 className="text-xl font-bold text-green-800">Level Complete!</h3>
                <p>Time: {timeElapsed}s | Solved: {solvedCount}</p>
              </div>
              <button
                onClick={handlePromotion}
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Next Level
              </button>
            </div>
          )}

          {showSuccess && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-green-500 text-white px-8 py-4 rounded-lg text-2xl font-bold animate-bounce">
                Perfect!
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
