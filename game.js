const Game24 = () => {
    const [gamePhase, setGamePhase] = React.useState('splash');
    const [playerName, setPlayerName] = React.useState('');

    // Splash Screen
    const SplashScreen = () => (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-6xl font-bold text-blue-600">24</h1>
            <p className="text-gray-600 mt-4">The Math Challenge</p>
            <button 
                onClick={() => setGamePhase('name')}
                className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                Start Game
            </button>
        </div>
    );

    // Name Input Screen
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

    // Level Selection Screen
    const LevelSelection = () => (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Select Level</h2>
            <div className="space-y-4">
                {[1, 2, 3].map(level => (
                    <button
                        key={level}
                        onClick={() => setGamePhase('playing')}
                        className="w-full p-4 text-left bg-white border rounded-lg hover:bg-blue-50"
                    >
                        <div className="font-bold">Level {level}</div>
                        <div className="text-sm text-gray-600">
                            {level === 1 ? "Basics" : level === 2 ? "Advanced" : "Expert"}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
            {gamePhase === 'splash' && <SplashScreen />}
            {gamePhase === 'name' && <NameInput />}
            {gamePhase === 'levels' && <LevelSelection />}
        </div>
    );
};

// Render the app
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<Game24 />);
