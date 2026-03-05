import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Discovery from './pages/Discovery';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import ScheduleMatch from './pages/ScheduleMatch';
import Matches from './pages/Matches';
import MatchInvite from './pages/MatchInvite';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup/:role" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/schedule/:userId" element={<ScheduleMatch />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/match-invite/:matchId" element={<MatchInvite />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
