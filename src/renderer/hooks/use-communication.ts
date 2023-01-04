import { useCallback, useEffect } from 'react';

const devDomain = 'https://app.signageful.dev';
const prodDomain = 'https://app.signageful.com';

const useCommunication = () => {
  const messageHandler = useCallback((event: MessageEvent) => {
    if (
      !event.origin.startsWith(devDomain) ||
      !event.origin.startsWith(prodDomain)
    )
      return;

    if (!event.origin.includes('signageful')) return;

    console.log(event.data);
  }, []);

  useEffect(() => {
    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, [messageHandler]);

  return [messageHandler];
};

export default useCommunication;
