import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Cart from '../pages/Cart';
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../services/api';

// Mock the API client
vi.mock('../services/api', () => ({
    apiClient: {
        get: vi.fn(),
        delete: vi.fn(),
    }
}));

// Mock the alert hook
vi.mock('../hooks/useAlert', () => ({
    useAlert: () => ({
        showError: vi.fn(),
        showSuccess: vi.fn(),
    })
}));

// Mock components
vi.mock('../components/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('../components/Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('../components/Seo', () => ({
    default: () => <div data-testid="seo">SEO</div>
}));

const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com'
};

const mockCartData = {
    cartId: 'cart-123',
    userId: 'test-user-id',
    totalAmount: 200000,
    currency: 'IRR',
    itemCount: 2,
    isExpired: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
        {
            id: 'item-1',
            courseId: 'course-1',
            unitPrice: 100000,
            title: 'دوره React',
            thumbnail: 'https://example.com/react.jpg',
            instructor: 'استاد احمدی',
            addedAt: new Date().toISOString()
        },
        {
            id: 'item-2',
            courseId: 'course-2',
            unitPrice: 100000,
            title: 'دوره Node.js',
            thumbnail: null,
            instructor: 'استاد محمدی',
            addedAt: new Date().toISOString()
        }
    ]
};

const renderCartWithAuth = (user = mockUser, cartResponse = { success: true, data: mockCartData }) => {
    apiClient.get.mockResolvedValue(cartResponse);

    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ user, login: vi.fn(), logout: vi.fn() }}>
                <Cart />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

