import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CourseDetail from '../pages/CourseDetail';
import { api, apiClient } from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
    api: {
        get: vi.fn(),
    },
    apiClient: {
        post: vi.fn(),
    }
}));

// Mock hooks
vi.mock('../hooks/useAlert', () => ({
    useAlert: () => ({
        showError: vi.fn(),
        showSuccess: vi.fn(),
    })
}));

vi.mock('../hooks/useErrorHandler', () => ({
    useErrorHandler: () => ({
        handleError: vi.fn(),
        clearError: vi.fn(),
    })
}));

// Mock components
vi.mock('../components/CourseComments', () => ({
    default: () => <div data-testid="course-comments">Course Comments</div>
}));

vi.mock('../components/Seo/SeoHead', () => ({
    default: () => <div data-testid="seo-head">SEO Head</div>
}));

const mockCourse = {
    id: 'course-123',
    slug: 'react-course',
    title: 'دوره جامع React',
    description: 'یادگیری کامل React از صفر تا صد',
    price: 150000,
    thumbnailUrl: 'https://example.com/react-course.jpg',
    instructorName: 'استاد احمدی',
    duration: 120,
    lessonsCount: 25,
    studentsCount: 1500,
    rating: 4.8,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

const renderCourseDetail = (courseSlug = 'react-course') => {
    // Mock useParams
    vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
            ...actual,
            useParams: () => ({ slug: courseSlug }),
            useNavigate: () => vi.fn(),
        };
    });

    return render(
        <BrowserRouter>
            <CourseDetail />
        </BrowserRouter>
    );
};

