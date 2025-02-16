const Game24 = () => {
  const [gamePhase, setGamePhase] = React.useState('splash');
  const [playerName, setPlayerName] = React.useState('');
  const [level, setLevel] = React.useState(1);
  const [unlockedLevels, setUnlockedLevels] = React.useState([1]);
  const [highScores, setHighScores] = React.useState(() => {
    const saved = localStorage.getItem('24game_highscores');
    return saved ? JSON.parse(saved) : [];
  });

  // Splash Screen Component
  const SplashScreen = () => {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-8">
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
            className="w-48 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mx-auto flex items-center justify-center gap-2"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  };

  // Name Input Component
  const NameInput = () => {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
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
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Level Selection Component
  const LevelSelection = () => {
    const levels = [
      { number: 1, title: "Basics", description: "Simple operations with 2 numbers" },
      { number: 2, title: "Advanced", description: "Complex operations with 3 numbers" },
      { number: 3, title: "Expert", description: "Master level with 4 numbers" }
    ];

    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Select Level</h2>
            <div className="grid gap-4">
              {levels.map((levelData) => (
                <button
                  key={levelData.number}
                  onClick={() => {
                    if (unlockedLevels.includes(levelData.number)) {
                      setLevel(levelData.number);
                      setGamePhase('playing');
                    }
                  }}
                  disabled={!unlockedLevels.includes(levelData.number)}
                  className={`
                    p-4 rounded-lg border-2 text-left relative
                    ${unlockedLevels.includes(levelData.number)
                      ? 'border-blue-500 hover:bg-blue-50'
                      : 'border-gray-300 opacity-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Level {levelData.number}: {levelData.title}</h3>
                      <p className="text-gray-600">{levelData.description}</p>
                    </div>
                    <div className={`text-${unlockedLevels.includes(levelData.number) ? 'blue' : 'gray'}-500`}>
                      {unlockedLevels.includes(levelData.number) ? '✓' : '🔒'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Game Board Component
  const GameBoard = () => {
    const [timeElapsed, setTimeElapsed] = React.useState(0);
    const [startTime, setStartTime] = React.useState(Date.now());
    const [cards, setCards] = React.useState([]);
    const [selectedCards, setSelectedCards] = React.useState([]);
    const [solvedCount, setSolvedCount] = React.useState(0);
    const [wrongCount, setWrongCount] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(true);

    React.useEffect(() => {
      generateCards();
      const timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const generateCards = () => {
      const numbers = [];
      for (let i = 0; i < (level + 1); i++) {
        numbers.push(Math.floor(Math.random() * 9) + 1);
      }
      setCards(numbers);
    };

    const handleCardClick = (index) => {
      if (selectedCards.includes(index)) {
        setSelectedCards(selectedCards.filter(i => i !== index));
      } else if (selectedCards.length < 2) {
        setSelectedCards([...selectedCards, index]);
      }
    };

    const handleOperation = (op) => {
      if (selectedCards.length !== 2) return;
      
      const num1 = cards[selectedCards[0]];
      const num2 = cards[selectedCards[1]];
      let result;

      switch (op) {
        case '+': result = num1 + num2; break;
        case '-': result = Math.abs(num1 - num2); break;
        case '×': result = num1 * num2; break;
        case '÷': 
          if (num2 === 0) return;
          result = num1 / num2;
          break;
        default: return;
      }

      const newCards = cards.filter((_, i) => !selectedCards.includes(i));
      newCards.push(result);
      setCards(newCards);
      setSelectedCards([]);

      if (newCards.length === 1 && Math.abs(newCards[0] - 24) < 0.001) {
        setSolvedCount(solvedCount + 1);
        if (solvedCount + 1 >= 5) {
          if (level < 3) {
            setUnlockedLevels([...unlockedLevels, level + 1]);
          }
          setGamePhase('levels');
        } else {
          generateCards();
        }
      }
    };

    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div className="flex justify-between">
              <div>Level: {level}</div>
              <div>Time: {timeElapsed}s</div>
              <div>Solved: {solvedCount}/5</div>
            </div>
            <div className="flex justify-center gap-4">
              {cards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => handleCardClick(index)}
                  className={`w-16 h-24 text-2xl font-bold rounded-lg shadow
                    ${selectedCards.includes(index) ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border border-gray-200'}`}
                >
                  {card}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              {['+', '-', '×', '÷'].map(op => (
                <button
                  key={op}
                  onClick={() => handleOperation(op)}
                  className="w-12 h-12 text-xl font-bold bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  {op}
                </button>
              ))}
            </div>
            <button
              onClick={() => setGamePhase('levels')}
              className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              End Game
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      {gamePhase === 'splash' && <SplashScreen />}
      {gamePhase === 'name' && <NameInput />}
      {gamePhase === 'levels' && <LevelSelection />}
      {gamePhase === 'playing' && <GameBoard />}
    </div>
  );
};

export default Game24;
