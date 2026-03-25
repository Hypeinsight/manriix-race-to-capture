import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider }      from './context/ThemeContext.jsx';
import { ParticipantProvider } from './context/ParticipantContext.jsx';
import Landing       from './pages/Landing.jsx';
import Step1Register from './pages/Step1Register.jsx';
import Step2Instagram from './pages/Step2Instagram.jsx';
import Step3Game     from './pages/Step3Game.jsx';
import Step4Video    from './pages/Step4Video.jsx';
import Complete      from './pages/Complete.jsx';
import Leaderboard   from './pages/Leaderboard.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <ParticipantProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"            element={<Landing />} />
            <Route path="/step/1"      element={<Step1Register />} />
            <Route path="/step/2"      element={<Step2Instagram />} />
            <Route path="/step/3"      element={<Step3Game />} />
            <Route path="/step/4"      element={<Step4Video />} />
            <Route path="/complete"    element={<Complete />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ParticipantProvider>
    </ThemeProvider>
  );
}
