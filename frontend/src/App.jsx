import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

// Access URLs from vite.config.js define
const configBackendUrl = import.meta.env.VITE_CONFIG_BACKEND_URL;  // URL from frontend-config.json
const actualBackendUrl = import.meta.env.VITE_ACTUAL_BACKEND_URL; // URL actually used by proxy

function App() {
  // Define more specific status states
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'error'
  const [backendMessage, setBackendMessage] = useState('Attempting to connect...');
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Track component mount status
    let intervalId = null;

    const checkBackend = async () => {
      if (!isMounted) return;
      
      setConnectionStatus('connecting');
      setLastError(null);

      try {
        // Use the proxied path /api/
        const response = await axios.get('/api/status', { timeout: 4000 }); // Slightly longer timeout
        
        if (isMounted) {
            setConnectionStatus('connected');
            setBackendMessage(response.data.status || 'Connected to Backend');
            console.log('Backend status checked successfully:', response.data);
        }
      } catch (error) {
         if (isMounted) {
            setConnectionStatus('error');
            let errorMsg = 'Connection Error';
            if (error.code === 'ECONNABORTED') {
                errorMsg = 'Connection timed out';
            } else if (error.response) {
                errorMsg = `Proxy Error: ${error.response.status} - ${error.response.statusText}`;
            } else if (error.request) {
                errorMsg = 'Backend unreachable via proxy (no response)';
            } else {
                errorMsg = `Error: ${error.message}`;
            }
            setBackendMessage(errorMsg);
            setLastError(error.message);
            console.error('Error connecting to backend via proxy:', error);
        }
      }
    };

    // Initial check
    checkBackend();

    // Set up interval for periodic checks
    intervalId = setInterval(checkBackend, 7000); // Check every 7 seconds

    // Cleanup function
    return () => {
      isMounted = false; // Mark component as unmounted
      if (intervalId) {
        clearInterval(intervalId); // Clear interval on unmount
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Simple status styling
  const statusStyles = {
      connecting: { color: 'orange' },
      connected: { color: 'green' },
      error: { color: 'red' },
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Frontend Application</h1>
        <p style={{fontSize: '0.9em', color: '#666'}}>
          Backend URL in <code>frontend-config.json</code>: {configBackendUrl}<br/>
          Actual Backend URL used by Proxy: <strong>{actualBackendUrl}</strong>
        </p>
        <div className="status-display">
          Status: <span style={statusStyles[connectionStatus]}>{connectionStatus.toUpperCase()}</span>
        </div>
        <div className="message-display">
          Message: {backendMessage}
        </div>
        {lastError && (
           <div className="error-detail" style={{ fontSize: '0.8em', color: 'darkred', marginTop: '10px' }}>
               Error Detail: {lastError}
           </div>
        )}
      </header>
    </div>
  )
}

export default App
