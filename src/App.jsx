import React from 'react';
import Timer from './Timer';

function App() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb')",
      }}
    >
      <Timer />
    </div>
  );
}

export default App;
