const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function getToken() {
  return localStorage.getItem('silsilah_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('silsilah_token', token);
  } else {
    localStorage.removeItem('silsilah_token');
  }
}

async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (networkError) {
    throw new Error(
      'Koneksi gagal: Tidak dapat menghubungi server backend. Pastikan server backend pada port 5000 aktif.'
    );
  }

  // Periksa apakah Vite proxy mengembalikan 502/504 Bad Gateway (backend offline)
  if (response.status === 502 || response.status === 504) {
    throw new Error(
      'Server backend (Port 5000) belum dijalankan. Silakan jalankan perintah "npm run dev" di dalam folder silsilah-backend.'
    );
  }

  const contentType = response.headers.get('content-type') || '';
  let resJson = null;

  if (contentType.includes('application/json')) {
    try {
      resJson = await response.json();
    } catch {
      resJson = null;
    }
  }

  if (!resJson) {
    const rawText = await response.text().catch(() => '');
    if (!response.ok) {
      throw new Error(
        `Server mengembalikan galat HTTP ${response.status}: ${
          rawText.slice(0, 120) || 'Format respon tidak valid'
        }`
      );
    }
    return { success: true, data: rawText };
  }

  if (!response.ok) {
    const error = new Error(resJson.message || 'Terjadi kesalahan pada permintaan');
    error.status = response.status;
    error.data = resJson;
    throw error;
  }

  return resJson;
}

export const api = {
  auth: {
    login: (credentials) =>
      fetchWithAuth('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) =>
      fetchWithAuth('/auth/register', { method: 'POST', body: userData }),
    googleLogin: (credential) =>
      fetchWithAuth('/auth/google', { method: 'POST', body: { credential } }),
    getMe: () => fetchWithAuth('/auth/me'),
  },
  trees: {
    getUserTrees: () => fetchWithAuth('/trees'),
    getTreeById: (treeId) => fetchWithAuth(`/trees/${treeId}`),
    createTree: (treeData) =>
      fetchWithAuth('/trees', { method: 'POST', body: treeData }),
    updateTree: (treeId, treeData) =>
      fetchWithAuth(`/trees/${treeId}`, { method: 'PUT', body: treeData }),
    getCollaborators: (treeId) =>
      fetchWithAuth(`/trees/${treeId}/collaborators`),
    addCollaborator: (treeId, data) =>
      fetchWithAuth(`/trees/${treeId}/collaborators`, { method: 'POST', body: data }),
  },
  members: {
    getCanvas: (treeId) => fetchWithAuth(`/trees/${treeId}/canvas`),
    getMembers: (treeId) => fetchWithAuth(`/trees/${treeId}/members`),
    addMember: (treeId, memberData) =>
      fetchWithAuth(`/trees/${treeId}/members`, { method: 'POST', body: memberData }),
    updateDirect: (treeId, memberId, version, patchData) =>
      fetchWithAuth(`/trees/${treeId}/members/${memberId}`, {
        method: 'PUT',
        body: { version, patch_data: patchData },
      }),
    deleteMember: (treeId, memberId) =>
      fetchWithAuth(`/trees/${treeId}/members/${memberId}`, { method: 'DELETE' }),
  },
  approvals: {
    getApprovals: (treeId, status = 'PENDING') =>
      fetchWithAuth(`/trees/${treeId}/approvals?status=${status}`),
    propose: (treeId, data) =>
      fetchWithAuth(`/trees/${treeId}/approvals`, { method: 'POST', body: data }),
    resolve: (treeId, approvalId, action, reviewNotes) =>
      fetchWithAuth(`/trees/${treeId}/approvals/${approvalId}/resolve`, {
        method: 'POST',
        body: { action, review_notes: reviewNotes },
      }),
  },
  marriages: {
    getMarriages: (treeId) =>
      fetchWithAuth(`/trees/${treeId}/marriages`),
    addMarriage: (treeId, suamiId, istriId, tanggalPernikahan = null) =>
      fetchWithAuth(`/trees/${treeId}/marriages`, {
        method: 'POST',
        body: { suami_id: suamiId, istri_id: istriId, tanggal_pernikahan: tanggalPernikahan },
      }),
    deleteMarriage: (treeId, marriageId) =>
      fetchWithAuth(`/trees/${treeId}/marriages/${marriageId}`, { method: 'DELETE' }),
  },
  admin: {
    getStats: () => fetchWithAuth('/admin/stats'),
  },
};
