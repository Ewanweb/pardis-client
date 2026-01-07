import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProfileEditModal from '../ProfileEditModal';
import { useAuth } from '../../../context/AuthContext';
import { useProfile } from '../../../hooks/useProfile';

// Mock dependencies
vi.mock('../../../context/AuthContext');
vi.mock('../../../hooks/useProfile');
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    mobile: '09123456789',
    email: 'john@example.com',
    bio: 'Test bio',
    birthDate: '1990-01-01',
    gender: '1',
    address: 'Test address',
    avatarUrl: 'https://example.com/avatar.jpg'
};

const mockUseAuth = {
    user: mockUser,
    fetchUser: vi.fn(),
};

const mockUseProfile = {
    loading: false,
    uploading: false,
    error: null,
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
    clearError: vi.fn(),
};

describe('ProfileEditModal', () => {
    beforeEach(() => {
        useAuth.mockReturnValue(mockUseAuth);
        useProfile.mockReturnValue(mockUseProfile);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('should not render when isOpen is false', () => {
        render(<ProfileEditModal isOpen={false} onClose={vi.fn()} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('should render modal when isOpen is true', () => {
        render(<ProfileEditModal isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('ویرایش پروفایل')).toBeInTheDocument();
    });

    test('should close modal on ESC key press', async () => {
        const onClose = vi.fn();
        render(<ProfileEditModal isOpen={true} onClose={onClose} />);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onClose).toHaveBeenCalled();
    });

    test('should close modal on backdrop click', () => {
        const onClose = vi.fn();
        render(<ProfileEditModal isOpen={true} onClose={onClose} />);

        const backdrop = screen.getByRole('dialog').parentElement;
        fireEvent.click(backdrop);

        expect(onClose).toHaveBeenCalled();
    });

    test('should populate form with user data', () => {
        render(<ProfileEditModal isOpen={true} onClose={vi.fn()} />);

        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('09123456789')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    });

    test('should validate mobile number format', async () => {
        render(<ProfileEditModal isOpen={true} onClose={vi.fn()} />);

        const mobileInput = screen.getByDisplayValue('09123456789');
        fireEvent.change(mobileInput, { target: { value: '123456789' } });

        const saveButton = screen.getByText('ذخیره تغییرات');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('شماره موبایل باید با 09 شروع شده و 11 رقم باشد')).toBeInTheDocument();
        });
    });

    test('should call updateProfile on form submission', async () => {
        mockUseProfile.updateProfile.mockResolvedValue({ success: true });

        render(<ProfileEditModal isOpen={true} onClose={vi.fn()} />);

        const saveButton = screen.getByText('ذخیره تغییرات');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockUseProfile.updateProfile).toHaveBeenCalledWith({
                firstName: 'John',
                lastName: 'Doe',
                mobile: '09123456789',
                bio: 'Test bio',
                birthDate: '1990-01-01',
                gender: 1,
                address: 'Test address'
            });
        });
    });

    test('should prevent closing when there are unsaved changes', () => {
        const onClose = vi.fn();
        window.confirm = vi.fn(() => false);

        render(<ProfileEditModal isOpen={true} onClose={onClose} />);

        // Make a change to trigger unsaved state
        const firstNameInput = screen.getByDisplayValue('John');
        fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

        // Try to close
        const closeButton = screen.getByLabelText('بستن');
        fireEvent.click(closeButton);

        expect(window.confirm).toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    test('should focus first input when modal opens', async () => {
        render(<ProfileEditModal isOpen={true} onClose={vi.fn()} />);

        await waitFor(() => {
            const firstNameInput = screen.getByDisplayValue('John');
            expect(firstNameInput).toHaveFocus();
        }, { timeout: 200 });
    });
});