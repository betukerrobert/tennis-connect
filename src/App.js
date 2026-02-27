import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Discovery from './pages/Discovery';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Chat from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup/:role" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/chat/:id" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
