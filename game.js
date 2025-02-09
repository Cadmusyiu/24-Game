// Create the game component
function Game24() {
  const [gamePhase, setGamePhase] = React.useState('name');
  const [playerName, setPlayerName] = React.useState('');
  const [level, setLevel] = React.useState(1);
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  const [startTime, setStartTime] = React.useState(null);
  const [cards, setCards] = React.useState([]);
  const [selectedCards, setSelectedCards] = React.useState([]);
  const [solvedCount, setSolvedCount] = React.useState(0);
  const [wrongCount, setWrongCount] = React.useState(0);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [levelTimes, setLevelTimes] = React.useState({
    level1: 0,
    level2: 0,
    level3: 0
  });

  const levelConfig = {
    1: { cardCount: 2, targetQuestions: 24, timeLimit: 60 },
    2: { cardCount: 3, targetQuestions: 24, timeLimit: 240 },
    3: { cardCount: 4, targetQuestions: 24, timeLimit: null }
  };

  // Timer effect
  React.useEffect(() => {
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

  function generateCards() {
    const currentConfig = levelConfig[level];
    let newCards = [];
    
    while (newCards.length < currentConfig.cardCount) {
      // Adjust number range to make 24 more achievable
      const maxNum = level === 1 ? 12 : 9;
      const num = Math.floor(Math.random() * maxNum) + 1;
      if (!newCards.includes(num)) {
        newCards.push(num);
      }
    }

    setCards(newCards);
    setSelectedCards([]);
  }

  function handleCardClick(index) {
    if (gamePhase === 'playing' && level !== 1) {
      if (selectedCards.includes(index)) {
        setSelectedCards(prev => prev.filter(i => i !== index));
      } else if (selectedCards.length < 2) {
        setSelectedCards(prev => [...prev, index]);
      }
    }
  }

  function calculateResult(num1, num2, operation) {
    switch (operation) {
      case '+': return num1 + num2;
      case '-': return Math.abs(num1 - num2);
      case '×': return num1 * num2;
      case '÷': 
        // Ensure division is safe and meaningful
        return num1 >= num2 && num2 !== 0 ? num1 / num2 : null;
      default: return null;
    }
  }

  function isCloseToTwentyFour(num) {
    return Math.abs(num - 24) < 0.0001;
  }

  function handleOperation(operation) {
    if (level === 1) {
      // Level 1 logic
      const [num1, num2] = cards;
      const result = calculateResult(num1, num2, operation);

      if (result !== null && isCloseToTwentyFour(result)) {
        handleSuccess();
      } else {
        handleWrong();
      }
    } else {
      // Level 2 and 3 logic
      if (selectedCards.length !== 2) return;

      let num1 = cards[selectedCards[0]];
      let num2 = cards[selectedCards[1]];

      const result = calculateResult(num1, num2, operation);
      if (result === null) return;

      const newCards = [...cards];
      newCards[selectedCards[0]] = result;
      newCards.splice(selectedCards[1], 1);
      setCards(newCards);
      setSelectedCards([]);

      if (newCards.length === 1) {
        if (isCloseToTwentyFour(newCards[0])) {
          handleSuccess();
        } else {
          handleWrong();
        }
      }
    }
  }

  function handleSuccess() {
    const newSolvedCount = solvedCount + 1;
    setSolvedCount(newSolvedCount);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1000);

    if (newSolvedCount === levelConfig[level].targetQuestions) {
      const timeToComplete = Math.floor((Date.now() - startTime) / 1000);
      setLevelTimes(prev => ({
        ...prev,
        [`level${level}`]: timeToComplete
      }));

      if (level === 3) {
        setGamePhase('ranking');
      } else if (timeToComplete <= levelConfig[level].timeLimit) {
        setGamePhase('promoted');
      } else {
        setGamePhase('finished');
      }
    } else {
      generateCards();
    }
  }

  function handleWrong() {
    setWrongCount(prev => prev + 1);
    generateCards();
  }

  function startGame() {
    setGamePhase('playing');
    setSolvedCount(0);
    setWrongCount(0);
    setTimeElapsed(0);
    setStartTime(Date.now());
    generateCards();
  }

  function handlePromotion() {
    setLevel(prev => prev + 1);
    setGamePhase('ready');
    generateCards();
  }

  if (gamePhase === 'name') {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
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
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <svg
              className="text-yellow-500 w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
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

        <div className="flex justify-center space-x-2 sm:space-x-4">
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              disabled={gamePhase !== 'playing' || level === 1}
              className={`
                w-20 h-32 sm:w-16 sm:h-24
                bg-white border-4 sm:border-2 rounded-xl sm:rounded-lg shadow-lg
                transition-all duration-300 ease-in-out
                active:scale-95 touch-manipulation
                ${selectedCards.includes(index) 
                  ? 'border-blue-500 -translate-y-2' 
                  : 'border-gray-300 hover:border-blue-300'}
                ${(gamePhase !== 'playing' || level === 1) 
                  ? 'opacity-50' 
                  : 'hover:scale-105'}
                relative overflow-hidden
              `}
            >
              <div className="text-4xl sm:text-2xl font-bold">
                {card}
              </div>
              {selectedCards.includes(index) && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full w-8 h-8 sm:w-5 sm:h-5 flex items-center justify-center text-lg sm:text-xs">
                  {selectedCards.indexOf(index) + 1}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-center space-x-3 sm:space-x-4">
          {['+', '-', '×', '÷'].map((op) => (
            <button
              key={op}
              onClick={() => handleOperation(op)}
              disabled={gamePhase !== 'playing' || (level !== 1 && selectedCards.length !== 2)}
              className={`
                w-16 h-16 sm:w-12 sm:h-12 
                bg-gray-200 rounded-full
                shadow-md active:shadow-sm
                transition-all duration-150
                active:scale-95 touch-manipulation
                ${gamePhase === 'playing' && (level === 1 || selectedCards.length === 2) 
                  ? 'hover:bg-gray-300' 
                  : 'opacity-50 cursor-not-allowed'}
              `}
            >
              <div className="text-2xl sm:text-xl font-bold">{op}</div>
            </button>
          ))}
        </div>

        {gamePhase === 'ready' && (
          <button
            onClick={startGame}
            className="w-full p-4 sm:p-3 text-lg sm:text-base bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 touch-manipulation"
          >
            Start Level {level}
          </button>
        )}

        {gamePhase === 'playing' && (
          <div className="flex gap-4">
            <button
              onClick={generateCards}
              className="flex-1 p-4 sm:p-3 text-lg sm:text-base bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 active:scale-95 touch-manipulation"
            >
              Pass
            </button>
            <button
              onClick={() => setGamePhase('finished')}
              className="flex-1 p-4 sm:p-3 text-lg sm:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 touch-manipulation"
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
              className="w-full p-4 sm:p-3 text-lg sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 touch-manipulation"
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
    </div>
  );
}

// Mount the React component
ReactDOM.render(<Game24 />, document.getElementById('root'));
