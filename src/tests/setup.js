import '@testing-library/jest-dom';

// 模拟 Web Speech API
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    this.onstart = null;
  }
  start() {}
  stop() {}
  abort() {}
}

class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.lang = '';
    this.rate = 1;
    this.volume = 1;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.voice = null;
  }
}

class MockSpeechSynthesis {
  speak() {}
  cancel() {}
  pause() {}
  resume() {}
  getVoices() {
    return [];
  }
}

class MockMediaRecorder {
  constructor() {
    this.state = 'inactive';
    this.stream = { getTracks: () => [] };
    this.ondataavailable = null;
    this.onstop = null;
  }
  start() {}
  stop() {}
  pause() {}
  resume() {}
}

// 模拟 AudioContext
class MockAudioContext {
  createAnalyser() {
    return {
      fftSize: 256,
      connect: vi.fn(),
      getByteFrequencyData: vi.fn(() => new Uint8Array(128)),
    };
  }
  createMediaStreamSource() {
    return {
      connect: vi.fn(),
    };
  }
  close() {}
}

window.SpeechRecognition = MockSpeechRecognition;
window.webkitSpeechRecognition = MockSpeechRecognition;
window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
window.speechSynthesis = new MockSpeechSynthesis();
window.MediaRecorder = MockMediaRecorder;
window.AudioContext = MockAudioContext;
window.webkitAudioContext = MockAudioContext;

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// 模拟 navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn(() => [{ stop: vi.fn() }]),
    }),
  },
  writable: true,
});
