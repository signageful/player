import React, { useEffect, useRef } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const observeInputs = (iframe: HTMLIFrameElement) => {
  const handleFocus = (event) => {
    console.log('focus');
  };

  const handleBlur = () => {
    console.log('blur');
  };

  const inputElements =
    iframe.contentWindow!.document.querySelectorAll('input');
  inputElements.forEach((input) => {
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
  });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IFRAME') {
            observeInputs(node as HTMLIFrameElement);
          }
        });
      }
    });
  });
  observer.observe(iframe.contentWindow!.document.body, {
    childList: true,
    subtree: true,
  });
};

const Hello = () => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const keyboardRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    observeInputs(iframeRef.current);

    iframeRef.current.onload = () => {
      console.log('onload');
      if (!iframeRef.current) return;

      iframeRef.current.onclick = () => {
        console.log('click from loader, onclick');
      };

      iframeRef.current.click = () => {
        console.log('click from loader, clicki');
      };

      iframeRef.current.contentDocument?.addEventListener('click', () => {
        console.log('click from loader, listener');
      });
    };

    const handleFocus = (event) => {
      console.log('focus');
    };

    const handleBlur = () => {
      console.log('blur');
    };

    const iframe = iframeRef.current;

    iframe.contentDocument?.addEventListener('focus', handleFocus, true);
    iframe.contentWindow?.document.body.addEventListener(
      'click',
      handleBlur,
      true
    );
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
      }}
    >
      <iframe
        ref={iframeRef}
        title="External"
        src="https://youtube.com"
        width="100%"
        height="100%"
        style={{
          border: 'none',
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
