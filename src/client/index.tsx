import 'inter-ui/inter.css';
import 'material-symbols/index.css';
import { createRoot } from 'react-dom/client';
import { App } from './components/App.tsx';
import './index.css';

// biome-ignore lint/style/noNonNullAssertion: index.htmlで定義済
const root = createRoot(document.getElementById('app')!);
root.render(<App />);
