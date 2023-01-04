import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import useCommunication from './hooks/use-communication';

const query = new URLSearchParams(window.location.search);
const target = query.get('target');

const Hello: React.FC = () => {
  const [messageHandler] = useCommunication();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
      <iframe
        title="External"
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        src={target!}
        width="100%"
        height="100%"
        style={{
          border: 'none',
        }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        onLoad={(event) => {
          const iframe = event.currentTarget as HTMLIFrameElement;
          const iframeWindow = iframe.contentWindow;
          if (!iframeWindow) return;

          iframeWindow.addEventListener('message', messageHandler);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
