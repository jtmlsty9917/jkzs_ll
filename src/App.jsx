import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Water from './pages/Water'
import Calendar from './pages/Calendar'
import Todo from './pages/Todo'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="water" element={<Water />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="todo" element={<Todo />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
