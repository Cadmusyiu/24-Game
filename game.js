// Game24.js - Full Implementation
const Game24 = () => {
    const [gamePhase, setGamePhase] = React.useState('splash');
    const [playerName, setPlayerName] = React.useState('');
    const [level, setLevel] = React.useState(1);
    const [unlockedLevels, setUnlockedLevels] = React.useState([1]);
    const [timeElapsed, setTimeElapsed] = React.useState(0);
    const [startTime, setStartTime] = React.useState(null);
    const [cards, setCards] = React.useState([]);
    const [selectedCards, setSelectedCards] = React.useState([]);
    const [solvedCount, setSolvedCount] = React.useState(0);
    const [wrongCount, setWrongCount] = React.useState(0);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [highScores, setHighScores] = React.useState(() => {
        const saved = localStorage.getItem('24game_highscores');
        return saved ? JSON.parse(saved) : [];
    });

    const levelConfig = {
        1: { cardCount: 2, targetQuestions: 5, timeLimit: 60 },
        2: { cardCount: 3, targetQuestions: 5, timeLimit: 120 },
        3: { cardCount: 4, targetQuestions: 5, timeLimit: 180 }
    };

    // Game Timer Effect
    React.useEffect(() => {
        let timer;
        if (gamePhase === 'playing' && startTime) {
            timer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                setTimeElapsed(elapsed);
                
                const currentLimit = levelConfig[level].timeLimit;
                if (currentLimit && elapsed >= currentLimit) {
                    endGame();
                }
            }, 100);
        }
        return () => clearInterval(timer);
    }, [gamePhase, startTime, level]);

    // Math functions for game logic
    const canMake24 = (numbers) => {
        if (numbers.length === 1) {
            return Math.abs(numbers[0] - 24) < 0.0001;
        }

        for (let i = 0; i < numbers.length; i++) {
            for (let j = i + 1; j < numbers.length; j++) {
                const a = numbers[i];
                const b = numbers[j];
                const remainingNumbers = numbers.filter((_, index) => index !== i && index !== j);

                const results = [
                    a + b,
                    Math.abs(a - b),
                    a * b,
                    b !== 0 ? a / b : null,
                    a !== 0 ? b / a : null
                ].filter(x => x !== null);

                for (const result of results) {
                    if (canMake24([...remainingNumbers, result])) {
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
        
        // Known solvable combinations
        const knownCombinations = {
            1: [[3, 8], [4, 6], [12, 2], [24, 1], [32, 8], [16, 8]],
            2: [[2, 3, 4], [1, 4, 6], [2, 6, 6], [3, 3, 8]],
            3: [[1, 2, 3, 4], [2, 2, 2, 6], [1, 1, 4, 6], [2, 3, 4, 4]]
        };
        
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

        if (!canMake24(newCards)) {
            const combinations = knownCombinations[level];
            newCards = combinations[Math.floor(Math.random() * combinations.length)];
        }

        setCards(newCards);
        setSelectedCards([]);
    };

    const startGame = () => {
        setSolvedCount(0);
        setWrongCount(0);
        setTimeElapsed(0);
        setStartTime(Date.now());
        generateCards();
    };

    const endGame = () => {
        const finalTime = Math.floor((Date.now() - startTime) / 1000);
        if (solvedCount >= levelConfig[level].targetQuestions) {
            if (level < 3) {
                setUnlockedLevels(prev => [...new Set([...prev, level + 1])]);
            }
            // Save score
            const newScore = {
                name: playerName,
                level,
                solvedCount,
                time: finalTime,
                date: new Date().toISOString()
            };
            setHighScores(prev => {
                const newScores = [...prev, newScore]
                    .sort((a, b) => b.solvedCount - a.solvedCount || a.time - b.time)
                    .slice(0, 10);
                localStorage.setItem('24game_highscores', JSON.stringify(newScores));
                return newScores;
            });
        }
        setGamePhase('levels');
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
            const [num1, num2] = cards;
            let result;

            switch (operation) {
                case '+': result = num1 + num2; break;
                case '-': result = Math.abs(num1 - num2); break;
                case '×': result = num1 * num2; break;
                case '÷':
                    result = Math.max(num1, num2) / Math.min(num1, num2);
                    break;
                default: return;
            }

            if (Math.abs(result - 24) < 0.0001) {
                handleSuccess();
            } else {
                handleWrong();
            }
        } else {
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

    const handleSuccess = () => {
        setSolvedCount(prev => prev + 1);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1000);
        generateCards();
    };

    const handleWrong = () => {
        setWrongCount(prev => prev + 1);
        generateCards();
    };

    // Component for the splash screen
    const SplashScreen = () => (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl font-bold relative inline-block">
                <span className="text-blue-600">24</span>
                <div className="absolute -right-12 top-0 flex flex-col gap-1">
                    <span className="text-2xl text-green-500">+</span>
                    <span className="text-2xl text-red-500">-</span>
                    <span className="text-2xl text-yellow-500">×</span>
                    <span className="text-2xl text-purple-500">÷</span>
                </div>
            </div>
            <p className="text-gray-600 mt-4">The Math Challenge</p>
            <button 
                onClick={() => setGamePhase('name')}
                className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                Start Game
            </button>
        </div>
    );

    // Component for name input
    const NameInput = () => (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
            <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                placeholder="Your name"
            />
            <button
                onClick={() => {
                    if (playerName.trim()) {
                        setGamePhase('levels');
                    }
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                Continue
            </button>
        </div>
    );

    // Component for level selection
    const LevelSelection = () => (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Select Level</h2>
            <div className="space-y-4">
                {[1, 2, 3].map(lvl => (
                    <button
                        key={lvl}
                        onClick={() => {
                            if (unlockedLevels.includes(lvl)) {
                                setLevel(lvl);
                                setGamePhase('playing');
                                startGame();
                            }
                        }}
                        disabled={!unlockedLevels.includes(lvl)}
                        className={`w-full p-4 text-left bg-white border rounded-lg 
                            ${unlockedLevels.includes(lvl) 
                                ? 'hover:bg-blue-50 border-blue-500' 
                                : 'opacity-50 cursor-not-allowed border-gray-300'}`}
                    >
                        <div className="font-bold">Level {lvl}</div>
                        <div className="text-sm text-gray-600">
                            {lvl === 1 ? "Basics - 2 numbers" : 
                             lvl === 2 ? "Advanced - 3 numbers" : 
                             "Expert - 4 numbers"}
                        </div>
                        {!unlockedLevels.includes(lvl) && 
                            <div className="text-red-500 text-sm">🔒 Complete previous level to unlock</div>
                        }
                    </button>
                ))}
            </div>
        </div>
    );

    // Component for the game board
    const GameBoard = () => (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <div className="text-sm text-gray-500">Level</div>
                        <div className="text-lg font-bold">{level}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Time</div>
                        <div className="text-lg font-bold">{timeElapsed}s</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Solved</div>
                        <div className="text-lg font-bold">{solvedCount}/{levelConfig[level].targetQuestions}</div>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    {cards.map((card, index) => (
                        <button
                            key={index}
                            onClick={() => handleCardClick(index)}
                            className={`w-16 h-24 text-2xl font-bold rounded-lg shadow
                                ${selectedCards.includes(index) 
                                    ? 'bg-blue-100 border-2 border-blue-500' 
                                    : 'bg-white border border-gray-200'}`}
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

                <div className="flex gap-4">
                    <button
                        onClick={generateCards}
                        className="flex-1 p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                        Skip
                    </button>
                    <button
                        onClick={endGame}
                        className="flex-1 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        End Game
                    </button>
                </div>
            </div>

            {showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-green-500 text-white px-8 py-4 rounded-lg text-2xl font-bold animate-bounce">
                        Perfect!
                    </div>
                </div>
            )}
        </div>
    );

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

// Create root and render the app
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<Game24 />);
