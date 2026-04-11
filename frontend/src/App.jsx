import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import HomePage    from './pages/HomePage'
import WizardPage  from './pages/WizardPage'
import ResultsPage from './pages/ResultsPage'
import ChatbotWidget from './components/Chatbot/ChatbotWidget'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<HomePage />}    />
          <Route path="/wizard"  element={<WizardPage />}  />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
        <ChatbotWidget />
      </BrowserRouter>
    </AppProvider>
  )
}
