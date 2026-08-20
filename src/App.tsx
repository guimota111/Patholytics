import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { RedirectIfAuthenticated, RequireAuth } from '@/components/RouteGuards'
import { ScrollToTop } from '@/components/ScrollToTop'
import { FullPageSpinner } from '@/components/ui/Spinner'

const LandingPage = lazy(() => import('@/pages/Landing'))
const LoginPage = lazy(() => import('@/pages/Login'))
const SignupPage = lazy(() => import('@/pages/Signup'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPassword'))
const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

export default function App() {
  const { t } = useTranslation()

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<FullPageSpinner label={t('common.loading')} />}>
        <Routes>
          {/* Public marketing shell */}
          <Route element={<MarketingLayout />}>
            <Route index element={<LandingPage />} />
          </Route>

          {/* Auth screens — dedicated routes so `?next=` survives a refresh */}
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <LoginPage />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectIfAuthenticated>
                <SignupPage />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/reset-password"
            element={
              <RedirectIfAuthenticated>
                <ResetPasswordPage />
              </RedirectIfAuthenticated>
            }
          />

          {/* Signed-in shell. Tool routes get mounted here as they ship. */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}
