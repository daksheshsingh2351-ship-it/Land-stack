import { render } from '@testing-library/react';
import React from 'react';
import App from './src/App.jsx';

try {
  render(<App />);
  console.log("Rendered successfully");
} catch (e) {
  console.error("Render error:", e);
}
