const Game24 = () => {
    const [gamePhase, setGamePhase] = React.useState('splash');

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl font-bold text-blue-600">24</div>
                <p className="mt-4 text-gray-600">The Math Challenge</p>
                <button 
                    onClick={() => setGamePhase('name')}
                    className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Start Game
                </button>
            </div>
        </div>
    );
};

// Create root and render the app
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(Game24));
