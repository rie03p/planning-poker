import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Home} from './pages/Home/Home';
import {Game} from './pages/Game/Game';
import {NotFound} from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/:gameId' element={<Game />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
