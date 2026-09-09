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

// Ferramentas — cada uma no seu proprio modulo, carregada sob demanda.
const StagerIndexPage = lazy(() => import('@/pages/tools/StagerIndex'))
const StagerCalculatorPage = lazy(() => import('@/pages/tools/StagerCalculator'))
const TmaMapperPage = lazy(() => import('@/pages/tools/TmaMapper'))
const FieldConverterPage = lazy(() => import('@/pages/tools/FieldConverter'))
const ProstateMapperPage = lazy(() => import('@/pages/tools/ProstateMapper'))
const BreastMapperPage = lazy(() => import('@/pages/tools/BreastMapper'))
const ReportArchivePage = lazy(() => import('@/pages/tools/ReportArchive'))
const BillingPage = lazy(() => import('@/pages/tools/Billing'))
const MacroscopyManualPage = lazy(() => import('@/pages/tools/MacroscopyManual'))
const MacroscopySystemPage = lazy(() => import('@/pages/tools/MacroscopySystem'))
const MacroscopyProtocolPage = lazy(() => import('@/pages/tools/MacroscopyProtocol'))
const FrozenPage = lazy(() => import('@/pages/tools/Frozen'))

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

          {/* Signed-in shell. One route block per tool. */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/tools/stager" element={<StagerIndexPage />} />
            <Route path="/tools/stager/:calculatorId" element={<StagerCalculatorPage />} />

            <Route path="/tools/tma" element={<TmaMapperPage />} />
            <Route path="/tools/fields" element={<FieldConverterPage />} />
            <Route path="/tools/prostate" element={<ProstateMapperPage />} />
            <Route path="/tools/breast" element={<BreastMapperPage />} />
            <Route path="/tools/breast/:module" element={<BreastMapperPage />} />
            <Route path="/tools/archive" element={<ReportArchivePage />} />
            <Route path="/tools/billing" element={<BillingPage />} />
            <Route path="/tools/macroscopia" element={<MacroscopyManualPage />} />
            <Route path="/tools/macroscopia/:systemId" element={<MacroscopySystemPage />} />
            <Route path="/tools/macroscopia/:systemId/:protocolId" element={<MacroscopyProtocolPage />} />
            <Route path="/tools/congelacao" element={<FrozenPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}
