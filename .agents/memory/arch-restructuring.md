---
name: Architecture restructuring
description: Decisions and constraints from the CBTis 258 frontend refactor (godfiles → modular architecture)
---

## Summary
Principal.jsx 1239→326 lines, Admin.jsx 737→73 lines. New modules in `context/`, `hooks/`, `components/admin/`, `components/principal/`.

## Key decisions

**AuthContext** (`src/context/AuthContext.jsx`) is a reactive localStorage mirror.
- Exposes: `user, token, isAuthenticated, isAdmin, login, logout, refreshUser`
- It does NOT run `checkSessionToken` — that stays in `Principal.jsx` on mount.
- After session check, Principal calls `loadProfileData()` which re-reads localStorage. AuthContext is updated separately if needed via `refreshUser()`.
- **Why:** checkSessionToken is async and page-level; AuthContext just syncs state.

**useFinancial** (`src/hooks/useFinancial.js`)
- `updateFinancialStatus(profileData)` returns the pendingCount number so callers can react (e.g. `if (count > 0) setDeudaOpen(true)`).
- **Why:** hook cannot call page-level state setters directly.

**useEventos** (`src/hooks/useEventos.js`)
- Polls `getEventos()` every 30s via `setInterval`.
- Returns spread-able object: all spread into `<EventoModal {...eventoHandlers} />`.

**ProtectedRoute** (`src/components/ProtectedRoute.jsx`)
- Fast client-side guard (checks localStorage token). Principal still runs server-side `checkSessionToken` for full validation.
- `requiredRole="admin"` redirects to `/principal` if user is not admin.

**MobileQuickActions** — do NOT use dynamic Tailwind classes (e.g. `bg-${color}`). Tailwind JIT purges them. Use fully static class strings per button.

**SplashScreen CSS** — all `@keyframes` (bannerSlideIn, _sPopIn, etc.) live in `SplashScreen.jsx`'s inline `<style>` tag, not in a separate CSS file.

**bcrypt** — must stay at `==3.2.2` (passlib incompatible with bcrypt 4.x+). Backend constraint.

**Component locations**
- `src/components/admin/` — Tab components + AdminLoader + ChartCard
- `src/components/principal/` — Section components + WelcomeBanner (exports DesktopWelcomeBanner + MobileWelcomeBanner named exports)
- `src/context/AuthContext.jsx` — AuthProvider (use alongside ThemeProvider in App.jsx)
- `src/hooks/useAuth.js` — thin wrapper around AuthContext
