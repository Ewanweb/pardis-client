-- 📊 اسکریپت‌های SQL برای ایجاد داده‌های نمونه سیستم LMS

-- ===== داده‌های نمونه برای دانشجویان =====

-- فرض: جدول AspNetUsers برای کاربران وجود دارد
INSERT INTO AspNetUsers (Id, UserName, Email, EmailConfirmed, PhoneNumber, PhoneNumberConfirmed, LockoutEnabled, AccessFailedCount, FullName, CreatedAt)
VALUES 
('student-1-guid-here', 'ali.ahmadi', 'ali.ahmadi@example.com', 1, '09123456789', 1, 0, 0, 'علی احمدی', '2024-12-01T10:00:00Z'),
('student-2-guid-here', 'fateme.mohammadi', 'fateme.mohammadi@example.com', 1, '09987654321', 1, 0, 0, 'فاطمه محمدی', '2024-12-01T11:00:00Z'),
('student-3-guid-here', 'mohammad.rezaei', 'mohammad.rezaei@example.com', 1, '09111222333', 1, 0, 0, 'محمد رضایی', '2024-12-01T12:00:00Z'),
('student-4-guid-here', 'sara.hosseini', 'sara.hosseini@example.com', 1, '09444555666', 1, 0, 0, 'سارا حسینی', '2024-12-01T13:00:00Z'),
('student-5-guid-here', 'reza.karimi', 'reza.karimi@example.com', 1, '09777888999', 1, 0, 0, 'رضا کریمی', '2024-12-01T14:00:00Z');

-- ===== داده‌های نمونه برای ثبت‌نام‌ها =====