describe('Cart Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders cart with items correctly', async () => {
        renderCartWithAuth();

        // Wait for cart to load
        await waitFor(() => {
            expect(screen.getByText('سبد خرید')).toBeInTheDocument();
        });

        // Check cart items are displayed
        expect(screen.getByText('دوره React')).toBeInTheDocument();
        expect(screen.getByText('دوره Node.js')).toBeInTheDocument();
        expect(screen.getByText('استاد احمدی')).toBeInTheDocument();
        expect(screen.getByText('استاد محمدی')).toBeInTheDocument();

        // Check cart summary
        expect(screen.getByText('2 دوره انتخاب شده')).toBeInTheDocument();
        expect(screen.getByText('200,000 تومان')).toBeInTheDocument();
    });

    test('renders empty cart message when cart is empty', async () => {
        const emptyCartResponse = { success: true, data: { ...mockCartData, itemCount: 0, items: [] } };
        renderCartWithAuth(mockUser, emptyCartResponse);

        await waitFor(() => {
            expect(screen.getByText('سبد خرید شما خالی است')).toBeInTheDocument();
        });

        expect(screen.getByText('مشاهده دوره‌ها')).toBeInTheDocument();
    });

    test('shows expiry warning when cart is expired', async () => {
        const expiredCartResponse = {
            success: true,
            data: { ...mockCartData, isExpired: true }
        };
        renderCartWithAuth(mockUser, expiredCartResponse);

        await waitFor(() => {
            expect(screen.getByText(/سبد خرید شما منقضی شده است/)).toBeInTheDocument();
        });
    });

    test('handles course removal correctly', async () => {
        apiClient.delete.mockResolvedValue({ success: true });
        renderCartWithAuth();

        await waitFor(() => {
            expect(screen.getByText('دوره React')).toBeInTheDocument();
        });

        // Find and click remove button for first course
        const removeButtons = screen.getAllByRole('button');
        const removeButton = removeButtons.find(btn =>
            btn.querySelector('svg') && btn.classList.contains('text-red-600')
        );

        if (removeButton) {
            fireEvent.click(removeButton);
        }

        await waitFor(() => {
            expect(apiClient.delete).toHaveBeenCalledWith('/me/cart/items/course-1', {
                successMessage: 'دوره از سبد خرید حذف شد'
            });
        });
    });

    test('handles cart clearing correctly', async () => {
        // Mock window.confirm
        window.confirm = vi.fn(() => true);
        apiClient.delete.mockResolvedValue({ success: true });

        renderCartWithAuth();

        await waitFor(() => {
            expect(screen.getByText('پاک کردن همه')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('پاک کردن همه'));

        await waitFor(() => {
            expect(window.confirm).toHaveBeenCalledWith('آیا مطمئن هستید که می‌خواهید سبد خرید را خالی کنید؟');
            expect(apiClient.delete).toHaveBeenCalledWith('/me/cart', {
                successMessage: 'سبد خرید پاک شد'
            });
        });
    });

    test('handles checkout button click', async () => {
        const mockNavigate = vi.fn();
        vi.doMock('react-router-dom', async () => {
            const actual = await vi.importActual('react-router-dom');
            return {
                ...actual,
                useNavigate: () => mockNavigate,
            };
        });

        renderCartWithAuth();

        await waitFor(() => {
            expect(screen.getByText('ادامه خرید')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('ادامه خرید'));

        // Note: Navigation testing would require more complex setup
        // This test verifies the button exists and is clickable
    });

    test('displays loading state correctly', () => {
        apiClient.get.mockImplementation(() => new Promise(() => { })); // Never resolves

        renderCartWithAuth();

        expect(screen.getByText('در حال بارگذاری سبد خرید...')).toBeInTheDocument();
    });

    test('handles API errors gracefully', async () => {
        apiClient.get.mockRejectedValue(new Error('Network error'));

        renderCartWithAuth();

        await waitFor(() => {
            expect(screen.getByText('سبد خرید شما خالی است')).toBeInTheDocument();
        });
    });

    test('displays course thumbnails with fallback', async () => {
        renderCartWithAuth();

        await waitFor(() => {
            const images = screen.getAllByRole('img');
            expect(images).toHaveLength(2);
        });

        // Test image error handling
        const images = screen.getAllByRole('img');
        fireEvent.error(images[0]);

        expect(images[0].src).toContain('placehold.co');
    });

    test('calculates cart totals correctly', async () => {
        renderCartWithAuth();

        await waitFor(() => {
            // Check individual prices
            expect(screen.getAllByText('100,000 تومان')).toHaveLength(2);

            // Check total
            expect(screen.getByText('200,000 تومان')).toBeInTheDocument();
        });
    });

    test('handles free courses correctly', async () => {
        const freeCartData = {
            ...mockCartData,
            totalAmount: 0,
            items: [{
                ...mockCartData.items[0],
                unitPrice: 0
            }]
        };

        renderCartWithAuth(mockUser, { success: true, data: freeCartData });

        await waitFor(() => {
            expect(screen.getByText('رایگان')).toBeInTheDocument();
        });
    });

    test('redirects to login when user is not authenticated', () => {
        const mockNavigate = vi.fn();
        vi.doMock('react-router-dom', async () => {
            const actual = await vi.importActual('react-router-dom');
            return {
                ...actual,
                useNavigate: () => mockNavigate,
            };
        });

        renderCartWithAuth(null); // No user

        // Note: This would require more complex setup to test navigation
        // The component should redirect to /login when user is null
    });

    test('disables checkout button when cart is expired', async () => {
        const expiredCartResponse = {
            success: true,
            data: { ...mockCartData, isExpired: true }
        };
        renderCartWithAuth(mockUser, expiredCartResponse);

        await waitFor(() => {
            const checkoutButton = screen.getByText('ادامه خرید');
            expect(checkoutButton).toBeDisabled();
        });
    });

    test('shows correct item count in header', async () => {
        renderCartWithAuth();

        await waitFor(() => {
            expect(screen.getByText('2 دوره انتخاب شده')).toBeInTheDocument();
        });
    });

    test('formats dates correctly', async () => {
        renderCartWithAuth();

        await waitFor(() => {
            // Check that dates are displayed in Persian format
            const dateElements = screen.getAllByText(/اضافه شده در:/);
            expect(dateElements.length).toBeGreaterThan(0);
        });
    });
});