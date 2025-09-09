import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login') // 'login' or 'register'

  if (!isOpen) return null

  const switchToRegister = () => setMode('register')
  const switchToLogin = () => setMode('login')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            {mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {mode === 'login' ? (
            <LoginForm
              onClose={onClose}
              onSwitchToRegister={switchToRegister}
            />
          ) : (
            <RegisterForm
              onClose={onClose}
              onSwitchToLogin={switchToLogin}
            />
          )}
        </div>
      </div>
    </div>
  )
}