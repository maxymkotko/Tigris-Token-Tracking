import { Suspense } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { PUBLIC_ROUTES } from './config/routes';

import { AppThemeProvider } from './Provider';
import { Layout } from './layouts/layout';

import { Proxy } from './pages/Proxy';
import { Profile } from './pages/Profile';
import { Home } from './pages';

import './App.css';
import './config/i18n';

function App() {
  return (
    <Suspense fallback={<>Loading</>}>
      <Router>
        <AppThemeProvider>
          <Layout>
            <Routes>
              <Route path={PUBLIC_ROUTES.default} element={<Home />} />
              <Route path={PUBLIC_ROUTES.home} element={<Home />} />
              {/* <Route path={PUBLIC_ROUTES.proxy} element={<Proxy />} />
              <Route path={PUBLIC_ROUTES.ref} element={<Home />} />
              <Route path={PUBLIC_ROUTES.profile} element={<Profile />} /> */}
              <Route path={'*'} element={<Home />} />
            </Routes>
          </Layout>
        </AppThemeProvider>
      </Router>
    </Suspense>
  );
}

export default App;
