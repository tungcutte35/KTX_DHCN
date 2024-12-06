import { useEffect } from 'react';

const LiveChat = () => {
  useEffect(() => {
    const crispScript = document.createElement('script');
    crispScript.type = 'text/javascript';
    crispScript.src = 'https://client.crisp.chat/l.js';
    crispScript.async = true;

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = 'b977e30b-0043-4777-9809-88facf681530';

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(crispScript, firstScript);

    return () => {
      if (crispScript.parentNode) {
        crispScript.parentNode.removeChild(crispScript);
      }
    };
  }, []);

  return null;
};

export default LiveChat;
