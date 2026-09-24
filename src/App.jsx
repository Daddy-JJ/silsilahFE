import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';

import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { api, setToken } from './services/api';
import { getLayoutedElements } from './utils/layout';
import {
  getSmartParentPrefill,
  getChildrenCount,
  hasInferredSpouse,
} from './utils/familyUtils';
import {
  hasSpouseRelation,
  getAllUniqueMarriagePairs,
  getAllSpouses,
} from './utils/marriageUtils';
import { exportTreeAsHTML } from './utils/exportHtml';
import { downloadImage } from './utils/exportImage';

import Navbar from './components/Navbar';
import CustomFamilyNode from './components/CustomFamilyNode';
import TreeStatsWidget from './components/TreeStatsWidget';
import MemberProfileDrawer from './components/MemberProfileDrawer';
import MobileQuickFab from './components/MobileQuickFab';
import AddMemberModal from './components/AddMemberModal';
import EditMemberModal from './components/EditMemberModal';
import PendingApprovalsModal from './components/PendingApprovalsModal';
import CreateTreeModal from './components/CreateTreeModal';
import AuthModal from './components/AuthModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import UserControlPanelModal from './components/UserControlPanelModal';
import OnboardingModal from './components/OnboardingModal';
import UserGuideModal from './components/UserGuideModal';
import CollaboratorsModal from './components/CollaboratorsModal';
import LandingPage from './components/LandingPage';
import AboutFaqModal from './components/AboutFaqModal';
import FeatureLimitModal from './components/FeatureLimitModal';
import SuperAdminModal from './components/SuperAdminModal';
import RenameTreeModal from './components/RenameTreeModal';
import UpgradePlanModal from './components/UpgradePlanModal';
import FeedbackModal from './components/FeedbackModal';
import JumpEdge from './components/edges/JumpEdge';
import KnotNode from './components/KnotNode';
import { NODE_WIDTH, NODE_HEIGHT } from './utils/layout';

