chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message: { type: string; target: string; data: string }) {
  if (message.target !== 'offscreen-doc') {
    return;
  }

  if (message.type === 'copy-to-clipboard') {
    await handleClipboardWrite(message.data);
  }
}

const textEl = document.querySelector('#clipboard') as HTMLTextAreaElement;

async function handleClipboardWrite(data: string) {
  try {
    if (typeof data !== 'string') {
      throw new TypeError(`Value must be a string, got '${typeof data}'`);
    }

    textEl.value = data;
    textEl.select();
    document.execCommand('copy');
  } finally {
    window.close();
  }
} 