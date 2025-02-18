<!DOCTYPE html>
<html>
<head>
    <title>24 Game</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- React -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
    <!-- Babel -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Tailwind -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        // Card component replacement
        const Card = ({ children, className = "" }) => (
            <div className={`bg-white rounded-lg shadow-lg ${className}`}>{children}</div>
        );

        const CardContent = ({ children, className = "" }) => (
            <div className={`p-6 ${className}`}>{children}</div>
        );

        // Main Game component
        const Game24 = () => {
            const [gamePhase, setGamePhase] = React.useState('splash');
            const [playerName, setPlayerName] = React.useState('');
            const [level, setLevel] = React.useState(1);
            const [unlockedLevels, setUnlockedLevels] = React.useState([1]);
            const [completedLevels, setCompletedLevels] = React.useState([]);
            const [totalTime, setTotalTime] = React.useState(0);
            const [highScores, setHighScores] = React.useState(() => {
                const saved = localStorage.getItem('24game_highscores');
                return saved ? JSON.parse(saved) : [];
            });

            React.useEffect(() => {
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

            // SplashScreen component
            const SplashScreen = () => (
                <Card>
                    <CardContent className="p-8 text-center space-y-8">
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
                            className="w-48 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto"
                        >
                            Start Game
                        </button>
                    </CardContent>
                </Card>
            );

            // NameInput component
            const NameInput = () => (
                <Card>
                    <CardContent className="p-8">
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
                    </CardContent>
                </Card>
            );

            // LevelSelect component
            const LevelSelect = () => (
                <Card>
                    <CardContent className="p-8">
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
                                                <span className="text-xl font-bold">Level {lvl}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xl font-bold">🔒 Locked</span>
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
                    </CardContent>
                </Card>
            );

            // Ranking component
            const Ranking = () => (
                <Card>
                    <CardContent className="p-8">
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
                                                <span className="text-sm text-gray-500">
                                                    {new Date(score.date).toLocaleDateString()}
                                                </span>
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
                    </CardContent>
                </Card>
            );

            // Main render
            return (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                    {gamePhase === 'splash' && <SplashScreen />}
                    {gamePhase === 'name' && <NameInput />}
                    {gamePhase === 'levels' && <LevelSelect />}
                    {gamePhase === 'ranking' && <Ranking />}
                </div>
            );
        };

        // Render the app
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(<Game24 />);
    </script>
</body>
</html>