import { Layers, Download } from 'lucide-react';
import logoApp from './assets/logo-nexus.svg';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [limitModalConfig, setLimitModalConfig] = useState({
    isOpen: false,
    limitType: 'TREE_LIMIT',
    customMessage: '',
  });

  const openLimitModal = useCallback((limitType, customMessage = '') => {
    setLimitModalConfig({
      isOpen: true,
      limitType,
      customMessage,
    });
  }, []);

  const closeLimitModal = useCallback(() => {
    setLimitModalConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const [trees, setTrees] = useState([]);
  const [currentTree, setCurrentTree] = useState(null);
  const [membersList, setMembersList] = useState([]);
  const [marriagesList, setMarriagesList] = useState([]);
  const [approvalsList, setApprovalsList] = useState([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState(null);

  // Modal & Drawer States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalMode, setAddModalMode] = useState('default');
  const [addModalPrefill, setAddModalPrefill] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isApprovalsOpen, setIsApprovalsOpen] = useState(false);
  const [isCreateTreeOpen, setIsCreateTreeOpen] = useState(false);
  const [isRenameTreeOpen, setIsRenameTreeOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCollaboratorsOpen, setIsCollaboratorsOpen] = useState(false);
  const [isAboutFaqOpen, setIsAboutFaqOpen] = useState(false);
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState(false);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({ token: '', email: '' });
  const [authInitialRegister, setAuthInitialRegister] = useState(false);
  const [authInitialEmail, setAuthInitialEmail] = useState('');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Status Kedaluwarsa Membership Tahunan
  const isPaidPlan = (currentTree?.max_members || 30) > 30 || currentTree?.membership_plan !== 'FREE';
  const subExpiresStr =
    currentTree?.membership_expires_at ||
    currentTree?.subscription_expires_at ||
    (typeof window !== 'undefined' && currentTree?.id
      ? localStorage.getItem(`silsilah_sub_${currentTree.id}`)
      : null);
  const isExpired = useMemo(() => {
    if (!currentTree) return false;
    if (currentTree.membership_status === 'EXPIRED') return true;
    if (currentTree.membership_status === 'LIFETIME' || currentTree.membership_plan === 'FREE') return false;
    if (!isPaidPlan || !subExpiresStr) return false;
    const expDate = new Date(subExpiresStr);
    return !isNaN(expDate.getTime()) && expDate.getTime() < Date.now();
  }, [currentTree, isPaidPlan, subExpiresStr]);

  // Profile Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeMemberProfile, setActiveMemberProfile] = useState(null);

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Registrasi custom node type untuk React Flow
  const nodeTypes = useMemo(
    () => ({
      customFamilyNode: CustomFamilyNode,
      knotNode: KnotNode,
    }),
    []
  );

  // Registrasi custom edge type dengan Line Jump support
  const edgeTypes = useMemo(
    () => ({
      jumpEdge: JumpEdge,
    }),
    []
  );

  // Deteksi jika pengguna membuka link reset password (?reset_token=...&email=...) atau undangan (?invite=...&email=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const resetToken = params.get('reset_token');
      const resetEmail = params.get('email');

      if (resetToken) {
        setResetPasswordData({ token: resetToken, email: resetEmail || '' });
        setIsResetPasswordOpen(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      const inviteToken = params.get('invite');
      const inviteEmail = params.get('email');
      if (inviteToken || inviteEmail) {
        if (inviteEmail) setAuthInitialEmail(inviteEmail);
        setAuthInitialRegister(true);
        setIsAuthOpen(true);
      }
    } catch {
      // Abaikan jika parsing gagal
    }
  }, []);

  // 1. Cek sesi otentikasi awal (Jangan auto-buka modal agar landing page bersih)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.auth.getMe();
        if (res.success && res.data) {
          setCurrentUser(res.data);
          loadTrees();
        }
      } catch {
        // Pengguna tamu: biarkan melihat Landing Page yang bersih
      }
    };
    checkAuth();
  }, []);

  // 2. Ambil daftar pohon pengguna (Multi-Universe)
  const loadTrees = async () => {
    try {
      const res = await api.trees.getUserTrees();
      if (res.success && res.data.length > 0) {
        setTrees(res.data);
        const active = res.data[0];
        setCurrentTree(active);
        loadTreeData(active.id);
      } else {
        setTrees([]);
        setCurrentTree(null);
        setIsOnboardingOpen(true);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // 3. Ambil data visualisasi canvas dan anggota
  const loadTreeData = useCallback(
    async (treeId) => {
      if (!treeId) return;

      try {
        const [canvasRes, membersRes, approvalsRes, marriagesRes] = await Promise.all([
          api.members.getCanvas(treeId),
          api.members.getMembers(treeId),
          api.approvals.getApprovals(treeId, 'PENDING').catch(() => ({ data: [] })),
          api.marriages.getMarriages(treeId).catch(() => ({ data: [] })),
        ]);

        if (canvasRes.success && canvasRes.data) {
          const rawMembers = membersRes.success ? membersRes.data : [];
          const dbMarriages = marriagesRes.success ? marriagesRes.data : [];

          // Inject handler aksi dan seleksi ke dalam setiap node data
          const rawNodes = canvasRes.data.nodes.map((node) => {
            const childrenCount = getChildrenCount(node.id, rawMembers);
            const hasSpouse = hasSpouseRelation(node.id, rawMembers, dbMarriages);

            return {
              ...node,
              data: {
                ...node.data,
                childrenCount,
                hasSpouse,
                isSelected: activeMemberProfile?.id === node.id,
                onSelect: (memberData) => {
                  setActiveMemberProfile(memberData);
                  setIsDrawerOpen(true);
                },
                onEdit: (data) => {
                  setSelectedMember(data);
                  setIsEditModalOpen(true);
                },
                onAddSpouse: (memberData) => {
                  if (rawMembers.length >= (currentTree?.max_members || 30)) {
                    openLimitModal('NODE_LIMIT');
                    return;
                  }
                  setAddModalPrefill({
                    spouseOf: memberData,
                    forceGender: memberData.jenis_kelamin === 'L' ? 'P' : 'L',
                  });
                  setAddModalMode('spouse');
                  setIsAddModalOpen(true);
                },
                onAddChild: (parentData) => {
                  if (rawMembers.length >= (currentTree?.max_members || 30)) {
                    openLimitModal('NODE_LIMIT');
                    return;
                  }
                  if (parentData.forcedAyahId && parentData.forcedIbuId) {
                    setAddModalPrefill({
                      ayah_id: parentData.forcedAyahId,
                      ibu_id: parentData.forcedIbuId,
                    });
                  } else {
                    const prefill = getSmartParentPrefill(parentData, rawMembers);
                    setAddModalPrefill(prefill);
                  }
                  setAddModalMode('child');
                  setIsAddModalOpen(true);
                },
              },
            };
          });

          // Styling arsitektural untuk edge relasi silsilah (orang tua - anak)
          // Hanya dipakai untuk single-parent children (tidak masuk ke knot)
          const styledEdges = (canvasRes.data.edges || []).map((edge) => {
            const sourceNode = rawNodes.find((n) => n.id === edge.source);
            const isAyah = sourceNode?.data?.jenis_kelamin === 'L';

            return {
              ...edge,
              type: 'jumpEdge',
              sourceHandle: 'parent-bottom',
              targetHandle: 'child-top',
              style: {
                stroke: isAyah ? '#18181b' : '#a1a1aa',
                strokeWidth: isAyah ? 2 : 1.5,
                strokeDasharray: isAyah ? 'none' : '5 5',
              },
            };
          });

          // Tata letak hierarki otomatis Top-to-Bottom menggunakan Dagre + Couple-Aware & Order-Aware
          const layouted = getLayoutedElements(rawNodes, styledEdges, 'TB', treeId, dbMarriages);

          // =====================================================================
          // FAMILY KNOT ROUTING (Standar Genealogi: Visio, Ancestry, FamilyEcho)
          // =====================================================================
          // Bangun peta: couple_key → { ayahId, ibuId, children[] }
          const coupleChildrenMap = new Map();
          rawMembers.forEach((member) => {
            if (member.ayah_id && member.ibu_id) {
              const coupleKey = `${member.ayah_id}__${member.ibu_id}`;
              if (!coupleChildrenMap.has(coupleKey)) {
                coupleChildrenMap.set(coupleKey, {
                  ayahId: member.ayah_id,
                  ibuId: member.ibu_id,
                  children: [],
                });
              }
              coupleChildrenMap.get(coupleKey).children.push(member);
            }
          });

          // Track children yang sudah dihandle oleh knot
          const childrenHandledByKnot = new Set();
          // Track pasangan yang sudah punya knot (untuk filter marriage edge horizontal-nya)
          const knotPairs = new Set();

          const knotNodes = [];
          const knotEdges = [];
          const KNOT_SIZE = 24;

          const LINEAGE_COLORS = [
            '#18181b', // Zinc 900 (Hitam - Utama)
            '#2563eb', // Blue 600
            '#059669', // Emerald 600
            '#7c3aed', // Violet 600
            '#e11d48', // Rose 600
            '#0891b2', // Cyan 600
          ];

          let knotIndex = 0;

          coupleChildrenMap.forEach(({ ayahId, ibuId, children }) => {
            const ayahLayoutNode = layouted.nodes.find((n) => n.id === ayahId);
            const ibuLayoutNode = layouted.nodes.find((n) => n.id === ibuId);
            if (!ayahLayoutNode || !ibuLayoutNode) return;

            const knotId = `knot_${ayahId}_${ibuId}`;

            // Periksa apakah pasangan ini adalah bagian dari multi-marriage (>= 3 pasangan)
            const ayahSpouses = getAllSpouses(ayahId, rawMembers, dbMarriages);
            const ibuSpouses = getAllSpouses(ibuId, rawMembers, dbMarriages);
            const isAyahMulti = ayahSpouses.length >= 3;
            const isIbuMulti = ibuSpouses.length >= 3;
            const isMultiMarriage = isAyahMulti || isIbuMulti;

            let knotX, knotY;

            if (isMultiMarriage) {
              // =====================================================================
              // BUSBAR ROUTING PATTERN (Standar Genealogi Poligami / Multi-Pernikahan)
              // =====================================================================
              // Anchor (Suami) berada di kiri atas, partner (Istri) berjejer di sampingnya.
              // Simpul knot diletakkan tepat di celah sisi kiri partner masing-masing.
              const anchorNode = isAyahMulti ? ayahLayoutNode : ibuLayoutNode;
              const partnerNode = isAyahMulti ? ibuLayoutNode : ayahLayoutNode;
              const anchorId = anchorNode.id;
              const partnerId = partnerNode.id;

              const intraGroupSep = 80;
              const midX = partnerNode.position.x - intraGroupSep / 2;
              knotX = midX - KNOT_SIZE / 2;
              knotY = partnerNode.position.y + NODE_HEIGHT / 2 - KNOT_SIZE / 2;

              knotNodes.push({
                id: knotId,
                type: 'knotNode',
                position: { x: knotX, y: knotY },
                data: {
                  ayahId,
                  ibuId,
                },
                draggable: true,
                selectable: true,
              });

              // 1. Garis Busbar Overhead dari Anchor (Suami) -> knot-top (sisi atas simpul)
              knotEdges.push({
                id: `marriage-anchor-${knotId}`,
                source: anchorId,
                sourceHandle: 'spouse-right',
                target: knotId,
                targetHandle: 'knot-top',
                type: 'jumpEdge',
                style: { stroke: '#f59e0b', strokeWidth: 2 },
              });

              // 2. Garis Horizontal dari Simpul (Knot) -> Pasangan (Istri)
              knotEdges.push({
                id: `marriage-partner-${knotId}`,
                source: knotId,
                sourceHandle: 'knot-right',
                target: partnerId,
                targetHandle: 'spouse-left',
                type: 'jumpEdge',
                style: { stroke: '#f59e0b', strokeWidth: 2 },
              });
            } else {
              // =====================================================================
              // STANDARD MONOGAMY / 2-SPOUSE PATTERN (TIDAK BERUBAH)
              // =====================================================================
              const isAyahLeft = ayahLayoutNode.position.x <= ibuLayoutNode.position.x;
              const leftNode = isAyahLeft ? ayahLayoutNode : ibuLayoutNode;
              const rightNode = isAyahLeft ? ibuLayoutNode : ayahLayoutNode;
              const leftId = isAyahLeft ? ayahId : ibuId;
              const rightId = isAyahLeft ? ibuId : ayahId;

              // Posisi knot: Tepat di tengah celah horizontal antar pasangan, sedikit di bawah kotak nama
              const leftEdgeRight = leftNode.position.x + NODE_WIDTH;
              const rightEdgeLeft = rightNode.position.x;
              const midX = (leftEdgeRight + rightEdgeLeft) / 2;
              const parentBottomY = Math.max(leftNode.position.y, rightNode.position.y) + NODE_HEIGHT;

              knotX = midX - KNOT_SIZE / 2;
              knotY = parentBottomY + 8; // Sedikit di bawah kotak nama agar garis silsilah tidak melintas di belakang kartu

              knotNodes.push({
                id: knotId,
                type: 'knotNode',
                position: { x: knotX, y: knotY },
                data: {
                  ayahId,
                  ibuId,
                },
                draggable: true, // Simpul knot bebas digeser oleh pengguna
                selectable: true,
              });

              // 1. Garis dari pasangan Kiri -> Sisi Atas Knot (satu lekukan 90 derajat rapi)
              knotEdges.push({
                id: `marriage-left-${knotId}`,
                source: leftId,
                sourceHandle: 'spouse-right',
                target: knotId,
                targetHandle: 'knot-top',
                type: 'jumpEdge',
                style: { stroke: '#f59e0b', strokeWidth: 2 },
              });

              // 2. Garis dari pasangan Kanan -> Sisi Atas Knot (satu lekukan 90 derajat simetris)
              knotEdges.push({
                id: `marriage-right-${knotId}`,
                source: rightId,
                sourceHandle: 'spouse-left-src',
                target: knotId,
                targetHandle: 'knot-top',
                type: 'jumpEdge',
                style: { stroke: '#f59e0b', strokeWidth: 2 },
              });
            }

            // Dinamis Color Coding & Bus Staggering
            const lineColor = LINEAGE_COLORS[knotIndex % LINEAGE_COLORS.length];
            const busOffset = 20 + (knotIndex % 4) * 8; // Offset vertikal: 20px, 28px, 36px, 44px
            knotIndex++;

            // 3. Garis dari Bawah Knot -> setiap anak (warna dinamis ke handle atas anak)
            children.forEach((child) => {
              childrenHandledByKnot.add(child.id);
              knotEdges.push({
                id: `ke-child-${knotId}-${child.id}`,
                source: knotId,
                sourceHandle: 'knot-bottom',
                target: child.id,
                targetHandle: 'child-top',
                type: 'jumpEdge',
                style: { stroke: lineColor, strokeWidth: 2 },
                data: { busOffset }, // Kirim data offset ke custom edge
              });
            });

            // Tandai pasangan ini sudah memiliki simpul perkawinan
            knotPairs.add(`${ayahId}_${ibuId}`);
            knotPairs.add(`${ibuId}_${ayahId}`);
          });

          // Buat marriage edges HANYA untuk pasangan yang TIDAK punya anak bersama
          // (yang sudah punya anak ditangani oleh knot V-arms di atas)
          const marriagePairs = getAllUniqueMarriagePairs(rawMembers, dbMarriages);
          const marriageEdges = marriagePairs
            .filter(({ spouseA, spouseB }) => {
              return (
                !knotPairs.has(`${spouseA.id}_${spouseB.id}`) &&
                !knotPairs.has(`${spouseB.id}_${spouseA.id}`)
              );
            })
            .map(({ spouseA, spouseB }) => {
              const nodeA = layouted.nodes.find((n) => n.id === spouseA.id);
              const nodeB = layouted.nodes.find((n) => n.id === spouseB.id);
              const isALeft = nodeA && nodeB ? nodeA.position.x <= nodeB.position.x : true;
              const leftId = isALeft ? spouseA.id : spouseB.id;
              const rightId = isALeft ? spouseB.id : spouseA.id;

              return {
                id: `marriage-${leftId}-${rightId}`,
                source: leftId,
                sourceHandle: 'spouse-right',
                target: rightId,
                targetHandle: 'spouse-left',
                type: 'jumpEdge',
                style: { stroke: '#f59e0b', strokeWidth: 2 },
                label: '💍',
                labelStyle: { fill: '#78350f', fontWeight: 800, fontSize: 10, fontFamily: 'monospace' },
                labelBgStyle: { fill: '#fef3c7', stroke: '#f59e0b', strokeWidth: 1 },
              };
            });

          // Filter edge langsung ayah/ibu → anak yang sudah dihandle knot
          // Hanya sisakan edge untuk single-parent children
          const filteredParentEdges = layouted.edges.filter(
            (edge) => !childrenHandledByKnot.has(edge.target)
          );

          setNodes([...layouted.nodes, ...knotNodes]);
          setEdges([...filteredParentEdges, ...marriageEdges, ...knotEdges]);
          setMarriagesList(dbMarriages);

          if (rfInstance) {
            setTimeout(() => {
              rfInstance.fitView({ padding: 0.25, duration: 400 });
            }, 50);
          }
        }

        if (membersRes.success) {
          setMembersList(membersRes.data);
        }

        if (approvalsRes.success) {
          setApprovalsList(approvalsRes.data);
        }
      } catch (err) {
        showNotification(err.message, 'error');
      }
    },
    [setNodes, setEdges, activeMemberProfile, rfInstance, currentTree]
  );

  // Handler Manual: Menata ulang posisi pohon secara otomatis (Re-layout)
  const handleRelayout = useCallback(() => {
    if (!currentTree) return;
    loadTreeData(currentTree.id);
    showNotification('Tata letak silsilah berhasil dirapikan.');
  }, [currentTree, loadTreeData]);

  // Handler Login / Register
  const handleLoginSuccess = async (type, payload) => {
    let res;
    if (type === 'register') {
      res = await api.auth.register(payload);
    } else if (type === 'google') {
      res = await api.auth.googleLogin(payload.credential);
    } else {
      res = await api.auth.login(payload);
    }

    if (res.success && res.data) {
      setToken(res.data.token);
      setCurrentUser(res.data.user);
      setIsAuthOpen(false);
      showNotification(`Sesi aktif: ${res.data.user.nama_lengkap}`);

      const userTrees = await api.trees.getUserTrees().catch(() => ({ data: [] }));
      if (type === 'register' || (!userTrees.data || userTrees.data.length === 0)) {
        setIsOnboardingOpen(true);
      } else {
        loadTrees();
      }
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setTrees([]);
    setCurrentTree(null);
    setNodes([]);
    setEdges([]);
    setIsDrawerOpen(false);
    setActiveMemberProfile(null);
    setIsAuthOpen(false);
  };

  // Handler Onboarding Wizard
  const handleCreateFirstTreeAndMember = async ({ treeName, ancestor, spouse }) => {
    const treeRes = await api.trees.createTree({
      nama_silsilah: treeName,
      max_members: 30,
    });

    if (treeRes.success && treeRes.data) {
      const newTree = treeRes.data;
      const res1 = await api.members.addMember(newTree.id, ancestor);
      if (spouse && res1.success && res1.data) {
        const res2 = await api.members.addMember(newTree.id, spouse);
        if (res2.success && res2.data) {
          // Catat pernikahan ke database (bukan localStorage)
          const maleId = ancestor.jenis_kelamin === 'L' ? res1.data.id : res2.data.id;
          const femaleId = ancestor.jenis_kelamin === 'L' ? res2.data.id : res1.data.id;
          await api.marriages.addMarriage(newTree.id, maleId, femaleId).catch(() => {});
        }
      }
      showNotification(`Semesta "${newTree.nama_silsilah}" berhasil diinisialisasi!`);
      await loadTrees();
    }
  };

  // Handler Tambah Anggota
  const handleAddMember = async (memberData) => {
    if (!currentTree) return;
    if (membersList.length >= (currentTree?.max_members || 30)) {
      openLimitModal('NODE_LIMIT');
      return;
    }

    try {
      const res = await api.members.addMember(currentTree.id, memberData);
      if (res.success) {
        // Jika penambahan melalui mode spouse, catat relasi pernikahan ke database
        if (addModalMode === 'spouse' && addModalPrefill.spouseOf) {
          const existingMember = addModalPrefill.spouseOf;
          const newMember = res.data;
          const maleId = existingMember.jenis_kelamin === 'L' ? existingMember.id : newMember.id;
          const femaleId = existingMember.jenis_kelamin === 'L' ? newMember.id : existingMember.id;
          await api.marriages.addMarriage(currentTree.id, maleId, femaleId).catch(() => {});
        }
        showNotification(`Node "${res.data.nama_lengkap}" berhasil ditambahkan.`);
        await loadTreeData(currentTree.id);
      }
    } catch (err) {
      if (err.message && err.message.includes('Under development')) {
        openLimitModal('NODE_LIMIT', err.message);
      } else {
        showNotification(err.message, 'error');
      }
    }
  };

  // Handler Update Langsung (Admin Utama)
  const handleUpdateDirect = async (memberId, currentVersion, patchData) => {
    if (!currentTree) return;
    const res = await api.members.updateDirect(currentTree.id, memberId, currentVersion, patchData);
    if (res.success) {
      showNotification('Data anggota berhasil diperbarui.');
      await loadTreeData(currentTree.id);
      if (activeMemberProfile?.id === memberId) {
        setActiveMemberProfile(res.data);
      }
    }
  };

  // Handler Usulan Perubahan (Kontributor)
  const handleProposeChange = async (proposalData) => {
    if (!currentTree) return;
    const res = await api.approvals.propose(currentTree.id, proposalData);
    if (res.success) {
      showNotification('Usulan perubahan berhasil dikirimkan ke Admin Utama.');
      await loadTreeData(currentTree.id);
    }
  };

  // Handler Hapus Anggota
  const handleDeleteMember = async (memberId) => {
    if (!currentTree) return;
    const res = await api.members.deleteMember(currentTree.id, memberId);
    if (res.success) {
      showNotification('Anggota silsilah berhasil dihapus.');
      setIsDrawerOpen(false);
      setActiveMemberProfile(null);
      await loadTreeData(currentTree.id);
    }
  };

  // Handler Resolusi Usulan
  const handleResolveApproval = async (approvalId, action, reviewNotes) => {
    if (!currentTree) return;
    const res = await api.approvals.resolve(currentTree.id, approvalId, action, reviewNotes);
    if (res.success) {
      showNotification(
        action === 'APPROVED'
          ? 'Usulan disetujui & versi data dinaikkan.'
          : 'Usulan perubahan ditolak.'
      );
      await loadTreeData(currentTree.id);
    }
  };

  // Handler Buat Pohon Baru
  const handleCreateTree = async (treeData) => {
    const ownedTrees = trees.filter(
      (t) => t.role === 'ADMIN_UTAMA' || t.created_by_user_id === currentUser?.id
    );
    if (ownedTrees.length >= 1) {
      openLimitModal('TREE_LIMIT');
      return;
    }

    try {
      const res = await api.trees.createTree(treeData);
      if (res.success) {
        showNotification(`Semesta "${res.data.nama_silsilah}" berhasil dibuat!`);
        await loadTrees();
      }
    } catch (err) {
      if (err.message && err.message.includes('Under development')) {
        openLimitModal('TREE_LIMIT', err.message);
      } else {
        showNotification(err.message, 'error');
      }
    }
  };

  // Handler Ubah Nama Semesta Pohon
  const handleRenameTree = async ({ nama_silsilah }) => {
    if (!currentTree) return;
    try {
      const res = await api.trees.updateTree(currentTree.id, { nama_silsilah });
      if (res.success) {
        showNotification(`Nama semesta berhasil diubah menjadi "${res.data.nama_silsilah}"!`);
        // Update local state trees & currentTree
        setTrees((prev) =>
          prev.map((t) => (t.id === currentTree.id ? { ...t, nama_silsilah: res.data.nama_silsilah } : t))
        );
        setCurrentTree((prev) => ({ ...prev, nama_silsilah: res.data.nama_silsilah }));
      }
    } catch (err) {
      showNotification(err.message || 'Gagal mengubah nama semesta', 'error');
      throw err;
    }
  };

  // Handler Sukses Pembayaran Upgrade via Duitku Pop
  const handleUpgradeSuccess = async (paymentResult) => {
    if (!currentTree) return;
    try {
      const res = await api.trees.getTreeById(currentTree.id);
      if (res.success && res.data) {
        setCurrentTree(res.data);
      }
      await loadTrees();
    } catch (err) {
      console.error('Gagal menyinkronkan data pohon setelah upgrade:', err);
    }
    // Optimistic fallback update jika backend webhook masih memproses
    if (paymentResult?.targetMaxMembers) {
      const expiresAt =
        paymentResult.subscriptionExpiresAt ||
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const planCode =
        paymentResult.planCode ||
        (paymentResult.targetMaxMembers >= 200 ? 'DINASTI' : 'KELUARGA_BESAR');
      const planName =
        paymentResult.planName ||
        (paymentResult.targetMaxMembers >= 200 ? 'Paket Dinasti' : 'Paket Keluarga Besar');

      const updatedFields = {
        max_members: paymentResult.targetMaxMembers,
        membership_plan: planCode,
        membership_status: 'ACTIVE',
        membership_expires_at: expiresAt,
        subscription_expires_at: expiresAt,
        plan_name: planName,
      };

      setCurrentTree((prev) =>
        prev
          ? {
              ...prev,
              ...updatedFields,
            }
          : prev
      );
      setTrees((prev) =>
        prev.map((t) =>
          t.id === currentTree.id
            ? {
                ...t,
                ...updatedFields,
              }
            : t
        )
      );
    }
  };

  // Jika belum login, tampilkan Landing Page Publik
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onOpenAuth={(isReg = false) => {
            setAuthInitialRegister(isReg);
            setIsAuthOpen(true);
          }}
          onOpenAboutFaq={() => setIsAboutFaqOpen(true)}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          initialRegister={authInitialRegister}
          initialEmail={authInitialEmail}
        />
        <ResetPasswordModal
          isOpen={isResetPasswordOpen}
          onClose={() => setIsResetPasswordOpen(false)}
          token={resetPasswordData.token}
          email={resetPasswordData.email}
          onResetSuccess={(email) => {
            setIsResetPasswordOpen(false);
            setAuthInitialEmail(email);
            setAuthInitialRegister(false);
            setIsAuthOpen(true);
            showNotification('Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.');
          }}
        />
        <AboutFaqModal
          isOpen={isAboutFaqOpen}
          onClose={() => setIsAboutFaqOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="w-full h-dvh min-h-dvh flex flex-col bg-[#f4f4f5] overflow-hidden font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded border text-xs font-mono font-bold uppercase tracking-wider shadow-lg animate-in slide-in-from-bottom-5 duration-200 ${
            notification.type === 'error'
              ? 'bg-rose-950 text-rose-100 border-rose-800'
              : 'bg-zinc-900 text-[#f7e043] border-zinc-700'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Navigasi Utama */}
      <Navbar
        trees={trees}
        currentTree={currentTree}
        onSelectTree={(tree) => {
          setCurrentTree(tree);
          loadTreeData(tree.id);
        }}
        onOpenCreateTree={() => setIsCreateTreeOpen(true)}
        onOpenAddMember={() => {
          if (isExpired) {
            showNotification(
              'Masa aktif langganan tahunan telah berakhir. Silakan perpanjang untuk menambah anggota baru.',
              'error'
            );
            setIsUpgradeOpen(true);
            return;
          }
          setAddModalPrefill({});
          setAddModalMode('default');
          setIsAddModalOpen(true);
        }}
        onOpenRenameTree={() => setIsRenameTreeOpen(true)}
        onOpenApprovals={() => setIsApprovalsOpen(true)}
        onOpenCollaborators={() => setIsCollaboratorsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAboutFaq={() => setIsAboutFaqOpen(true)}
        pendingCount={approvalsList.length}
        user={currentUser}
        onLogout={handleLogout}
        memberCount={membersList.length}
        maxMembers={currentTree?.max_members || 30}
        onOpenLimitModal={openLimitModal}
        onOpenSuperAdmin={() => setIsSuperAdminOpen(true)}
        onOpenUserPanel={() => setIsUserPanelOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Banner Peringatan Langganan Tahunan Kedaluwarsa */}
      {isExpired && (
        <div className="bg-amber-400 text-black px-4 py-2 border-b border-amber-500 flex items-center justify-between text-xs font-mono font-bold z-20 shrink-0 shadow-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="text-base">⚠️</span>
            <span className="truncate">
              Masa aktif langganan tahunan pohon ini telah kedaluwarsa. Fitur penambahan anggota baru dialihkan sementara ke mode lihat (read-only).
            </span>
          </div>
          {currentTree?.role === 'ADMIN_UTAMA' && (
            <button
              type="button"
              onClick={() => setIsUpgradeOpen(true)}
              className="ml-3 px-3 py-1 bg-zinc-900 hover:bg-black text-[#f7e043] rounded uppercase text-[10px] font-black tracking-wider transition-all shrink-0 cursor-pointer shadow-xs"
            >
              Perpanjang Langganan
            </button>
          )}
        </div>
      )}

      {/* Area Canvas Interaktif React Flow */}
      <main className="flex-1 w-full h-full relative min-h-0">
        {/* Floating Overview Widget — hidden on short viewports (HP landscape) */}
        {currentTree && (
          <div className="[@media(max-height:500px)]:hidden">
            <TreeStatsWidget
              currentTree={currentTree}
              treeName={currentTree.nama_silsilah}
              members={membersList}
              pendingCount={approvalsList.length}
              maxMembers={currentTree.max_members || 30}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
            />
          </div>
        )}

        {/* Floating Center Control: Tombol Rapikan Layout */}
        {nodes.length > 0 && (
          <div className="hidden sm:flex absolute top-2 [@media(min-height:501px)]:top-4 left-1/2 -translate-x-1/2 z-10 items-center">
            <button
              type="button"
              onClick={handleRelayout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white/95 backdrop-blur-xs border border-zinc-300 hover:border-zinc-900 hover:bg-white text-zinc-800 text-xs font-mono font-bold uppercase tracking-wider shadow-xs transition-all"
              title="Susun ulang diagram silsilah dari atas ke bawah secara otomatis"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-600" />
              <span>Rapikan Layout</span>
            </button>
          </div>
        )}

        {/* Floating Right Actions: Ekspor */}
        {nodes.length > 0 && (
          <div className="hidden sm:flex absolute top-2 [@media(min-height:501px)]:top-4 right-4 z-10 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  downloadImage(getNodesBounds, getViewportForBounds, nodes, 'png', currentTree?.nama_silsilah || 'Keluarga');
                  showNotification('Mengekspor gambar beresolusi tinggi...');
                } catch (e) {
                  showNotification(e.message, 'error');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/95 backdrop-blur-xs border border-zinc-300 hover:border-zinc-900 hover:bg-white text-zinc-800 text-xs font-mono font-bold uppercase tracking-wider shadow-xs transition-all"
              title="Unduh visualisasi silsilah dalam resolusi tinggi (PNG)"
            >
              <Download className="w-3.5 h-3.5 text-zinc-600" />
              <span>Ekspor PNG</span>
            </button>
            <button
              type="button"
              onClick={() => exportTreeAsHTML(nodes, edges, currentTree?.nama_silsilah || 'Keluarga')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/95 backdrop-blur-xs border border-zinc-300 hover:border-zinc-900 hover:bg-white text-zinc-800 text-xs font-mono font-bold uppercase tracking-wider shadow-xs transition-all"
              title="Unduh silsilah dalam format HTML statis untuk dicetak"
            >
              <Download className="w-3.5 h-3.5 text-zinc-600" />
              <span>Ekspor HTML</span>
            </button>
          </div>
        )}

        {/* State Kosong */}
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-5 select-none">
            <img
              src={logoApp}
              alt="Logo Silsilah"
              className="w-16 h-16 object-contain rounded-xl mb-3 shadow-sm"
            />
            <h2 className="text-base font-black uppercase tracking-wider text-zinc-900 mb-1">
              {currentTree ? currentTree.nama_silsilah : 'Belum Ada Semesta Terpilih'}
            </h2>
            <p className="text-xs font-mono text-zinc-500 max-w-sm mb-4">
              Canvas kosong. Mulai tambahkan leluhur pertama untuk membangun pohon silsilah keluarga.
            </p>
            <div className="flex items-center gap-2">
              {['ADMIN_UTAMA', 'KONTRIBUTOR'].includes(currentTree?.role) && (
                <button
                  type="button"
                  onClick={() => {
                    setAddModalPrefill({});
                    setAddModalMode('default');
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-black text-[#f7e043] text-xs font-mono font-bold uppercase tracking-wider rounded transition-colors shadow-xs"
                >
                  + Tambah Leluhur Pertama
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="px-4 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 text-xs font-mono font-bold uppercase tracking-wider rounded transition-colors"
              >
                Buku Panduan UX (?)
              </button>
            </div>
          </div>
        ) : null}

        {/* Canvas React Flow dengan Gestur Mobile & Touch Support */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onInit={setRfInstance}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          // Mobile-first & Trackpad touch gestures
          panOnDrag={[1, 2]}
          panOnScroll={true} // Memungkinkan geser canvas pakai 2 jari di trackpad (scroll)
          zoomOnPinch={true}
          zoomOnScroll={false} // Matikan zoom via scroll biasa agar tidak bertabrakan dengan panOnScroll (zoom tetap bisa via pinch)
          minZoom={0.15}
          maxZoom={2.5}
          className="bg-[#f4f4f5]"
        >
          <Controls
            position="bottom-left"
            showInteractive={false}
            showFitView={true}
            fitViewOptions={{ padding: 0.25, duration: 400 }}
          />
          <MiniMap
            position="bottom-right"
            zoomable
            pannable
            maskColor="rgba(24, 24, 27, 0.32)"
            maskStrokeColor="#f59e0b"
            maskStrokeWidth={3}
            nodeColor={(n) => (n.data?.jenis_kelamin === 'L' ? '#18181b' : '#71717a')}
            className="hidden md:block [@media(max-height:500px)]:hidden"
          />
        </ReactFlow>

        {/* Mobile Floating Action Button (FAB) */}
        <MobileQuickFab
          canAdd={
            !isExpired &&
            ['ADMIN_UTAMA', 'KONTRIBUTOR'].includes(currentTree?.role) &&
            membersList.length < (currentTree?.max_members || 30)
          }
          onAddMember={() => {
            if (isExpired) {
              showNotification(
                'Masa aktif langganan tahunan telah berakhir. Silakan perpanjang untuk menambah anggota baru.',
                'error'
              );
              setIsUpgradeOpen(true);
              return;
            }
            setAddModalPrefill({});
            setAddModalMode('default');
            setIsAddModalOpen(true);
          }}
          onRelayout={handleRelayout}
          onOpenApprovals={() => setIsApprovalsOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenCollaborators={() => setIsCollaboratorsOpen(true)}
          onOpenAboutFaq={() => setIsAboutFaqOpen(true)}
          onOpenUpgrade={() => setIsUpgradeOpen(true)}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          pendingCount={approvalsList.length}
        />
      </main>

      {/* Detail Kartu Anggota: Profile Drawer / Sidebar */}
      <MemberProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setActiveMemberProfile(null);
        }}
        member={activeMemberProfile}
        allMembers={membersList}
        marriages={marriagesList}
        treeId={currentTree?.id}
        userRole={currentTree?.role}
        onReorderChildren={() => currentTree && loadTreeData(currentTree.id)}
        onLinkSpouse={async (memberId, spouseId) => {
          if (!currentTree) return;
          const memberA = membersList.find(m => m.id === memberId);
          const memberB = membersList.find(m => m.id === spouseId);
          if (!memberA || !memberB) return;
          const maleId = memberA.jenis_kelamin === 'L' ? memberA.id : memberB.id;
          const femaleId = memberA.jenis_kelamin === 'L' ? memberB.id : memberA.id;
          await api.marriages.addMarriage(currentTree.id, maleId, femaleId).catch(() => {});
          await loadTreeData(currentTree.id);
        }}
        onUnlinkSpouse={async (marriageId) => {
          if (!currentTree || !marriageId) return;
          await api.marriages.deleteMarriage(currentTree.id, marriageId).catch(() => {});
          await loadTreeData(currentTree.id);
        }}
        onEditMember={(m) => {
          setSelectedMember(m);
          setIsEditModalOpen(true);
        }}
        onAddSpouse={(m) => {
          if (membersList.length >= (currentTree?.max_members || 30)) {
            openLimitModal('NODE_LIMIT');
            return;
          }
          setAddModalPrefill({
            spouseOf: m,
            forceGender: m.jenis_kelamin === 'L' ? 'P' : 'L',
          });
          setAddModalMode('spouse');
          setIsAddModalOpen(true);
        }}
        onAddChild={(m) => {
          if (membersList.length >= (currentTree?.max_members || 30)) {
            openLimitModal('NODE_LIMIT');
            return;
          }
          const prefill = getSmartParentPrefill(m, membersList);
          setAddModalPrefill(prefill);
          setAddModalMode('child');
          setIsAddModalOpen(true);
        }}
        onDeleteMember={handleDeleteMember}
        onSelectMember={(target) => {
          setActiveMemberProfile(target);
          // Fokuskan canvas ke node yang dipilih jika rfInstance tersedia
          const targetNode = nodes.find((n) => n.id === target.id);
          if (targetNode && rfInstance) {
            rfInstance.setCenter(targetNode.position.x + 130, targetNode.position.y + 70, {
              zoom: 1,
              duration: 500,
            });
          }
        }}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRegister={authInitialRegister}
        initialEmail={authInitialEmail}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userName={currentUser?.nama_lengkap || 'Pengguna Baru'}
        onCreateFirstTreeAndMember={handleCreateFirstTreeAndMember}
      />

      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
        members={membersList}
        prefill={addModalPrefill}
        mode={addModalMode}
      />

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={selectedMember}
        userRole={currentTree?.role}
        members={membersList}
        onUpdateDirect={handleUpdateDirect}
        onProposeChange={handleProposeChange}
        onDeleteMember={handleDeleteMember}
      />

      <PendingApprovalsModal
        isOpen={isApprovalsOpen}
        onClose={() => setIsApprovalsOpen(false)}
        approvals={approvalsList}
        userRole={currentTree?.role}
        onResolve={handleResolveApproval}
        onRefresh={() => currentTree && loadTreeData(currentTree.id)}
      />

      <CreateTreeModal
        isOpen={isCreateTreeOpen}
        onClose={() => setIsCreateTreeOpen(false)}
        onCreateTree={handleCreateTree}
      />

      <RenameTreeModal
        isOpen={isRenameTreeOpen}
        onClose={() => setIsRenameTreeOpen(false)}
        currentTree={currentTree}
        onRenameTree={handleRenameTree}
      />

      <CollaboratorsModal
        isOpen={isCollaboratorsOpen}
        onClose={() => setIsCollaboratorsOpen(false)}
        currentTree={currentTree}
        onCollaboratorAdded={() => currentTree && loadTreeData(currentTree.id)}
        onOpenLimitModal={openLimitModal}
      />

      <AboutFaqModal
        isOpen={isAboutFaqOpen}
        onClose={() => setIsAboutFaqOpen(false)}
      />

      <SuperAdminModal
        isOpen={isSuperAdminOpen}
        onClose={() => setIsSuperAdminOpen(false)}
        currentUser={currentUser}
        showNotification={showNotification}
      />

      <UserControlPanelModal
        isOpen={isUserPanelOpen}
        onClose={() => setIsUserPanelOpen(false)}
        user={currentUser}
        trees={trees}
        currentTree={currentTree}
        onSelectTree={(tree) => {
          setCurrentTree(tree);
          loadTreeData(tree.id);
        }}
        onUserUpdated={(updatedUser) => {
          setCurrentUser(updatedUser);
          showNotification('Profil akun berhasil diperbarui!');
        }}
        onLogout={handleLogout}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        token={resetPasswordData.token}
        email={resetPasswordData.email}
        onResetSuccess={(email) => {
          setIsResetPasswordOpen(false);
          setAuthInitialEmail(email);
          setAuthInitialRegister(false);
          setIsAuthOpen(true);
          showNotification('Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.');
        }}
      />

      {/* Pop-up Batasan Fitur Fase Awal (Under Development) */}
      <FeatureLimitModal
        isOpen={limitModalConfig.isOpen}
        onClose={closeLimitModal}
        limitType={limitModalConfig.limitType}
        customMessage={limitModalConfig.customMessage}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      {/* Modal Upgrade Kuota & Paket Silsilah (Duitku Pop Sandbox) */}
      <UpgradePlanModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentTree={currentTree}
        onUpgradeSuccess={handleUpgradeSuccess}
        showNotification={showNotification}
      />

      {/* Modal Beri Masukan & Usulan Fitur Pengguna */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        user={currentUser}
        showNotification={showNotification}
      />
    </div>
  );
}
