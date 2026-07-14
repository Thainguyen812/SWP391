import { apiClient } from '../api/apiClient';

/**
 * adminService.js
 * Service layer for Admin Dashboard – wraps all backend API calls
 * so AdminDashboard.tsx can stay focused on UI logic.
 */

export const adminService = {
  // ─── DASHBOARD ─────────────────────────────────────────────────────────────

  /**
   * GET /api/dashboard/summary
   * Returns: { totalRevenue, activeSessions, occupancyRate, issues }
   */
  getDashboardSummary: () => apiClient.get('/dashboard/summary'),

  /**
   * GET /api/dashboard/alerts
   * Returns: [{ id, title, description, time, actionText, type }]
   */
  getDashboardAlerts: () => apiClient.get('/dashboard/alerts'),

  // ─── REVENUE ───────────────────────────────────────────────────────────────

  /**
   * GET /api/revenue/charts?month=YYYY-MM
   * Returns: { barData, pieData, totalVehicleRevenue }
   */
  getRevenueCharts: (month) =>
    apiClient.get('/revenue/charts', month ? { params: { month } } : undefined),

  /**
   * GET /api/revenue/transactions?page=N
   * Returns: { total, items[] }
   */
  getRevenueTransactions: (page = 1) =>
    apiClient.get('/revenue/transactions', { params: { page } }),

  /**
   * GET /api/revenue/summary?month=YYYY-MM
   * Returns: { today, thisMonth, projectedYear }
   */
  getRevenueSummary: (month) =>
    apiClient.get('/revenue/summary', month ? { params: { month } } : undefined),

  // ─── PERSONNEL ─────────────────────────────────────────────────────────────

  /**
   * GET /api/personnel/list
   * Returns: [{ id, name, role, status, time, phone, avatar }]
   */
  getPersonnelList: () => apiClient.get('/personnel/list'),

  /**
   * POST /api/personnel/add
   * Body: { username, password, role, ... }
   */
  addPersonnel: (data) => apiClient.post('/personnel/add', data),

  // ─── CUSTOMERS ─────────────────────────────────────────────────────────────

  /**
   * GET /api/customers
   * Returns: [{ id, name, phone, plate, type, status, expireDate, subscriptionId }]
   */
  getCustomers: () => apiClient.get('/customers'),

  /**
   * GET /api/customers/stats
   * Returns: { activeMonthly, activeBlacklist }
   */
  getCustomerStats: () => apiClient.get('/customers/stats'),

  /**
   * GET /api/customers/blacklist
   * Returns: [{ id, cardId, sessionId, reason, notes, blacklistedAt }]
   */
  getBlacklist: () => apiClient.get('/customers/blacklist'),

  // ─── LOGS (AUDIT) ──────────────────────────────────────────────────────────

  /**
   * GET /api/logs?page=N&type=TYPE
   * Returns: { total, items[] }
   */
  getLogs: (params = {}) => apiClient.get('/logs', { params }),

  /**
   * GET /api/logs/stats
   * Returns: { totalLogs, errorCount, warningCount }
   */
  getLogStats: () => apiClient.get('/logs/stats'),

  /**
   * GET /api/logs/export?keyword=&eventType=
   * Returns: CSV blob
   */
  exportLogs: (params = {}) =>
    apiClient.get('/logs/export', { params, responseType: 'blob' }),

  // ─── SECURITY ──────────────────────────────────────────────────────────────

  /**
   * GET /api/security/logs
   * Returns: [{ id, action, user, time, ip }]
   */
  getSecurityLogs: () => apiClient.get('/security/logs'),

  /**
   * GET /api/security/stats
   * Returns: { adminCount, managerCount, staffCount, driverCount, recentChanges }
   */
  getSecurityStats: () => apiClient.get('/security/stats'),

  /**
   * GET /api/security/policies
   * Returns: [{ id, name, description, status }]
   */
  getSecurityPolicies: () => apiClient.get('/security/policies'),

  /**
   * POST /api/security/policies
   * Body: [{ name, status, description }]
   */
  saveSecurityPolicies: (policies) => apiClient.post('/security/policies', policies),

  /**
   * GET /api/security/alerts
   * Returns: [{ id, type, plate, reason, actionable, time }]
   */
  getSecurityAlerts: () => apiClient.get('/security/alerts'),

  /**
   * PUT /api/security/alerts/:id/resolve
   */
  resolveSecurityAlert: (id) => apiClient.put(`/security/alerts/${id}/resolve`),

  // ─── BRANCHES ──────────────────────────────────────────────────────────────

  /**
   * GET /api/branches
   * Returns: [{ id, name, location, manager, capacity, status }]
   */
  getBranches: () => apiClient.get('/branches'),

  /**
   * POST /api/branches
   * Body: { name, location, capacity }
   */
  addBranch: (data) => apiClient.post('/branches', data),

  // ─── USERS (ADMIN) ─────────────────────────────────────────────────────────

  /**
   * GET /api/users
   * Returns: List<User>
   */
  getUsers: () => apiClient.get('/users'),

  /**
   * DELETE /api/users/:id  (ADMIN only)
   */
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
};
