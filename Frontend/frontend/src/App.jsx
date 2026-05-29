import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import TreePage from './pages/TreePage';
import MembersPage from './pages/MembersPage';

function App() {
  return (
    <Router>
      <nav className="nav-bar">
        <div className="nav-content">
          <div className="nav-logo">
            <div className="nav-logo-icon">🌳</div>
            <h2>FamilyTree</h2>
          </div>
          <div className="nav-links">
            <NavLink to="/" end className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              🏠 Family Tree
            </NavLink>
            <NavLink to="/members" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              👥 Manage Members
            </NavLink>
          </div>
        </div>
      </nav>
      
      <main className="container">
        <Routes>
          <Route path="/" element={<TreePage />} />
          <Route path="/members" element={<MembersPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
