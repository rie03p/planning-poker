import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home/Home'
import { Game } from './pages/Game/Game'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:gameId" element={<Game />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
