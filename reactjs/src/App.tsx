import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TemplateExplorerPage } from './pages/TemplateExplorerPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/templates" replace />} />
        <Route path="/templates" element={<TemplateExplorerPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
