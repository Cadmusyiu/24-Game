import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Lock, Trophy, ArrowRight } from 'lucide-react';

function Game24() {
  const [gamePhase, setGamePhase] = useState('splash');
  const [playerName, setPlayerName] = useState('');
  const [level, setLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('24game_highscores');
    return saved ? JSON.parse(saved) : [];
  });

  // Splash Screen Component
  const SplashScreen = () => (
    <Card className="w-full max-w-2xl mx-auto">
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
          className="w-48 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <Play size={24} />
          Start Game
        </button>
      </CardContent>
    </Card>
  );

  // Name Input Component
  const NameInput = () => (
    <Card className="w-full max-w-2xl mx-auto">
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
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <ArrowRight size={20} />
              Continue
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Level Selection Component
  const LevelSelection = () => {
    const levels = [
      { number: 1, title: "Basics", description: "Simple operations with 2 numbers" },
      { number: 2, title: "Advanced", description: "Complex operations with 3 numbers" },
      { number: 3, title: "Expert", description: "Master level with 4 numbers" }
    ];

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
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
                    {unlockedLevels.includes(levelData.number) ? (
                      <Play size={24} className="text-blue-500" />
                    ) : (
                      <Lock size={24} className="text-gray-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Rankings Component
  const Rankings = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy size={24} className="text-yellow-500" />
            <h2 className="text-2xl font-bold">Leaderboard</h2>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Score</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {highScores.map((score, index) => (
                  <tr key={index} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-3 text-sm">
                      {index + 1}
                      {index < 3 && " 🏆"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{score.name}</td>
                    <td className="px-4 py-3 text-sm text-right">{score.totalScore}</td>
                    <td className="px-4 py-3 text-sm text-right">{score.totalTime}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setGamePhase('levels')}
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Play Again
          </button>
        </div>
      </CardContent>
    </Card>
  );

  // Main render logic
  const renderGamePhase = () => {
    switch (gamePhase) {
      case 'splash':
        return <SplashScreen />;
      case 'name':
        return <NameInput />;
      case 'levels':
        return <LevelSelection />;
      case 'playing':
        return <GameBoard />;
      case 'ranking':
        return <Rankings />;
      default:
        return <SplashScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      {renderGamePhase()}
    </div>
  );
}

export default Game24;
