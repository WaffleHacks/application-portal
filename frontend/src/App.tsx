import React from 'react';

import logo from './logo.svg';

function App() {
  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col align-middle justify-center text-3xl text-white bg-gray-700">
        <img src={logo} className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a className="text-sky-300" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