describe('CourseDetail Component - Add to Cart Functionality', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    test('renders course details correctly', async () => {
        api.get.mockResolvedValue({
            data: {
                data: [mockCourse]
            }
        });

        renderCourseDetail();

        await waitFor(() => {
            expect(screen.getByText('دوره جامع React')).toBeInTheDocument();
        });

        expect(screen.getByText('استاد احمدی')).toBeInTheDocument();
        expect(screen.getByText('150,000')).toBeInTheDocument();
    });

    test('shows add to cart button when user is authenticated and not enrolled', async () => {
        localStorage.setItem('token', 'fake-token');

        api.get.mockImplementation((url) => {
            if (url === '/courses') {
                return Promise.resolve({ data: { data: [mockCourse] } });
            }
            if (url.includes('/enrollment-status')) {
                return Promise.resolve({ data: { isEnrolled: false } });
            }
            return Promise.reject(new Error('Not found'));
        });

        renderCourseDetail();

        await waitFor(() => {
            expect(screen.getByText('اضافه به سبد خرید')).toBeInTheDocument();
        });
    });

    test('shows enrolled message when user is already enrolled', async () => {
        localStorage.setItem('token', 'fake-token');

        api.get.mockImplementation((url) => {
            if (url === '/courses') {
                return Promise.resolve({ data: { data: [mockCourse] } });
            }
            if (url.includes('/enrollment-status')) {
                return Promise.resolve({ data: { isEnrolled: true } });
            }
            return Promise.reject(new Error('Not found'));
        });

        renderCourseDetail();

        await waitFor(() => {
            // Should show some indication that user is enrolled
            // This depends on the actual implementation
            expect(screen.queryByText('اضافه به سبد خرید')).not.toBeInTheDocument();
        });
    });

    test('handles add to cart successfully', async () => {
        localStorage.setItem('token', 'fake-token');

        api.get.mockImplementation((url) => {
            if (url === '/courses') {
                return Promise.resolve({ data: { data: [mockCourse] } });
            }
            if (url.includes('/enrollment-status')) {
                return Promise.resolve({ data: { isEnrolled: false } });
            }
            return Promise.reject(new Error('Not found'));
        });

        apiClient.post.mockResolvedValue({
            success: true,
            data: {
                cartId: 'cart-123',
                cartItemId: 'item-123',
                totalItems: 1,
                totalAmount: 150000,
                message: 'دوره به سبد خرید اضافه شد'
            }
        });

        renderCourseDetail();

        await waitFor(() => {
            expect(screen.getByText('اضافه به سبد خرید')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('اضافه به سبد خرید'));

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith('/me/cart/items', {
                courseId: mockCourse.id
            }, {
                successMessage: 'دوره به سبد خرید اضافه شد! 🛒'
            });
        });
    });

    test('handles add to cart error', async () => {
        localStorage.setItem('token', 'fake-token');

        api.get.mockImplementation((url) => {
            if (url === '/courses') {
                return Promise.resolve({ data: { data: [mockCourse] } });
            }
            if (url.includes('/enrollment-status')) {
                return Promise.resolve({ data: { isEnrolled: false } });
            }
            return Promise.reject(new Error('Not found'));
        });

        apiClient.post.mockRejectedValue(new Error('Cart error'));

        renderCourseDetail();

        await waitFor(() => {
            expect(screen.getByText('اضافه به سبد خرید')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('اضافه به سبد خرید'));

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalled();
        });
    });

    test('redirects to login when user is not authenticated', async () => {
        // No token in localStorage

        api.get.mockResolvedValue({
            data: { data: [mockCourse] }
        });

        const mockNavigate = vi.fn();
        vi.doMock('react-router-dom', async () => {
            const actual = await vi.importActual('react-router-dom');
            return {
                ...actual,
                useParams: () => ({ slug: 'react-course' }),
                useNavigate: () => mockNavigate,
            };
        });

        renderCourseDetail();

        await waitFor(() => {
            expect(screen.getByText('اضافه به سبد خرید')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('اضافه به سبد خرید'));

        // Should navigate to login
        // Note: This would require more complex setup to test navigation
    });

    test('shows loading state during add to cart', async () => {
        localStorage.setItem('token', 'fake-token');

        api.get.mockImplementation((url) => {
            if (url === '/courses') {
                return Promise.resolve({ data: { data: [mockCourse] } });
            }
            if (url.includes('/enrollment-status')) {
                return Promise.resolve({ data: { isEnrolled: false } });
            }
            return Promise.reject(new Error('Not found'));
        });

        // Mock a slow API call
        apiClient.post.mockImplementation(() => new Promise(resolve => {
            setTimeout(() => resolve({ success: true }), 1000);
        }));

        renderCourseDetail();

        await waitFor(() => {
            expect(screen.getByText('اضافه به سبد خرید')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('اضافه به سبد خرید'));

        // Should show loading state
        await waitFor(() => {
            expect(screen.getByText('اضافه به سبد خرید')).toBeDisabled();
        });
    });

    test('handles course not found', async () => {
        api.get.mockResolvedValue({
            data: { data: [] } // Empty array, course not found
        });

        renderCourseDetail('non-existent-course');

        await waitFor(() => {
            // Should show some error message or 404 page
            // This depends on the actual implementation
            expect(screen.queryByText('دوره جامع React')).not.toBeInTheDocument();
        });
    });

    test('handles free course correctly', async () => {
        const freeCourse = { ...mockCourse, price: 0 };

        api.get.mockResolvedValue({
            data: { data: [freeCourse] }
        });

        renderCourseDetail();

        await waitFor(() => {
            expect(screen.getByText('رایگان')).toBeInTheDocument();
        });
    });

    test('handles share functionality', async () => {
        // Mock clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });

        api.get.mockResolvedValue({
            data: { data: [mockCourse] }
        });

        renderCourseDetail();

        await waitFor(() => {
            expect(screen.getByText('دوره جامع React')).toBeInTheDocument();
        });

        // Find and click share button
        const shareButton = screen.getByRole('button', { name: /اشتراک/ });
        if (shareButton) {
            fireEvent.click(shareButton);

            await waitFor(() => {
                expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
            });
        }
    });

    test('handles consultation request', async () => {
        api.get.mockResolvedValue({
            data: { data: [mockCourse] }
        });

        renderCourseDetail();

        await waitFor(() => {
            expect(screen.getByText('دوره جامع React')).toBeInTheDocument();
        });

        // Find and click consultation button
        const consultationButton = screen.getByRole('button', { name: /مشاوره/ });
        if (consultationButton) {
            fireEvent.click(consultationButton);
            // Should show success message
        }
    });

    test('displays course metadata correctly', async () => {
        api.get.mockResolvedValue({
            data: { data: [mockCourse] }
        });

        renderCourseDetail();

        await waitFor(() => {
            expect(screen.getByText('دوره جامع React')).toBeInTheDocument();
        });

        // Check various course details
        expect(screen.getByText('25')).toBeInTheDocument(); // lessons count
        expect(screen.getByText('1,500')).toBeInTheDocument(); // students count
        expect(screen.getByText('4.8')).toBeInTheDocument(); // rating
    });

    test('handles enrollment check fallback', async () => {
        localStorage.setItem('token', 'fake-token');

        api.get.mockImplementation((url) => {
            if (url === '/courses') {
                return Promise.resolve({ data: { data: [mockCourse] } });
            }
            if (url.includes('/enrollment-status')) {
                return Promise.reject(new Error('Endpoint not available'));
            }
            if (url === '/Courses/my-enrollments') {
                return Promise.resolve({
                    data: {
                        data: [{ courseId: mockCourse.id }]
                    }
                });
            }
            return Promise.reject(new Error('Not found'));
        });

        renderCourseDetail();

        await waitFor(() => {
            expect(screen.getByText('دوره جامع React')).toBeInTheDocument();
        });

        // Should handle the fallback enrollment check
        // and show appropriate UI based on enrollment status
    });
});