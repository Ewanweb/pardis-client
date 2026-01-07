# 🛣️ React Router v6 - Routing Standards Guide

## ⚠️ CRITICAL RULES - NEVER BREAK THESE

### 1. 🚫 FORBIDDEN: Nested `<Routes>` inside Route elements

```jsx
// ❌ WRONG - This causes crashes and "Cannot read properties of null" errors
<Route path="/admin/*" element={
    <AdminLayout>
        <Routes> {/* ❌ NEVER DO THIS */}
            <Route path="dashboard" element={<Dashboard />} />
        </Routes>
    </AdminLayout>
} />

// ✅ CORRECT - Use proper nesting with Outlet
<Route path="/admin" element={<AdminLayout />}>
    <Route path="dashboard" element={<Dashboard />} />
</Route>
```

### 2. 🔄 MANDATORY: All Layouts MUST use `<Outlet />`

```jsx
// ❌ WRONG - Children-based layout
const Layout = ({ children }) => (
  <div>
    <Header />
    {children} {/* ❌ Don't use children */}
    <Footer />
  </div>
);

// ✅ CORRECT - Outlet-based layout
const Layout = () => (
  <div>
    <Header />
    <Outlet /> {/* ✅ Always use Outlet */}
    <Footer />
  </div>
);
```

### 3. 🛡️ MANDATORY: All Guards MUST use `<Outlet />`

```jsx
// ❌ WRONG - Children-based guard
const RequireAuth = ({ children }) => {
  if (!user) return <Navigate to="/login" />;
  return children; // ❌ Don't use children
};

// ✅ CORRECT - Outlet-based guard
const RequireAuth = () => {
  if (!user) return <Navigate to="/login" />;
  return <Outlet />; // ✅ Always use Outlet
};
```

### 4. ⚛️ CRITICAL: React Import in Hooks

```jsx
// ❌ WRONG - This causes "Cannot read properties of null (reading 'useState')"
import { useState, useEffect } from "react";

// ✅ CORRECT - Always import React when using hooks
import React, { useState, useEffect } from "react";
```

**Why this happens:** When React is not imported as default, the hooks try to access React.useState but React is null, causing the error.

### 5. 🎯 MANDATORY: Proper Route Nesting Structure

```jsx
// ✅ CORRECT - Standard nesting pattern
<Routes>
  {/* Layout as parent route */}
  <Route path="/" element={<PublicLayout />}>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
  </Route>

  {/* Guard + Layout nesting */}
  <Route path="/admin" element={<RequireAdmin />}>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="users" element={<Users />} />
    </Route>
  </Route>
</Routes>
```

### 6. ⚡ MANDATORY: Proper Suspense Boundaries

```jsx
// ✅ CORRECT - Suspense at route level, not layout level
<Route path="dashboard" element={
    <Suspense fallback={<PageSkeleton />}>
        <Dashboard />
    </Suspense>
} />

// ❌ WRONG - Suspense without proper child
<Suspense fallback={<Loading />}>
    <Outlet /> {/* ❌ Outlet is not a lazy component */}
</Suspense>
```

## 📋 Standard Patterns

### Public Routes Pattern

```jsx
<Route path="/" element={<PublicLayout />}>
  <Route
    index
    element={
      <Suspense fallback={<PageSkeleton />}>
        <Home />
      </Suspense>
    }
  />
  <Route
    path="about"
    element={
      <Suspense fallback={<PageSkeleton />}>
        <About />
      </Suspense>
    }
  />
</Route>
```

### Protected Routes Pattern

```jsx
<Route path="/admin" element={<RequireAdmin />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route
      index
      element={
        <Suspense fallback={<PageSkeleton />}>
          <Dashboard />
        </Suspense>
      }
    />

    <Route path="users" element={<RequireRole allowedRoles={["Admin"]} />}>
      <Route
        index
        element={
          <Suspense fallback={<PageSkeleton />}>
            <Users />
          </Suspense>
        }
      />
    </Route>
  </Route>
</Route>
```

### Guest Only Routes Pattern

```jsx
<Route path="/" element={<GuestOnly />}>
  <Route path="/" element={<PublicLayout />}>
    <Route
      path="login"
      element={
        <Suspense fallback={<PageSkeleton />}>
          <Login />
        </Suspense>
      }
    />
  </Route>
</Route>
```

## 🧪 Testing Requirements

Every route must pass these tests:

1. Route renders without crashing
2. Proper loading states show
3. Guards work correctly
4. Lazy loading works
5. No console errors

## 🚨 Common Mistakes to Avoid

1. **Never use `/*` in route paths with nested Routes**
2. **Never put `<Routes>` inside a Route element**
3. **Never use children prop in layouts - always use Outlet**
4. **Never use children prop in guards - always use Outlet**
5. **Never put Suspense around Outlet without lazy components**
6. **Always wrap lazy components in Suspense at route level**

## 🔍 Debugging Checklist

If you get routing errors:

1. ✅ Check: No `<Routes>` inside Route elements?
2. ✅ Check: All layouts use `<Outlet />`?
3. ✅ Check: All guards use `<Outlet />`?
4. ✅ Check: Proper route nesting structure?
5. ✅ Check: Suspense boundaries are correct?

## 📝 File Structure

```
src/
├── layouts/
│   ├── PublicLayout.jsx     # Uses <Outlet />
│   ├── AdminLayout.jsx      # Uses <Outlet />
│   ├── RequireAdmin.jsx     # Uses <Outlet />
│   ├── RequireRole.jsx      # Uses <Outlet />
│   └── GuestOnly.jsx        # Uses <Outlet />
├── pages/
│   ├── Home.jsx             # Lazy loaded
│   ├── About.jsx            # Lazy loaded
│   └── admin/
│       ├── Dashboard.jsx    # Lazy loaded
│       └── Users.jsx        # Lazy loaded
└── App.jsx                  # Main routing setup
```

---

**Remember: Following these rules prevents 90% of routing crashes and performance issues!**
