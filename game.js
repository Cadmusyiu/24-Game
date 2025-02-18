import React, { useState, useEffect } from 'react';

// Function to generate 4 random numbers between 1 and 9
function generateNumbers() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 9) + 1);
}

// Safe way to evaluate expressions without using eval
function safeEval(expr) {
  try {
    return new Function('return ' + expr)();
  } catch (e) {
    return undefined;
  }
}

// Evaluates if one of the permutations equals 24
function evaluateExpression(nums, ops) {
  const permutations = [
    `(${nums[0]} ${ops[0]} ${nums[1]}) ${ops[1]} (${nums[2]} ${ops[2]} ${nums[3]})`,
    `((${nums[0]} ${ops[0]} ${nums[1]}) ${ops[1]} ${nums[2]}) ${ops[2]} ${nums[3]}`,
    `${nums[0]} ${ops[0]} ((${nums[1]} ${ops[1]} ${nums[2]}) ${ops[2]} ${nums[3]})`,
    `(${nums[0]} ${ops[0]} (${nums[1]} ${ops[1]} ${nums[2]})) ${ops[2]} ${nums[3]}`,
    `${nums[0]} ${ops[0]} (${nums[1]} ${ops[1]} (${nums[2]} ${ops[2]} ${nums[3]}))`,
  ];

  for (const expr of permutations) {
    const safeExpr = expr.replace(/×/g, '*').replace(/÷/g, '/');
    const result = safeEval(safeExpr);
    if (result !== undefined && Math.abs(result - 24) < 0.0001) return true;
  }
  return false;
}

// Main game component
function Game24() {
  const [numbers, setNumbers] = useState(generateNumbers());
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [timer, setTimer] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing');
  const availableOperators = ['×', '÷', '+', '-'];

  // Start the timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Handle number selection
  const handleNumberSelect = (index) => {
    if (selectedNumbers.length < 4 && !selectedNumbers.includes(index)) {
      setSelectedNumbers([...selectedNumbers, index]);
    }
  };

  // Handle operator selection
  const handleOperatorSelect = (op) => {
    if (operators.length < 3) {
      setOperators([...operators, op]);
    }
  };

  // Reset selection
  const resetSelection = () => {
    setSelectedNumbers([]);
    setOperators([]);
  };

  // Check if the current selection makes 24
  const checkSolution = () => {
    if (selectedNumbers.length === 4 && operators.length === 3) {
      const selectedNums = selectedNumbers.map(idx => numbers[idx]);
      const result = evaluateExpression(selectedNums, operators);
      
      if (result) {
        setGameStatus('solved');
        alert('You solved it!');

        // Reset game after a delay
        setTimeout(() => {
          setNumbers(generateNumbers());
          setSelectedNumbers([]);
          setOperators([]);
          setTimer(0);
          setGameStatus('playing');
        }, 2000);
      } else {
        alert('Not a valid solution for 24!');
      }
    }
  };

  return (
    <div style={{textAlign: 'center'}}>
      <h1>24 Game</h1>
      <p>Time: {timer} seconds</p>
      
      {/* Number Selection */}
      <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
        {numbers.map((num, index) => (
          <button key={index} onClick={() => handleNumberSelect(index)} disabled={selectedNumbers.includes(index) || gameStatus === 'solved'}
                  style={{margin: '5px', padding: '10px', fontSize: '18px', cursor: 'pointer'}}>
            {num}
          </button>
        ))}
      </div>
      
      {/* Operator Selection */}
      <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
        {availableOperators.map((op, index) => (
          <button key={index} onClick={() => handleOperatorSelect(op)} disabled={operators.length >= 3 || gameStatus === 'solved'}
                  style={{margin: '5px', padding: '10px', fontSize: '18px', cursor: 'pointer'}}>
            {op}
          </button>
        ))}
      </div>

      {/* Display selected numbers and operators */}
      <div>
        {selectedNumbers.map(idx => numbers[idx]).join(' ')}
        {operators.join(' ')}
      </div>

      {/* Control Buttons */}
      <div style={{marginTop: '20px'}}>
        <button onClick={resetSelection} disabled={gameStatus === 'solved'}>Reset</button>
        <button onClick={checkSolution} disabled={selectedNumbers.length !== 4 || operators.length !== 3 || gameStatus === 'solved'}>Check</button>
      </div>
    </div>
  );
}

export default Game24;
