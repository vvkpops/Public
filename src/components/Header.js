import React, { useEffect, useState } from 'react';

const Header = () => {
  const [localTime, setLocalTime] = useState('');
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString() + " Local");
      setUtcTime(now.toUTCString().slice(17, 25) + " UTC");
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="relative p-4 bg-gray-800 shadow-md text-center text-xl font-bold mb-6 max-w-screen-2xl mx-auto">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-mono text-gray-300">{localTime}</div>
      FlyHigh™ Dispatch
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-mono text-gray-300">{utcTime}</div>
    </header>
  );
};

export default Header;