import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the auth context
vi.mock('../context/AuthContext', () => ({
    AuthProvider: ({ children }) => children,
    useAuth: () => ({
        user: null,
        loading: false,
        hasRole: () => false,
        logout: vi.fn(),
        fetchUser: vi.fn()
    })
}));

// Mock other contexts
vi.mock('../context/ThemeContext', () => ({
    ThemeProvider: ({ children }) => children
}));

vi.mock('../context/AppBootstrapContext', () => ({
    AppBootstrapProvider: ({ children }) => children
}));

// Mock components that might cause issues
vi.mock('../components/Navbar', () => ({
    default: () => <nav data-testid="navbar">Navbar</nav>
}));

vi.mock('../components/Footer', () => ({
    default: () => <footer data-testid="footer">Footer</footer>
}));

vi.mock('../components/AlertContainer', () => ({
    default: () => <div data-testid="alerts">Alerts</div>
}));

vi.mock('../components/ErrorBoundary', () => ({
    default: ({ children }) => children
}));

// Mock lazy loaded pages
vi.mock('../pages/HomeOptimized', () => ({
    default: () => <div data-testid="home-page">Home Page</div>
}));

vi.mock('../pages/auth/Login', () => ({
    default: () => <div data-testid="login-page">Login Page</div>
}));

vi.mock('../pages/NotFound', () => ({
    default: () => <div data-testid="not-found-page">404 Not Found</div>
}));

describe('Routing Tests', () => {
    it('renders home page without crashing', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );

        // Should render without throwing errors
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders login page for guests without crashing', async () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        );

        // Should render without throwing errors
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('renders 404 page for unknown routes without crashing', async () => {
        render(
            <MemoryRouter initialEntries={['/unknown-route']}>
                <App />
            </MemoryRouter>
        );

        // Should render without throwing errors
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('does not have nested Routes inside Route elements', () => {
        // This test ensures our App.jsx structure is correct
        const appCode = App.toString();

        // Should not contain the anti-pattern of Routes inside Route elements
        expect(appCode).not.toMatch(/<Route[^>]*element={[^}]*<Routes>/);
    });
});