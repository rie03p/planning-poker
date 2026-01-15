import {
  BrowserRouter, Routes, Route,
} from 'react-router-dom';
import {Home} from './pages/Home/Home';
import {Game} from './pages/Game/Game';
import {NotFound} from './pages/NotFound';
import {Layout} from './components/Layout';
import {ErrorBoundary} from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={<Home />} />
            <Route path='*' element={<NotFound />} />
          </Route>
          <Route path='/:gameId' element={<Game />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
