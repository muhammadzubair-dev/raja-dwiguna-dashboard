import { useEffect, useState, useRef } from 'react';

const useAutoLogout = (timeoutDuration = 10 * 60 * 1000, onLogout) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const lastActivityTime = useRef(Date.now()); // To track last activity time
  const idleTimeout = timeoutDuration; // Set timeout duration (default 10 minutes)

  // Handle logout logic
  const handleLogout = () => {
    setIsLoggedIn(false);
    onLogout(); // Call the provided logout callback
  };

  // Reset the timer by updating the ref without triggering re-renders
  const resetTimer = () => {
    lastActivityTime.current = Date.now();
  };

  useEffect(() => {
    // Check inactivity periodically
    const checkInactivity = () => {
      const currentTime = Date.now();
      if (currentTime - lastActivityTime.current >= idleTimeout) {
        handleLogout();
      }
    };

    // Set interval to check inactivity every second
    const inactivityInterval = setInterval(checkInactivity, 1000);

    // Event listeners to detect user activity
    const handleUserActivity = () => {
      resetTimer();
    };

    // Add event listeners for mouse and keyboard events
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    // Cleanup: remove event listeners and clear interval on unmount
    return () => {
      clearInterval(inactivityInterval);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [idleTimeout]);

  return isLoggedIn;
};

export default useAutoLogout;
