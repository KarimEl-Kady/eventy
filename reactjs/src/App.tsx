import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TemplateExplorerPage } from './pages/TemplateExplorerPage'
import { InvitationCreationPage } from './pages/InvitationCreationPage'
import { InvitationDetailPage } from './pages/InvitationDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/templates" replace />} />
        <Route path="/templates" element={<TemplateExplorerPage />} />
        <Route path="/invitations/new" element={<InvitationCreationPage />} />
        <Route path="/invitations/:id" element={<InvitationDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
