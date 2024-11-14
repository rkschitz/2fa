import './App.css'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './auth/Context';
import PrivateRoute from './components/PrivateRoute';
import React, { useEffect } from 'react';
import Layout from './components/Layout/index';
import Profile from './pages/Profile';

function App() {

  const [user, setUser] = React.useState(null)

  useEffect(() => {
    let token = localStorage.getItem('token')
    if (token) {
      setUser(token)
    }
  }, [])

  return (
    <AuthProvider>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        {user ? '' : <Route path="/login" element={<Login />} />}
        {user ? '' : <Route path="/register" element={<Register />} />}
      </Routes>
    </AuthProvider>
  )
}

export default App
