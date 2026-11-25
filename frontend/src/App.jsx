import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import HomePage    from './pages/HomePage'
import SchemesPage from './pages/SchemesPage'
import WizardPage  from './pages/WizardPage'
import ResultsPage from './pages/ResultsPage'
import ChatbotWidget from './components/Chatbot/ChatbotWidget'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <Routes>
          <Route path="/"                    element={<HomePage />}    />
          <Route path="/schemes/:categoryId" element={<SchemesPage />} />
          <Route path="/wizard"              element={<WizardPage />}  />
          <Route path="/results"             element={<ResultsPage />} />
        </Routes>
        <ChatbotWidget />
      </BrowserRouter>
    </AppProvider>
  )
}
