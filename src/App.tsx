import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/pages/Home'
import TopicDetail from '@/pages/TopicDetail'
import Opinion from '@/pages/Opinion'
import Admin from '@/pages/Admin'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topic/:id" element={<TopicDetail />} />
        <Route path="/opinion" element={<Opinion />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
