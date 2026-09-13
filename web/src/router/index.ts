// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { authGuard } from './guards';

const routes: RouteRecordRaw[] = [
  // ---- 1. Public Routes (PublicLayout) ----
  {
    path: '/',
    component: () => import('../layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'landing',
        component: () => import('../pages/public/LandingPage.vue'),
        meta: { title: 'Trang chủ' },
      },
      {
        path: 'services',
        name: 'services',
        component: () => import('../pages/public/ServicesPage.vue'),
        meta: { title: 'Bảng giá dịch vụ' },
      },
      {
        path: 'services/:slug',
        name: 'service-detail',
        component: () => import('../pages/public/ServiceDetailPage.vue'),
        meta: { title: 'Chi tiết dịch vụ' },
      },
      {
        path: 'how-it-works',
        name: 'how-it-works',
        component: () => import('../pages/public/HowItWorksPage.vue'),
        meta: { title: 'Quy trình hoạt động' },
      },
      {
        path: 'for-technicians',
        name: 'for-technicians',
        component: () => import('../pages/public/ForTechniciansPage.vue'),
        meta: { title: 'Dành cho Thợ' },
      },
      {
        path: 'pricing-policy',
        name: 'pricing-policy',
        component: () => import('../pages/public/PricingPolicyPage.vue'),
        meta: { title: 'Chính sách giá minh bạch' },
      },
      {
        path: 'track',
        name: 'track',
        component: () => import('../pages/public/TrackOrderPage.vue'),
        meta: { title: 'Tra cứu tiến độ đơn' },
      },
    ],
  },

  // ---- 2. Auth Routes (AuthLayout) ----
  {
    path: '/',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('../pages/auth/LoginPage.vue'),
        meta: { guestOnly: true, title: 'Đăng nhập' },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('../pages/auth/RegisterPage.vue'),
        meta: { guestOnly: true, title: 'Đăng ký tài khoản' },
      },
    ],
  },

  // ---- 3. Customer Routes (CustomerLayout) ----
  {
    path: '/app',
    component: () => import('../layouts/CustomerLayout.vue'),
    meta: { requiresAuth: true, roles: ['CUSTOMER'] },
    children: [
      {
        path: '',
        name: 'customer-dashboard',
        component: () => import('../pages/customer/CustomerDashboard.vue'),
        meta: { title: 'Tổng quan khách hàng' },
      },
      {
        path: 'bookings/new',
        name: 'new-booking',
        component: () => import('../pages/customer/NewBookingWizardPage.vue'),
        meta: { title: 'Đặt lịch sửa chữa' },
      },
      {
        path: 'bookings/:id/candidates',
        name: 'booking-candidates',
        component: () => import('../pages/customer/BookingCandidatesPage.vue'),
        meta: { title: 'Chọn Kỹ thuật viên' },
      },
      {
        path: 'orders',
        name: 'customer-orders',
        component: () => import('../pages/customer/CustomerOrdersPage.vue'),
        meta: { title: 'Đơn của tôi' },
      },
      {
        path: 'orders/:id',
        name: 'customer-order-detail',
        component: () => import('../pages/customer/CustomerOrderDetailPage.vue'),
        meta: { title: 'Chi tiết tiến độ đơn' },
      },
      {
        path: 'warranties',
        name: 'customer-warranties',
        component: () => import('../pages/customer/CustomerWarrantiesPage.vue'),
        meta: { title: 'Bảo hành điện tử' },
      },
      {
        path: 'history',
        name: 'customer-history',
        component: () => import('../pages/customer/CustomerHistoryPage.vue'),
        meta: { title: 'Nhật ký thiết bị gia đình' },
      },
      {
        path: 'profile',
        name: 'customer-profile',
        component: () => import('../pages/customer/CustomerProfilePage.vue'),
        meta: { title: 'Hồ sơ & Sổ địa chỉ' },
      },
    ],
  },

  // ---- 4. Technician Routes (TechnicianLayout) ----
  {
    path: '/tech',
    component: () => import('../layouts/TechnicianLayout.vue'),
    meta: { requiresAuth: true, roles: ['TECHNICIAN'] },
    children: [
      {
        path: '',
        name: 'technician-dashboard',
        component: () => import('../pages/technician/TechnicianDashboard.vue'),
        meta: { title: 'Bàn làm việc Kỹ thuật viên' },
      },
      {
        path: 'invitations',
        name: 'tech-invitations',
        component: () => import('../pages/technician/TechnicianInvitationsPage.vue'),
        meta: { title: 'Hộp thư mời nhận việc' },
      },
      {
        path: 'jobs',
        name: 'tech-jobs',
        component: () => import('../pages/technician/TechnicianJobsPage.vue'),
        meta: { title: 'Đơn được giao' },
      },
      {
        path: 'jobs/:id',
        name: 'tech-job-detail',
        component: () => import('../pages/technician/TechnicianJobDetailPage.vue'),
        meta: { title: 'Workspace thực thi công việc' },
      },
      {
        path: 'earnings',
        name: 'tech-earnings',
        component: () => import('../pages/technician/TechnicianEarningsPage.vue'),
        meta: { title: 'Báo cáo thu nhập' },
      },
      {
        path: 'profile',
        name: 'technician-profile',
        component: () => import('../pages/technician/TechnicianProfilePage.vue'),
        meta: { title: 'Hồ sơ Kỹ thuật viên' },
      },
    ],
  },

  // ---- 5. Console Routes (ConsoleLayout) ----
  {
    path: '/console',
    component: () => import('../layouts/ConsoleLayout.vue'),
    meta: { requiresAuth: true, roles: ['SERVICE_MANAGER', 'ADMIN'] },
    children: [
      {
        path: '',
        name: 'console-dashboard',
        component: () => import('../pages/console/ConsoleDashboard.vue'),
        meta: { title: 'Bảng điều khiển vận hành' },
      },
      {
        path: 'orders',
        name: 'console-orders',
        component: () => import('../pages/console/ConsoleOrdersPage.vue'),
        meta: { title: 'Board đơn sửa chữa' },
      },
      {
        path: 'orders/:id',
        name: 'console-order-detail',
        component: () => import('../pages/console/ConsoleOrderDetailPage.vue'),
        meta: { title: 'Chi tiết & Can thiệp đơn' },
      },
      {
        path: 'technicians',
        name: 'console-technicians',
        component: () => import('../pages/console/ConsoleTechniciansPage.vue'),
        meta: { title: 'Thẩm định Kỹ thuật viên' },
      },
      {
        path: 'cancellations',
        name: 'console-cancellations',
        component: () => import('../pages/console/ConsoleCancellationsPage.vue'),
        meta: { title: 'Huỷ đơn & Khiếu nại' },
      },
      {
        path: 'strikes',
        name: 'console-strikes',
        component: () => import('../pages/console/ConsoleStrikesPage.vue'),
        meta: { title: 'Vi phạm & Đình chỉ' },
      },
      {
        path: 'catalog',
        name: 'console-catalog',
        component: () => import('../pages/console/CatalogManagementPage.vue'),
        meta: { title: 'Quản lý Danh mục & Dịch vụ' },
      },
      {
        path: 'service-areas',
        name: 'console-service-areas',
        component: () => import('../pages/console/ServiceAreasPage.vue'),
        meta: { title: 'Khu vực hoạt động' },
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('../pages/console/admin/AdminUsersPage.vue'),
        meta: { title: 'Quản lý người dùng' },
      },
      {
        path: 'admin/config',
        name: 'admin-config',
        component: () => import('../pages/console/admin/AdminConfigPage.vue'),
        meta: { title: 'Cấu hình hệ thống (24)' },
      },
    ],
  },

  // ---- 6. Error Pages ----
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('../pages/ForbiddenPage.vue'),
    meta: { title: 'Không có quyền truy cập' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFoundPage.vue'),
    meta: { title: '404 Không tìm thấy' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

router.beforeEach(authGuard);

export default router;
