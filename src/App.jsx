import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './Components/auth/ProtectedRoute'
import { useAuth } from './context/AuthContext.jsx'

const LoginPage = lazy(() => import('./pages/Auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'))
const DocumentListPage = lazy(() => import('./pages/Documents/DocumentListPage'))
const DocumentDetailPage = lazy(() => import('./pages/Documents/DocumentDetailPage'))
const FlashcardListPage = lazy(() => import('./pages/Flashcards/FlashcardListPage'))
const FlashcardPage = lazy(() => import('./pages/Flashcards/FlashcardPage'))
const QuizTakePage = lazy(() => import('./pages/Quizzes/QuizTakePage'))
const QuizResultPage = lazy(() => import('./pages/Quizzes/QuizResultPage'))
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'))

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className='flex items-center h-screen'><p>Loading...</p></div>
  }



  return (
    <Router>
      <Suspense fallback={<div className='flex items-center h-screen'><p>Loading...</p></div>}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />} >
            <Route path='/dashboard' element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentListPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />
            <Route path="/flashcards" element={<FlashcardListPage />} />
            <Route path="/documents/:id/flashcards" element={<FlashcardPage />} />
            <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
            <Route path="/quizzes/:quizId/results" element={<QuizResultPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