INSERT INTO CourseEnrollments (Id, CourseId, StudentId, TotalAmount, PaidAmount, PaymentStatus, EnrollmentStatus, EnrollmentDate, IsInstallmentAllowed, InstallmentCount, CreatedAt, UpdatedAt)
VALUES 
('enrollment-1-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'student-1-guid-here', 5000000, 2000000, 1, 0, '2025-01-01T10:00:00Z', 1, 2, GETUTCDATE(), GETUTCDATE()),
('enrollment-2-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'student-2-guid-here', 5000000, 5000000, 2, 0, '2025-01-02T14:30:00Z', 0, 1, GETUTCDATE(), GETUTCDATE()),
('enrollment-3-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'student-3-guid-here', 5000000, 1000000, 3, 1, '2025-01-03T09:15:00Z', 1, 2, GETUTCDATE(), GETUTCDATE()),
('enrollment-4-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'student-4-guid-here', 5000000, 3000000, 1, 0, '2025-01-04T16:20:00Z', 1, 2, GETUTCDATE(), GETUTCDATE()),
('enrollment-5-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'student-5-guid-here', 5000000, 0, 0, 0, '2025-01-05T11:45:00Z', 1, 2, GETUTCDATE(), GETUTCDATE());

-- ===== داده‌های نمونه برای اقساط =====

INSERT INTO InstallmentPayments (Id, EnrollmentId, InstallmentNumber, Amount, PaidAmount, DueDate, Status, CreatedAt, UpdatedAt)
VALUES 
-- اقساط دانشجو 1 (علی احمدی)
('installment-1-1-guid', 'enrollment-1-guid', 1, 2500000, 2000000, '2025-01-15T00:00:00Z', 1, GETUTCDATE(), GETUTCDATE()),
('installment-1-2-guid', 'enrollment-1-guid', 2, 2500000, 0, '2025-02-15T00:00:00Z', 0, GETUTCDATE(), GETUTCDATE()),

-- اقساط دانشجو 2 (فاطمه محمدی) - پرداخت کامل
('installment-2-1-guid', 'enrollment-2-guid', 1, 5000000, 5000000, '2025-01-16T00:00:00Z', 2, GETUTCDATE(), GETUTCDATE()),

-- اقساط دانشجو 3 (محمد رضایی) - معوق
('installment-3-1-guid', 'enrollment-3-guid', 1, 2500000, 1000000, '2024-12-15T00:00:00Z', 1, GETUTCDATE(), GETUTCDATE()),
('installment-3-2-guid', 'enrollment-3-guid', 2, 2500000, 0, '2025-01-15T00:00:00Z', 3, GETUTCDATE(), GETUTCDATE()),

-- اقساط دانشجو 4 (سارا حسینی)
('installment-4-1-guid', 'enrollment-4-guid', 1, 2500000, 2500000, '2025-01-18T00:00:00Z', 2, GETUTCDATE(), GETUTCDATE()),
('installment-4-2-guid', 'enrollment-4-guid', 2, 2500000, 500000, '2025-02-18T00:00:00Z', 1, GETUTCDATE(), GETUTCDATE()),

-- اقساط دانشجو 5 (رضا کریمی) - هنوز پرداخت نکرده
('installment-5-1-guid', 'enrollment-5-guid', 1, 2500000, 0, '2025-01-20T00:00:00Z', 0, GETUTCDATE(), GETUTCDATE()),
('installment-5-2-guid', 'enrollment-5-guid', 2, 2500000, 0, '2025-02-20T00:00:00Z', 0, GETUTCDATE(), GETUTCDATE());

-- ===== داده‌های نمونه برای جلسات اضافی =====

INSERT INTO CourseSessions (Id, CourseId, Title, SessionDate, Duration, SessionNumber, Status, CreatedAt, UpdatedAt)
VALUES 
('session-3-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'جلسه سوم - پروژه عملی', '2025-01-31T17:48:43.620898Z', '02:30:00', 3, 0, GETUTCDATE(), GETUTCDATE()),
('session-4-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'جلسه چهارم - تست و دیباگ', '2026-02-07T17:48:43.620898Z', '02:00:00', 4, 0, GETUTCDATE(), GETUTCDATE()),
('session-5-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'جلسه پنجم - دیپلوی و انتشار', '2026-02-14T17:48:43.620898Z', '01:45:00', 5, 0, GETUTCDATE(), GETUTCDATE());

-- ===== داده‌های نمونه برای حضور و غیاب =====

INSERT INTO StudentAttendances (Id, SessionId, StudentId, Status, CheckInTime, CheckOutTime, Note, CreatedAt, UpdatedAt)
VALUES 
-- حضور جلسه اول
('attendance-1-1-guid', '6806e86c-eca8-43e2-ac89-b49eee646e58', 'student-1-guid-here', 0, '2025-12-17T17:53:00Z', '2025-12-17T19:23:00Z', NULL, GETUTCDATE(), GETUTCDATE()),
('attendance-1-2-guid', '6806e86c-eca8-43e2-ac89-b49eee646e58', 'student-2-guid-here', 2, '2025-12-17T18:03:00Z', '2025-12-17T19:23:00Z', '10 دقیقه تأخیر', GETUTCDATE(), GETUTCDATE()),
('attendance-1-3-guid', '6806e86c-eca8-43e2-ac89-b49eee646e58', 'student-3-guid-here', 1, NULL, NULL, 'غیبت بدون عذر', GETUTCDATE(), GETUTCDATE()),
('attendance-1-4-guid', '6806e86c-eca8-43e2-ac89-b49eee646e58', 'student-4-guid-here', 0, '2025-12-17T17:50:00Z', '2025-12-17T19:23:00Z', NULL, GETUTCDATE(), GETUTCDATE()),
('attendance-1-5-guid', '6806e86c-eca8-43e2-ac89-b49eee646e58', 'student-5-guid-here', 0, '2025-12-17T17:55:00Z', '2025-12-17T19:20:00Z', NULL, GETUTCDATE(), GETUTCDATE()),

-- حضور جلسه دوم
('attendance-2-1-guid', 'f0b339a2-68e4-4dee-8fa9-0894a1ee30c6', 'student-1-guid-here', 0, '2025-12-24T17:50:00Z', '2025-12-24T19:50:00Z', NULL, GETUTCDATE(), GETUTCDATE()),
('attendance-2-2-guid', 'f0b339a2-68e4-4dee-8fa9-0894a1ee30c6', 'student-2-guid-here', 0, '2025-12-24T17:48:00Z', '2025-12-24T19:50:00Z', NULL, GETUTCDATE(), GETUTCDATE()),
('attendance-2-3-guid', 'f0b339a2-68e4-4dee-8fa9-0894a1ee30c6', 'student-3-guid-here', 1, NULL, NULL, 'غیبت بدون اطلاع', GETUTCDATE(), GETUTCDATE()),
('attendance-2-4-guid', 'f0b339a2-68e4-4dee-8fa9-0894a1ee30c6', 'student-4-guid-here', 2, '2025-12-24T18:05:00Z', '2025-12-24T19:50:00Z', '17 دقیقه تأخیر', GETUTCDATE(), GETUTCDATE()),
('attendance-2-5-guid', 'f0b339a2-68e4-4dee-8fa9-0894a1ee30c6', 'student-5-guid-here', 1, NULL, NULL, 'مریض بود', GETUTCDATE(), GETUTCDATE());

-- ===== داده‌های نمونه برای کامنت‌های اضافی =====

INSERT INTO CourseComments (Id, CourseId, UserId, Content, Rating, Status, AdminNote, ReviewedByUserId, ReviewedAt, CreatedAt, UpdatedAt)
VALUES 
('comment-2-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'student-2-guid-here', 'دوره بسیار عالی و مفیدی بود. مدرس خیلی خوب توضیح می‌داد.', 5, 1, NULL, 'admin-user-id', GETUTCDATE(), '2025-12-10T14:30:00Z', GETUTCDATE()),
('comment-3-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'student-4-guid-here', 'محتوای دوره خوب بود اما زمان کلاس‌ها کمی طولانی بود.', 4, 0, NULL, NULL, NULL, '2025-12-12T16:45:00Z', GETUTCDATE()),
('comment-4-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'student-1-guid-here', 'پروژه‌های عملی خیلی کمک کرد تا مطالب رو بهتر یاد بگیرم.', 5, 1, 'نظر بسیار مفیدی بود', 'admin-user-id', GETUTCDATE(), '2025-12-14T10:20:00Z', GETUTCDATE()),
('comment-5-guid', '7f4259d1-ea16-4541-e413-08de34f16021', 'student-5-guid-here', 'کیفیت صدا در جلسات آنلاین مشکل داشت.', 3, 0, NULL, NULL, NULL, '2025-12-15T09:15:00Z', GETUTCDATE());

-- ===== داده‌های نمونه برای پرداخت‌ها =====

INSERT INTO PaymentTransactions (Id, EnrollmentId, InstallmentId, Amount, PaymentMethod, PaymentDate, Status, Description, CreatedAt, UpdatedAt)
VALUES 
('payment-1-guid', 'enrollment-1-guid', 'installment-1-1-guid', 2000000, 'Card', '2025-01-10T15:30:00Z', 'Completed', 'پرداخت قسط اول - کارت بانکی', GETUTCDATE(), GETUTCDATE()),
('payment-2-guid', 'enrollment-2-guid', 'installment-2-1-guid', 5000000, 'Transfer', '2025-01-12T10:45:00Z', 'Completed', 'پرداخت کامل - انتقال بانکی', GETUTCDATE(), GETUTCDATE()),
('payment-3-guid', 'enrollment-3-guid', 'installment-3-1-guid', 1000000, 'Cash', '2024-12-20T14:20:00Z', 'Completed', 'پرداخت جزئی - نقدی', GETUTCDATE(), GETUTCDATE()),
('payment-4-guid', 'enrollment-4-guid', 'installment-4-1-guid', 2500000, 'Card', '2025-01-15T11:30:00Z', 'Completed', 'پرداخت قسط اول کامل', GETUTCDATE(), GETUTCDATE()),
('payment-5-guid', 'enrollment-4-guid', 'installment-4-2-guid', 500000, 'Cash', '2025-02-10T16:15:00Z', 'Completed', 'پرداخت جزئی قسط دوم', GETUTCDATE(), GETUTCDATE());

-- ===== به‌روزرسانی نقش‌های کاربران =====

-- اضافه کردن نقش Student به کاربران
INSERT INTO AspNetUserRoles (UserId, RoleId)
SELECT u.Id, r.Id 
FROM AspNetUsers u
CROSS JOIN AspNetRoles r
WHERE u.Id IN ('student-1-guid-here', 'student-2-guid-here', 'student-3-guid-here', 'student-4-guid-here', 'student-5-guid-here')
AND r.Name = 'Student';

-- ===== محاسبه آمار حضور =====

-- View برای محاسبه آمار حضور هر دانشجو
CREATE VIEW StudentAttendanceStats AS
SELECT 
    e.StudentId,
    e.CourseId,
    u.FullName as StudentName,
    COUNT(sa.Id) as TotalSessions,
    SUM(CASE WHEN sa.Status = 0 THEN 1 ELSE 0 END) as PresentSessions,
    SUM(CASE WHEN sa.Status = 2 THEN 1 ELSE 0 END) as LateSessions,
    SUM(CASE WHEN sa.Status = 1 THEN 1 ELSE 0 END) as AbsentSessions,
    CASE 
        WHEN COUNT(sa.Id) > 0 
        THEN CAST((SUM(CASE WHEN sa.Status IN (0, 2) THEN 1 ELSE 0 END) * 100.0 / COUNT(sa.Id)) AS DECIMAL(5,2))
        ELSE 0 
    END as AttendanceRate
FROM CourseEnrollments e
INNER JOIN AspNetUsers u ON e.StudentId = u.Id
LEFT JOIN StudentAttendances sa ON sa.StudentId = e.StudentId
LEFT JOIN CourseSessions cs ON sa.SessionId = cs.Id AND cs.CourseId = e.CourseId
GROUP BY e.StudentId, e.CourseId, u.FullName;

-- ===== محاسبه آمار مالی =====

-- View برای محاسبه آمار مالی هر دوره
CREATE VIEW CourseFinancialStats AS
SELECT 
    e.CourseId,
    COUNT(e.Id) as TotalStudents,
    SUM(e.TotalAmount) as TotalRevenue,
    SUM(e.PaidAmount) as PaidAmount,
    SUM(e.TotalAmount - e.PaidAmount) as PendingAmount,
    SUM(CASE 
        WHEN EXISTS (
            SELECT 1 FROM InstallmentPayments ip 
            WHERE ip.EnrollmentId = e.Id 
            AND ip.DueDate < GETUTCDATE() 
            AND ip.Status IN (0, 1)
        ) 
        THEN (e.TotalAmount - e.PaidAmount) 
        ELSE 0 
    END) as OverdueAmount,
    CASE 
        WHEN SUM(e.TotalAmount) > 0 
        THEN CAST((SUM(e.PaidAmount) * 100.0 / SUM(e.TotalAmount)) AS DECIMAL(5,2))
        ELSE 0 
    END as PaymentRate
FROM CourseEnrollments e
GROUP BY e.CourseId;

-- ===== نمونه Query های مفید =====

-- لیست دانشجویان با آمار حضور
/*
SELECT 
    u.Id,
    u.FullName,
    u.Email,
    u.PhoneNumber,
    e.EnrollmentDate,
    e.EnrollmentStatus,
    e.PaymentStatus,
    e.TotalAmount,
    e.PaidAmount,
    COALESCE(sas.AttendanceRate, 0) as AttendanceRate
FROM CourseEnrollments e
INNER JOIN AspNetUsers u ON e.StudentId = u.Id
LEFT JOIN StudentAttendanceStats sas ON sas.StudentId = e.StudentId AND sas.CourseId = e.CourseId
WHERE e.CourseId = '7f4259d1-ea16-4541-e413-08de34f16021'
ORDER BY u.FullName;
*/

-- آمار کامنت‌های دوره
/*
SELECT 
    COUNT(*) as TotalComments,
    SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) as PendingComments,
    SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) as ApprovedComments,
    SUM(CASE WHEN Status = 2 THEN 1 ELSE 0 END) as RejectedComments,
    CASE 
        WHEN SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) > 0 
        THEN CAST(AVG(CASE WHEN Status = 1 THEN CAST(Rating as FLOAT) ELSE NULL END) AS DECIMAL(3,2))
        ELSE 0 
    END as AverageRating
FROM CourseComments 
WHERE CourseId = '7f4259d1-ea16-4541-e413-08de34f16021';
*/