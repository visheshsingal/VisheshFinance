'use client';
import React, { useState, useEffect } from 'react';
import API from '@/lib/api';
import {
  Menu,
  X,
  RefreshCw,
  LogOut,
  Users,
  CreditCard,
  FileText,
  Calendar,
  Plus,
  Search,
  User,
  Bank,
  ArrowRight,
  ArrowLeft,
  Clipboard,
  Archive,
  Wallet
} from 'lucide-react';

export default function UserDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('other');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    totalAmount: '',
    paidAmount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'cash',
    bankName: '',
    notes: ''
  });
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentDateFrom, setPaymentDateFrom] = useState('');
  const [paymentDateTo, setPaymentDateTo] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [otherForm, setOtherForm] = useState({
    title: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'cash',
    bankName: '',
    notes: ''
  });
  const [expenseForm, setExpenseForm] = useState({
    expenseType: 'main',
    category: 'Electricity Bill',
    customTitle: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    purpose: '',
    givenBy: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fees, setFees] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState('payment');
  const [entrySearch, setEntrySearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const mainExpenseCategories = ['Electricity Bill', 'Office Rent', 'Staff Salary'];

  const fetchFees = async () => {
    try {
      setLoading(true);
      const feeRes = await API.get('/fees');
      setFees(feeRes.data || []);
    } catch (err) {
      setError('Unable to load receipt entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const expRes = await API.get('/expenses');
      setExpenses(expRes.data || []);
    } catch (err) {
      setError('Unable to load office expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const withRes = await API.get('/withdrawals');
      setWithdrawals(withRes.data || []);
    } catch (err) {
      setError('Unable to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, studentRes] = await Promise.all([
          API.get('/courses'),
          API.get('/students')
        ]);
        setCourses(courseRes.data || []);
        setStudents(studentRes.data || []);
        await Promise.all([fetchFees(), fetchExpenses(), fetchWithdrawals()]);
      } catch (err) {
        setError('Unable to load batches, students, receipts, expenses, or withdrawals');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase();
    return !query || course.name?.toLowerCase().includes(query);
  });

  const activeCourse = courses.find(course => course._id === selectedCourseId) || null;

  const batchPaymentFees = selectedCourseId
    ? fees.filter(fee => {
        const courseId = fee.student?.course?._id || fee.student?.course || '';
        return courseId === selectedCourseId && fee.receiptType !== 'other';
      })
    : [];

  const filteredBatchPaymentFees = batchPaymentFees.filter(fee => {
    const search = paymentSearch.toLowerCase();
    const matchesSearch = !search ||
      fee.student?.name?.toLowerCase().includes(search) ||
      fee.student?.course?.name?.toLowerCase().includes(search) ||
      fee.student?.classId?.toLowerCase().includes(search) ||
      fee.method?.toLowerCase().includes(search) ||
      (fee.paidAmount || fee.amount || 0).toString().includes(search) ||
      (fee.totalAmount || 0).toString().includes(search) ||
      (fee.bankName || '').toLowerCase().includes(search);

    const feeDate = fee.date ? new Date(fee.date) : null;
    let matchesFrom = true;
    let matchesTo = true;
    if (paymentDateFrom && feeDate) {
      const start = new Date(paymentDateFrom);
      start.setHours(0, 0, 0, 0);
      matchesFrom = feeDate >= start;
    }
    if (paymentDateTo && feeDate) {
      const end = new Date(paymentDateTo);
      end.setHours(23, 59, 59, 999);
      matchesTo = feeDate <= end;
    }
    if ((paymentDateFrom || paymentDateTo) && !feeDate) {
      return false;
    }

    return matchesSearch && matchesFrom && matchesTo;
  });

  const selectedStudentReceipts = selectedStudent
    ? fees.filter(fee => fee.student?._id === selectedStudent._id)
    : [];

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '';

  const formatPaymentDate = (date) => date
    ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const getStudentFeeRecords = (studentId) => fees.filter(fee => {
    const id = fee.student?._id || fee.student;
    return id === studentId && fee.receiptType !== 'other';
  });

  const getExistingTotalAmount = (studentId) => {
    const studentFees = getStudentFeeRecords(studentId);
    return studentFees[0]?.totalAmount || 0;
  };

  const getTotalPaidSoFar = (studentId) => getStudentFeeRecords(studentId)
    .reduce((sum, fee) => sum + (fee.amount || fee.paidAmount || 0), 0);

  const batchStudents = selectedCourseId
    ? students.filter(student => student.course?._id === selectedCourseId)
    : [];

  const filteredFees = fees.filter(fee => {
    const search = entrySearch.toLowerCase();
    const receiptName = fee.receiptType === 'other'
      ? `${fee.title || ''} ${fee.description || ''}`
      : `${fee.student?.name || ''} ${fee.student?.course?.name || ''} ${fee.student?.classId || ''}`;
    const matchesSearch = !search ||
      receiptName.toLowerCase().includes(search) ||
      (fee.method || '').toLowerCase().includes(search) ||
      (fee.bankName || '').toLowerCase().includes(search);
    const invoiceDate = fee.date ? new Date(fee.date) : null;
    const matchesFrom = !dateFrom || (invoiceDate && invoiceDate >= new Date(dateFrom));
    const matchesTo = !dateTo || (invoiceDate && invoiceDate <= new Date(dateTo));
    return matchesSearch && matchesFrom && matchesTo;
  });

  const filteredOtherFees = filteredFees.filter(fee => fee.receiptType === 'other');

  const filteredExpenses = expenses.filter(exp => {
    const search = entrySearch.toLowerCase();
    const matchesSearch = !search ||
      (exp.type || '').toLowerCase().includes(search) ||
      (exp.notes || '').toLowerCase().includes(search) ||
      (exp.amount || 0).toString().includes(search);

    const expDate = exp.date ? new Date(exp.date) : null;
    const matchesFrom = !dateFrom || (expDate && expDate >= new Date(dateFrom));
    const matchesTo = !dateTo || (expDate && expDate <= new Date(dateTo));

    return matchesSearch && matchesFrom && matchesTo;
  });

  const filteredMainExpenses = filteredExpenses.filter(exp => mainExpenseCategories.includes(exp.type));
  const filteredOtherExpenses = filteredExpenses.filter(exp => !mainExpenseCategories.includes(exp.type));

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const search = entrySearch.toLowerCase();
    const matchesSearch = !search ||
      (withdrawal.purpose || '').toLowerCase().includes(search) ||
      (withdrawal.givenBy || '').toLowerCase().includes(search) ||
      (withdrawal.amount || 0).toString().includes(search) ||
      (withdrawal.notes || '').toLowerCase().includes(search);

    const withDate = withdrawal.date ? new Date(withdrawal.date) : null;
    const matchesFrom = !dateFrom || (withDate && withDate >= new Date(dateFrom));
    const matchesTo = !dateTo || (withDate && withDate <= new Date(dateTo));

    return matchesSearch && matchesFrom && matchesTo;
  });

  const downloadPaymentCsv = () => {
    if (!filteredBatchPaymentFees.length) {
      setError('No payment receipts available for download');
      setMessage('');
      return;
    }
    const headers = [
      'Student Name',
      'Enrolled Batch',
      'Batch Code',
      'Payment Date',
      'Amount Received (INR)',
      'Payment Mode',
      'Bank or Cash Account',
      'Total Course Fees (INR)',
      'Total Paid So Far (INR)',
      'Remaining Due (INR)'
    ];
    const rows = filteredBatchPaymentFees.map(fee => {
      const studentId = fee.student?._id || fee.student;
      const studentFees = getStudentFeeRecords(studentId);
      const total = fee.totalAmount || fee.amount || 0;
      const receivedAmount = fee.paidAmount || fee.amount || 0;
      const totalPaid = studentFees.reduce((sum, item) => sum + (item.amount || item.paidAmount || 0), 0);
      const remainingDue = Math.max(0, total - totalPaid);
      const methodLabel = fee.method === 'cash' ? 'Cash' : (fee.method === 'upi' ? 'UPI' : 'Bank Transfer');

      return [
        fee.student?.name || '—',
        fee.student?.course?.name || activeCourse?.name || '—',
        fee.student?.classId || '—',
        formatDate(fee.date),
        receivedAmount,
        methodLabel,
        fee.bankName || '—',
        total,
        totalPaid,
        remainingDue
      ];
    });
    const batchSlug = (activeCourse?.name || 'batch').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    const csvContent = [headers, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payment_receipts_${batchSlug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setError('');
  };

  const downloadCsv = () => {
    if (!filteredOtherFees.length) {
      setError('No receipts available for download');
      return;
    }
    const headers = ['Date', 'Title', 'Description', 'Amount', 'Method', 'Bank'];
    const rows = filteredOtherFees.map(fee => [
      formatDate(fee.date),
      fee.title || 'Other Receipt',
      fee.description || '',
      fee.paidAmount || fee.amount || 0,
      fee.method?.toUpperCase() || 'CASH',
      fee.bankName || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `other_receipts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadExpensesCsv = (isMain) => {
    const list = isMain ? filteredMainExpenses : filteredOtherExpenses;
    if (!list.length) {
      setError('No expenses available for download');
      return;
    }
    const headers = ['Date', 'Classification', 'Amount', 'Notes'];
    const rows = list.map(exp => [
      formatDate(exp.date),
      exp.type || '',
      exp.amount || 0,
      exp.notes || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${isMain ? 'main' : 'other'}_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadWithdrawalsCsv = () => {
    if (!filteredWithdrawals.length) {
      setError('No withdrawals available for download');
      return;
    }
    const headers = ['Date', 'Purpose', 'Given By/Authorized By', 'Amount', 'Notes'];
    const rows = filteredWithdrawals.map(w => [
      formatDate(w.date),
      w.purpose || '',
      w.givenBy || '',
      w.amount || 0,
      w.notes || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `withdrawals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBatchSelect = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedStudent(null);
    setPaymentSearch('');
    setPaymentDateFrom('');
    setPaymentDateTo('');
    setShowModal(false);
    setMessage('');
    setError('');
  };

  const handleBackToBatches = () => {
    setSelectedCourseId('');
    setSelectedStudent(null);
    setPaymentSearch('');
    setPaymentDateFrom('');
    setPaymentDateTo('');
    setShowModal(false);
    setMessage('');
    setError('');
  };

  const buildPaymentFormForStudent = (student) => {
    const existingTotal = getExistingTotalAmount(student._id);
    return {
      totalAmount: existingTotal ? String(existingTotal) : '',
      paidAmount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'cash',
      bankName: '',
      notes: ''
    };
  };

  const handleStudentSelect = (student) => {
    if (!student?._id) return;
    setSelectedStudent(student);
    setPaymentForm(buildPaymentFormForStudent(student));
    setModalTab('payment');
    setShowModal(true);
    setMessage('');
    setError('');
  };

  const openRecordPaymentModal = () => {
    setSelectedStudent(null);
    setPaymentForm({
      totalAmount: '',
      paidAmount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'cash',
      bankName: '',
      notes: ''
    });
    setModalTab('payment');
    setShowModal(true);
    setMessage('');
    setError('');
  };

  const handlePaymentStudentPick = (studentId) => {
    const student = batchStudents.find(s => s._id === studentId);
    if (student) handleStudentSelect(student);
  };

  const savePaymentReceipt = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError('Please select a batch and student first');
      setMessage('');
      return;
    }
    const finalTotalAmount = parseFloat(paymentForm.totalAmount || getExistingTotalAmount(selectedStudent._id) || 0);
    const finalPaidAmount = parseFloat(paymentForm.paidAmount || 0);

    if (!finalTotalAmount || finalTotalAmount <= 0) {
      setError('Enter total course fees');
      setMessage('');
      return;
    }
    if (!finalPaidAmount || finalPaidAmount <= 0) {
      setError('Enter payment received now');
      setMessage('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const payload = {
        receiptType: 'student',
        student: selectedStudent._id,
        course: selectedCourseId || selectedStudent.course?._id || '',
        totalAmount: finalTotalAmount,
        paidAmount: finalPaidAmount,
        amount: finalPaidAmount,
        method: paymentForm.method,
        bankName: paymentForm.bankName ? paymentForm.bankName.trim() : '',
        date: paymentForm.date,
        description: paymentForm.notes || ''
      };
      await API.post('/fees', payload);
      await fetchFees();
      setMessage(`Payment receipt saved for ${selectedStudent.name}`);
      setError('');
      setPaymentForm({
        totalAmount: '',
        paidAmount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'cash',
        bankName: '',
        notes: ''
      });
      setSelectedStudent(null);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment receipt');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const saveOtherReceipt = async (e) => {
    e.preventDefault();
    if (!otherForm.title) {
      setError('Enter a title for the other receipt');
      setMessage('');
      return;
    }
    if (!otherForm.amount || parseFloat(otherForm.amount) <= 0) {
      setError('Enter a valid amount for other receipt');
      setMessage('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const finalAmount = parseFloat(otherForm.amount || 0);
      const payload = {
        receiptType: 'other',
        title: otherForm.title,
        description: otherForm.description,
        totalAmount: finalAmount,
        paidAmount: finalAmount,
        amount: finalAmount,
        method: otherForm.method,
        bankName: otherForm.bankName ? otherForm.bankName.trim() : '',
        date: otherForm.date
      };
      await API.post('/fees', payload);
      await fetchFees();
      setMessage(`Other receipt saved: ${otherForm.title}`);
      setError('');
      setOtherForm({ title: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], method: 'cash', bankName: '', notes: '' });
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record other receipt');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const saveExpense = async (e) => {
    e.preventDefault();
    const finalType = expenseForm.expenseType === 'other'
      ? (expenseForm.customTitle?.trim() || 'Other Expense')
      : (expenseForm.category || 'Other Expense');

    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      setError('Enter a valid amount');
      setMessage('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = {
        type: finalType,
        amount: parseFloat(expenseForm.amount) || 0,
        date: expenseForm.date || new Date().toISOString(),
        notes: expenseForm.notes || ''
      };

      await API.post('/expenses', data);
      await fetchExpenses();
      setMessage(`Expense saved: ${finalType}`);
      setError('');
      setExpenseForm({
        expenseType: 'main',
        category: 'Electricity Bill',
        customTitle: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense details');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const saveWithdrawal = async (e) => {
    e.preventDefault();
    if (!withdrawalForm.purpose || !withdrawalForm.purpose.trim()) {
      setError('Please specify the withdrawal purpose');
      setMessage('');
      return;
    }
    if (!withdrawalForm.givenBy || !withdrawalForm.givenBy.trim()) {
      setError('Please specify who authorized/gave the withdrawal');
      setMessage('');
      return;
    }
    if (!withdrawalForm.amount || parseFloat(withdrawalForm.amount) <= 0) {
      setError('Enter a valid amount');
      setMessage('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = {
        amount: parseFloat(withdrawalForm.amount) || 0,
        purpose: withdrawalForm.purpose.trim(),
        givenBy: withdrawalForm.givenBy.trim(),
        date: withdrawalForm.date || new Date().toISOString(),
        notes: withdrawalForm.notes || ''
      };

      await API.post('/withdrawals', data);
      await fetchWithdrawals();
      setMessage(`Withdrawal saved: ₹${withdrawalForm.amount} for ${withdrawalForm.purpose}`);
      setError('');
      setWithdrawalForm({
        amount: '',
        purpose: '',
        givenBy: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save withdrawal');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const resetMessages = () => {
    setMessage('');
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setModalTab(activeTab === 'payment' ? 'payment' : 'other');
    setSelectedStudent(null);
    setPaymentForm({ totalAmount: '', paidAmount: '', date: new Date().toISOString().split('T')[0], method: 'cash', bankName: '', notes: '' });
    setOtherForm({ title: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], method: 'cash', bankName: '', notes: '' });
    setExpenseForm({ expenseType: 'main', category: 'Electricity Bill', customTitle: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setWithdrawalForm({ amount: '', purpose: '', givenBy: '', date: new Date().toISOString().split('T')[0], notes: '' });
    resetMessages();
  };

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Users size={24} color="#ffffff" />
            </div>
            <div className="brand-name-container">
              <span className="brand-name">User Panel</span>
              <span className="brand-sub">Receipt Entry</span>
            </div>
          </div>
        </div>

        <div className="sidebar-menu">
          <span className="sidebar-menu-title">Sections</span>

          <button
            className={`menu-item ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => { setActiveTab('payment'); setSelectedCourseId(''); setSelectedStudent(null); setPaymentSearch(''); setPaymentDateFrom(''); setPaymentDateTo(''); setShowModal(false); setError(''); setMessage(''); setEntrySearch(''); setDateFrom(''); setDateTo(''); setIsSidebarOpen(false); }}
          >
            <CreditCard size={18} />
            <span>Payment Receipt</span>
          </button>

          <button
            className={`menu-item ${activeTab === 'other' ? 'active' : ''}`}
            onClick={() => { setActiveTab('other'); setError(''); setMessage(''); setEntrySearch(''); setDateFrom(''); setDateTo(''); setIsSidebarOpen(false); }}
          >
            <FileText size={18} />
            <span>Other Receipt</span>
          </button>

          <button
            className={`menu-item ${activeTab === 'expenseMain' ? 'active' : ''}`}
            onClick={() => { setActiveTab('expenseMain'); setError(''); setMessage(''); setEntrySearch(''); setDateFrom(''); setDateTo(''); setIsSidebarOpen(false); }}
          >
            <Clipboard size={18} />
            <span>Office Expense Main</span>
          </button>

          <button
            className={`menu-item ${activeTab === 'expenseOther' ? 'active' : ''}`}
            onClick={() => { setActiveTab('expenseOther'); setError(''); setMessage(''); setEntrySearch(''); setDateFrom(''); setDateTo(''); setIsSidebarOpen(false); }}
          >
            <Archive size={18} />
            <span>Office Expense Other</span>
          </button>

          <button
            className={`menu-item ${activeTab === 'withdrawals' ? 'active' : ''}`}
            onClick={() => { setActiveTab('withdrawals'); setError(''); setMessage(''); setEntrySearch(''); setDateFrom(''); setDateTo(''); setIsSidebarOpen(false); }}
          >
            <Wallet size={18} />
            <span>Withdrawals</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">UP</div>
            <div className="user-info">
              <span className="user-name">User Access</span>
              <span className="user-role">Receipt Entry</span>
            </div>
          </div>
          <button className="menu-item" onClick={onLogout} style={{ color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.2)', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '8px', padding: '10px 14px' }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-nav">
          <div className="top-nav-left">
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="page-title-container">
              <h2 className="page-title">User Receipt Panel</h2>
              <span className="page-sub">Create receipts and view all entries with filters.</span>
            </div>
          </div>

          <div className="top-nav-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn secondary" onClick={async () => { await Promise.all([fetchFees(), fetchExpenses(), fetchWithdrawals()]); }}>
              <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
              <span className="hide-mobile">Refresh</span>
            </button>
            {activeTab === 'other' ? (
              <button className="btn primary" onClick={() => { setShowModal(true); setModalTab('other'); resetMessages(); setIsSidebarOpen(false); }}>
                <Plus size={14} />
                <span>Add Other Receipt</span>
              </button>
            ) : activeTab === 'expenseMain' ? (
              <button className="btn primary" style={{ backgroundColor: '#f43f5e', border: 'none' }} onClick={() => { setShowModal(true); setModalTab('expenseMain'); setExpenseForm({ expenseType: 'main', category: 'Electricity Bill', customTitle: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' }); resetMessages(); setIsSidebarOpen(false); }}>
                <Plus size={14} />
                <span>Add Main Expense</span>
              </button>
            ) : activeTab === 'expenseOther' ? (
              <button className="btn primary" style={{ backgroundColor: '#f43f5e', border: 'none' }} onClick={() => { setShowModal(true); setModalTab('expenseOther'); setExpenseForm({ expenseType: 'other', category: '', customTitle: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' }); resetMessages(); setIsSidebarOpen(false); }}>
                <Plus size={14} />
                <span>Add Other Expense</span>
              </button>
            ) : activeTab === 'withdrawals' ? (
              <button className="btn primary" style={{ backgroundColor: '#0284c7', border: 'none' }} onClick={() => { setShowModal(true); setModalTab('withdrawal'); setWithdrawalForm({ amount: '', purpose: '', givenBy: '', date: new Date().toISOString().split('T')[0], notes: '' }); resetMessages(); setIsSidebarOpen(false); }}>
                <Plus size={14} />
                <span>Add Withdrawal</span>
              </button>
            ) : null}
          </div>
        </header>

        <div className="container">
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="alert alert-success">
              <span>✅</span>
              <span>{message}</span>
            </div>
          )}

          {activeTab === 'other' ? (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div className="card-title-group">
                  <div className="card-title-icon" style={{ color: '#0f766e', background: '#d8f5f1' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3>Other Receipt Entries</h3>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Only other receipts created from this user panel. No edit or delete.</span>
                  </div>
                </div>
                <button className="btn secondary" onClick={downloadCsv} disabled={!filteredOtherFees.length} style={{ opacity: filteredOtherFees.length ? 1 : 0.6 }}>
                  <span>Download CSV</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '24px' }}>
                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>Search</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} />
                    <input
                      type="text"
                      value={entrySearch}
                      onChange={(e) => setEntrySearch(e.target.value)}
                      placeholder="Search title, description, method, bank"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ padding: '0 24px 24px 24px', overflowX: 'auto' }}>
                {filteredOtherFees.length === 0 ? (
                  <div style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>No other receipts found. Use Add Other Receipt to create one.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 8px' }}>Date</th>
                        <th style={{ padding: '12px 8px' }}>Title</th>
                        <th style={{ padding: '12px 8px' }}>Description</th>
                        <th style={{ padding: '12px 8px' }}>Amount</th>
                        <th style={{ padding: '12px 8px' }}>Method</th>
                        <th style={{ padding: '12px 8px' }}>Bank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOtherFees.map(fee => (
                        <tr key={fee._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 8px', color: '#475569' }}>{formatDate(fee.date)}</td>
                          <td style={{ padding: '14px 8px', color: '#0f766e', fontWeight: 700 }}>{fee.title || 'Other Receipt'}</td>
                          <td style={{ padding: '14px 8px', color: '#334155' }}>{fee.description || '—'}</td>
                          <td style={{ padding: '14px 8px', color: '#0f172a', fontWeight: 600 }}>₹{fee.paidAmount || fee.amount || 0}</td>
                          <td style={{ padding: '14px 8px', color: '#475569' }}>{fee.method?.toUpperCase() || 'Cash'}</td>
                          <td style={{ padding: '14px 8px', color: '#475569' }}>{fee.bankName || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : activeTab === 'expenseMain' ? (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div className="card-title-group">
                  <div className="card-title-icon" style={{ color: '#b91c1c', background: '#fee2e2' }}>
                    <Clipboard size={20} />
                  </div>
                  <div>
                    <h3>Main Office Expenses</h3>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Electricity, Rent, and Staff Salary. Total: ₹{filteredMainExpenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString('en-IN')} ({filteredMainExpenses.length} entries)
                    </span>
                  </div>
                </div>
                <button className="btn secondary" onClick={() => downloadExpensesCsv(true)} disabled={!filteredMainExpenses.length} style={{ opacity: filteredMainExpenses.length ? 1 : 0.6 }}>
                  <span>Download CSV</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '24px' }}>
                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>Search</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} />
                    <input
                      type="text"
                      value={entrySearch}
                      onChange={(e) => setEntrySearch(e.target.value)}
                      placeholder="Search classification, notes, amount"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ padding: '0 24px 24px 24px', overflowX: 'auto' }}>
                {filteredMainExpenses.length === 0 ? (
                  <div style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>No main expenses found. Use Add Main Expense to create one.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 8px' }}>Date</th>
                        <th style={{ padding: '12px 8px' }}>Classification</th>
                        <th style={{ padding: '12px 8px' }}>Amount</th>
                        <th style={{ padding: '12px 8px' }}>Notes / Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMainExpenses.map(exp => (
                        <tr key={exp._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 8px', color: '#475569' }}>{formatDate(exp.date)}</td>
                          <td style={{ padding: '14px 8px', color: '#b91c1c', fontWeight: 700 }}>{exp.type}</td>
                          <td style={{ padding: '14px 8px', color: '#0f172a', fontWeight: 600 }}>₹{exp.amount || 0}</td>
                          <td style={{ padding: '14px 8px', color: '#334155' }}>{exp.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : activeTab === 'expenseOther' ? (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div className="card-title-group">
                  <div className="card-title-icon" style={{ color: '#2563eb', background: '#dbeafe' }}>
                    <Archive size={20} />
                  </div>
                  <div>
                    <h3>Other Office Expenses</h3>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Custom office operational expenses. Total: ₹{filteredOtherExpenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString('en-IN')} ({filteredOtherExpenses.length} entries)
                    </span>
                  </div>
                </div>
                <button className="btn secondary" onClick={() => downloadExpensesCsv(false)} disabled={!filteredOtherExpenses.length} style={{ opacity: filteredOtherExpenses.length ? 1 : 0.6 }}>
                  <span>Download CSV</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '24px' }}>
                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>Search</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} />
                    <input
                      type="text"
                      value={entrySearch}
                      onChange={(e) => setEntrySearch(e.target.value)}
                      placeholder="Search title, notes, amount"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ padding: '0 24px 24px 24px', overflowX: 'auto' }}>
                {filteredOtherExpenses.length === 0 ? (
                  <div style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>No other expenses found. Use Add Other Expense to create one.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 8px' }}>Date</th>
                        <th style={{ padding: '12px 8px' }}>Title</th>
                        <th style={{ padding: '12px 8px' }}>Amount</th>
                        <th style={{ padding: '12px 8px' }}>Notes / Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOtherExpenses.map(exp => (
                        <tr key={exp._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 8px', color: '#475569' }}>{formatDate(exp.date)}</td>
                          <td style={{ padding: '14px 8px', color: '#2563eb', fontWeight: 700 }}>{exp.type}</td>
                          <td style={{ padding: '14px 8px', color: '#0f172a', fontWeight: 600 }}>₹{exp.amount || 0}</td>
                          <td style={{ padding: '14px 8px', color: '#334155' }}>{exp.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : activeTab === 'withdrawals' ? (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div className="card-title-group">
                  <div className="card-title-icon" style={{ color: '#0284c7', background: '#e0f2fe' }}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3>Cash Withdrawals</h3>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Withdrawal records. Total: ₹{filteredWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0).toLocaleString('en-IN')} ({filteredWithdrawals.length} entries)
                    </span>
                  </div>
                </div>
                <button className="btn secondary" onClick={downloadWithdrawalsCsv} disabled={!filteredWithdrawals.length} style={{ opacity: filteredWithdrawals.length ? 1 : 0.6 }}>
                  <span>Download CSV</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '24px' }}>
                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>Search</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} />
                    <input
                      type="text"
                      value={entrySearch}
                      onChange={(e) => setEntrySearch(e.target.value)}
                      placeholder="Search purpose, given by, notes, amount"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ padding: '0 24px 24px 24px', overflowX: 'auto' }}>
                {filteredWithdrawals.length === 0 ? (
                  <div style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>No withdrawals found. Use Add Withdrawal to create one.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 8px' }}>Date</th>
                        <th style={{ padding: '12px 8px' }}>Purpose / Item</th>
                        <th style={{ padding: '12px 8px' }}>Taken By</th>
                        <th style={{ padding: '12px 8px' }}>Amount</th>
                        <th style={{ padding: '12px 8px' }}>Notes / Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWithdrawals.map(withdrawal => (
                        <tr key={withdrawal._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 8px', color: '#475569' }}>{formatDate(withdrawal.date)}</td>
                          <td style={{ padding: '14px 8px', color: '#0284c7', fontWeight: 700 }}>{withdrawal.purpose}</td>
                          <td style={{ padding: '14px 8px', color: '#0f172a', fontWeight: 600 }}>{withdrawal.givenBy}</td>
                          <td style={{ padding: '14px 8px', color: '#b91c1c', fontWeight: 700 }}>₹{withdrawal.amount || 0}</td>
                          <td style={{ padding: '14px 8px', color: '#334155' }}>{withdrawal.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div className="card-title-group">
                  <div className="card-title-icon" style={{ color: '#0f766e', background: '#d8f5f1' }}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3>{selectedCourseId ? activeCourse?.name || 'Batch Entries' : 'Payment Receipt'}</h3>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      {selectedCourseId
                        ? 'Search entries or use Record Payment — same layout as admin panel.'
                        : 'Step 1: Select a batch to view its payment receipt entries.'}
                    </span>
                  </div>
                </div>
                {selectedCourseId && (
                  <button type="button" className="btn secondary" onClick={handleBackToBatches} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} />
                    <span>Back to Batches</span>
                  </button>
                )}
              </div>

              {!selectedCourseId ? (
                <div style={{ padding: '24px', display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Search batches</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '520px' }}>
                      <Search size={16} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search batch name"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  {filteredCourses.length ? (
                    <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                      {filteredCourses.map(course => {
                        const studentCount = students.filter(s => s.course?._id === course._id).length;
                        const receiptCount = fees.filter(
                          fee => fee.student?.course?._id === course._id && fee.receiptType !== 'other'
                        ).length;
                        return (
                          <button
                            key={course._id}
                            type="button"
                            onClick={() => handleBatchSelect(course._id)}
                            style={{
                              textAlign: 'left',
                              padding: '18px 20px',
                              borderRadius: '16px',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(15,23,42,0.04)'
                            }}
                          >
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>{course.name}</div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                              {studentCount} student{studentCount === 1 ? '' : 's'} · {receiptCount} receipt entr{receiptCount === 1 ? 'y' : 'ies'}
                            </div>
                            <div style={{ marginTop: '12px', fontSize: '13px', color: '#0f766e', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span>View entries</span>
                              <ArrowRight size={14} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>No batches found.</div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px 0' }}>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={downloadPaymentCsv}
                      disabled={!filteredBatchPaymentFees.length}
                      style={{ opacity: filteredBatchPaymentFees.length ? 1 : 0.6 }}
                    >
                      <span>Download CSV</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '16px 24px' }}>
                    <div>
                      <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>Search</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={16} />
                        <input
                          type="text"
                          value={paymentSearch}
                          onChange={(e) => setPaymentSearch(e.target.value)}
                          placeholder="Search payment receipts..."
                          style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>From Date</label>
                      <input
                        type="date"
                        value={paymentDateFrom}
                        onChange={(e) => setPaymentDateFrom(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', display: 'block' }}>To Date</label>
                      <input
                        type="date"
                        value={paymentDateTo}
                        onChange={(e) => setPaymentDateTo(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '0 24px 16px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'flex-end'
                  }}>
                    {(paymentSearch || paymentDateFrom || paymentDateTo) && (
                      <button
                        type="button"
                        onClick={() => { setPaymentSearch(''); setPaymentDateFrom(''); setPaymentDateTo(''); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          padding: '6px 8px'
                        }}
                      >
                        Reset Filters
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn"
                      onClick={openRecordPaymentModal}
                      style={{ background: '#10b981', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Plus size={16} />
                      <span>Record Payment</span>
                    </button>
                  </div>

                  <div style={{ padding: '0 24px 24px 24px', overflowX: 'auto' }}>
                    {filteredBatchPaymentFees.length === 0 ? (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                        {paymentSearch || paymentDateFrom || paymentDateTo
                          ? 'No payment receipts match your search or date range.'
                          : 'No payment receipts recorded for this batch yet. Use Record Payment to add one.'}
                      </div>
                    ) : (
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Student Name & Course</th>
                              <th>Payment Date</th>
                              <th>Amount Received</th>
                              <th>Transaction Mode</th>
                              <th>Overall Student Balance Status</th>
                              <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBatchPaymentFees.map(fee => {
                              const studentId = fee.student?._id || fee.student;
                              const studentFees = getStudentFeeRecords(studentId);
                              const total = fee.totalAmount || fee.amount || 0;
                              const receivedAmount = fee.paidAmount || fee.amount || 0;
                              const totalPaid = studentFees.reduce((sum, item) => sum + (item.amount || item.paidAmount || 0), 0);
                              const overallRemaining = Math.max(0, total - totalPaid);

                              return (
                                <tr key={fee._id}>
                                  <td style={{ fontWeight: '600', color: '#0f172a' }}>
                                    <div style={{ fontSize: '15px' }}>{fee.student?.name || '—'}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                      {fee.student?.course?.name || activeCourse?.name || '—'}
                                      {fee.student?.classId ? ` · ${fee.student.classId}` : ''}
                                    </div>
                                  </td>
                                  <td style={{ color: '#0f172a', fontWeight: '500', fontSize: '14px' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      <Calendar size={13} style={{ color: '#64748b' }} />
                                      {formatPaymentDate(fee.date)}
                                    </span>
                                  </td>
                                  <td style={{ fontWeight: '700', color: '#16a34a', fontSize: '15px' }}>
                                    ₹{receivedAmount.toLocaleString('en-IN')}
                                  </td>
                                  <td>
                                    <span className={`badge ${fee.method === 'cash' ? 'warning' : (fee.method === 'upi' ? 'success' : 'info')}`} style={{ padding: '5px 8px', fontSize: '11px', fontWeight: '600' }}>
                                      {fee.method === 'cash' && 'Cash'}
                                      {fee.method === 'bank' && 'Bank'}
                                      {fee.method === 'upi' && 'UPI'}
                                    </span>
                                    {fee.bankName && (
                                      <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500', marginTop: '4px' }}>
                                        {fee.bankName}
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '13px', color: '#334155' }}>
                                      <div>Total Course Fee: <strong style={{ color: '#0f172a' }}>₹{total.toLocaleString('en-IN')}</strong></div>
                                      <div style={{ fontSize: '11px', marginTop: '4px', display: 'flex', gap: '8px' }}>
                                        <span style={{ color: '#16a34a', fontWeight: '600' }}>Paid: ₹{totalPaid.toLocaleString('en-IN')}</span>
                                        <span style={{ color: overallRemaining === 0 ? '#16a34a' : '#ea580c', fontWeight: '600' }}>
                                          Due: ₹{overallRemaining.toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <button
                                      type="button"
                                      className="btn"
                                      style={{ padding: '8px 14px', fontSize: '13px', background: '#0f766e' }}
                                      onClick={() => fee.student && handleStudentSelect(fee.student)}
                                    >
                                      Record Payment
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {showModal && (() => {
          const isPaymentModal = activeTab === 'payment';
          const compactField = { padding: '8px 10px', fontSize: '13px', borderRadius: '8px' };
          const compactLabel = { fontSize: '12px', marginBottom: '4px' };

          return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '12px'
            }}
            onClick={closeModal}
          >
            <div
              style={{
                width: '100%',
                maxWidth: isPaymentModal ? '440px' : '760px',
                height: isPaymentModal ? 'min(520px, calc(100vh - 24px))' : undefined,
                maxHeight: isPaymentModal ? 'min(520px, calc(100vh - 24px))' : 'calc(100vh - 24px)',
                background: '#ffffff',
                borderRadius: isPaymentModal ? '16px' : '24px',
                boxShadow: '0 24px 80px rgba(15,23,42,0.18)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                margin: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isPaymentModal ? '12px 16px' : '20px 28px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                <div style={{ minWidth: 0, paddingRight: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: isPaymentModal ? '15px' : '18px', lineHeight: 1.3 }}>
                    {activeTab === 'payment' && (selectedStudent ? `Payment — ${selectedStudent.name}` : 'Record Payment')}
                    {activeTab !== 'payment' && modalTab === 'other' && 'Add Other Receipt'}
                    {modalTab === 'expenseMain' && 'Add Main Office Expense'}
                    {modalTab === 'expenseOther' && 'Add Other Office Expense'}
                  </h3>
                  {isPaymentModal && activeCourse && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{activeCourse.name}</div>
                  )}
                </div>
                <button onClick={closeModal} style={{ border: 'none', background: 'transparent', color: '#0f172a', fontSize: '20px', cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>

              <div style={{
                padding: isPaymentModal ? '0' : '20px 28px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: isPaymentModal ? '0' : '18px',
                overflowY: isPaymentModal ? 'hidden' : 'auto',
                flex: 1,
                minHeight: 0,
                WebkitOverflowScrolling: 'touch'
              }}>
                {activeTab === 'payment' && (() => {
                  const paymentStudentId = selectedStudent?._id;
                  const totalPaidSoFar = paymentStudentId ? getTotalPaidSoFar(paymentStudentId) : 0;
                  const existingTotalAmount = paymentStudentId ? getExistingTotalAmount(paymentStudentId) : 0;
                  const total = parseFloat(paymentForm.totalAmount || existingTotalAmount || 0);
                  const newPayment = parseFloat(paymentForm.paidAmount || 0);
                  const currentRemaining = Math.max(0, total - totalPaidSoFar);
                  const newRemaining = Math.max(0, total - totalPaidSoFar - newPayment);
                  const uniqueBanks = Array.from(new Set(fees.map(f => f.bankName).filter(Boolean)));
                  const matchingBanks = uniqueBanks.filter(bank =>
                    bank.toLowerCase().includes((paymentForm.bankName || '').toLowerCase())
                  );
                  const bankLabel = paymentForm.method === 'bank'
                    ? 'Select or Type Bank Name *'
                    : (paymentForm.method === 'upi' ? 'Select or Type UPI App/Account *' : 'Select or Type Cash Account *');
                  const bankPlaceholder = paymentForm.method === 'bank'
                    ? 'e.g. SBI, HDFC, PNB Bank...'
                    : (paymentForm.method === 'upi' ? 'e.g. GPay, PhonePe, Paytm...' : 'e.g. Main Cash Drawer, Office Cash...');

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                      {!selectedStudent ? (
                        <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1 }}>
                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={compactLabel}>Select Student *</label>
                            <select
                              value=""
                              onChange={(e) => handlePaymentStudentPick(e.target.value)}
                              required
                              style={compactField}
                            >
                              <option value="">Select ({batchStudents.length} enrolled)</option>
                              {batchStudents.map(student => (
                                <option key={student._id} value={student._id}>
                                  {student.name}{student.contact ? ` · ${student.contact}` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={savePaymentReceipt} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                          <div style={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            padding: '12px 16px',
                            display: 'grid',
                            gap: '10px',
                            alignContent: 'start',
                            WebkitOverflowScrolling: 'touch'
                          }}>
                            {totalPaidSoFar > 0 ? (
                              <div style={{ background: '#f0f6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#1e3a8a', lineHeight: 1.5 }}>
                                Fee ₹{total.toLocaleString('en-IN')} · Paid ₹{totalPaidSoFar.toLocaleString('en-IN')} · Due ₹{currentRemaining.toLocaleString('en-IN')}
                              </div>
                            ) : (
                              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                                First payment for this student
                              </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={compactLabel}>Total Fees (INR) *</label>
                                <input
                                  name="totalAmount"
                                  type="number"
                                  placeholder="20000"
                                  value={paymentForm.totalAmount}
                                  onChange={(e) => setPaymentForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                                  required
                                  style={compactField}
                                />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={compactLabel}>Paid Now (INR) *</label>
                                <input
                                  name="paidAmount"
                                  type="number"
                                  placeholder="5000"
                                  value={paymentForm.paidAmount}
                                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paidAmount: e.target.value }))}
                                  required
                                  style={compactField}
                                />
                              </div>
                            </div>

                            <div style={{
                              background: newRemaining === 0 ? '#f0fdf4' : '#fff7ed',
                              border: newRemaining === 0 ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{ fontSize: '11px', color: newRemaining === 0 ? '#15803d' : '#c2410c' }}>
                                Balance after payment: <strong style={{ fontSize: '14px' }}>₹{newRemaining.toLocaleString('en-IN')}</strong>
                              </div>
                              <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '12px', background: newRemaining === 0 ? '#dcfce7' : '#ffedd5', color: newRemaining === 0 ? '#15803d' : '#ea580c' }}>
                                {newRemaining === 0 ? 'Paid' : 'Due'}
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={compactLabel}>Date *</label>
                                <input
                                  name="date"
                                  type="date"
                                  value={paymentForm.date}
                                  onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                                  required
                                  style={compactField}
                                />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={compactLabel}>Mode *</label>
                                <select
                                  value={paymentForm.method}
                                  onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value, bankName: '' }))}
                                  required
                                  style={compactField}
                                >
                                  <option value="cash">Cash</option>
                                  <option value="bank">Bank</option>
                                  <option value="upi">UPI</option>
                                </select>
                              </div>
                            </div>

                            <div className="form-group" style={{ position: 'relative', marginBottom: 0 }}>
                              <label style={compactLabel}>{bankLabel}</label>
                              <input
                                name="bankName"
                                type="text"
                                placeholder={bankPlaceholder}
                                value={paymentForm.bankName}
                                onChange={(e) => setPaymentForm(prev => ({ ...prev, bankName: e.target.value }))}
                                onFocus={() => setShowBankDropdown(true)}
                                onBlur={() => setTimeout(() => setShowBankDropdown(false), 250)}
                                required
                                autoComplete="off"
                                style={compactField}
                              />
                              {showBankDropdown && matchingBanks.length > 0 && (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  right: 0,
                                  background: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  maxHeight: '120px',
                                  overflowY: 'auto',
                                  zIndex: 100,
                                  marginTop: '2px'
                                }}>
                                  {matchingBanks.map(bank => (
                                    <button
                                      key={bank}
                                      type="button"
                                      onMouseDown={() => setPaymentForm(prev => ({ ...prev, bankName: bank }))}
                                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                      {bank}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={compactLabel}>Notes (optional)</label>
                              <input
                                name="notes"
                                type="text"
                                value={paymentForm.notes}
                                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Bill no., reference..."
                                style={compactField}
                              />
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '8px',
                            padding: '10px 16px',
                            borderTop: '1px solid #e2e8f0',
                            flexShrink: 0,
                            background: '#ffffff'
                          }}>
                            <button type="button" className="btn secondary" onClick={closeModal} style={{ padding: '8px 14px', fontSize: '13px' }}>Cancel</button>
                            <button type="submit" className="btn" disabled={loading} style={{ background: '#10b981', padding: '8px 14px', fontSize: '13px' }}>
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })()}
                {activeTab !== 'payment' && modalTab === 'other' ? (
                  <form onSubmit={saveOtherReceipt} style={{ display: 'grid', gap: '16px' }}>
                    <div className="form-group">
                      <label>Receipt Title *</label>
                      <input
                        name="title"
                        type="text"
                        value={otherForm.title}
                        onChange={(e) => setOtherForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="E.g. Late fee, material charge"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <input
                        name="description"
                        type="text"
                        value={otherForm.description}
                        onChange={(e) => setOtherForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional details"
                      />
                    </div>

                    <div className="form-group">
                      <label>Amount (INR) *</label>
                      <input
                        name="amount"
                        type="number"
                        value={otherForm.amount}
                        onChange={(e) => setOtherForm(prev => ({ ...prev, amount: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Date *</label>
                      <input
                        name="date"
                        type="date"
                        value={otherForm.date}
                        onChange={(e) => setOtherForm(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Payment Source *</label>
                      <select
                        value={otherForm.method}
                        onChange={(e) => setOtherForm(prev => ({ ...prev, method: e.target.value }))}
                      >
                        <option value="cash">Cash</option>
                        <option value="bank">Bank</option>
                        <option value="upi">UPI</option>
                      </select>
                    </div>

                    {otherForm.method === 'bank' && (
                      <div className="form-group">
                        <label>Bank Name</label>
                        <input
                          name="bankName"
                          type="text"
                          value={otherForm.bankName}
                          onChange={(e) => setOtherForm(prev => ({ ...prev, bankName: e.target.value }))}
                          placeholder="Bank A, Bank B, etc."
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button type="button" className="btn secondary" onClick={closeModal}>Cancel</button>
                      <button type="submit" className="btn" disabled={loading}>{loading ? 'Saving...' : 'Save Other Receipt'}</button>
                    </div>
                  </form>
                ) : (modalTab === 'expenseMain' || modalTab === 'expenseOther') ? (
                  <form onSubmit={saveExpense} style={{ display: 'grid', gap: '16px' }}>
                    {expenseForm.expenseType === 'main' ? (
                      <div className="form-group">
                        <label style={{ fontWeight: 600, color: '#475569' }}>Main Expense Category *</label>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {mainExpenseCategories.map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setExpenseForm(prev => ({ ...prev, category: cat }))}
                              className="btn"
                              style={{
                                minWidth: '140px',
                                whiteSpace: 'normal',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                background: expenseForm.category === cat ? '#f43f5e' : '#ffffff',
                                color: expenseForm.category === cat ? '#ffffff' : '#0f172a',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'grid',
                                placeItems: 'center'
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="form-group">
                        <label style={{ fontWeight: 600, color: '#475569' }}>Other Expense Title *</label>
                        <input
                          name="customTitle"
                          type="text"
                          placeholder="Describe the expense, e.g. printer repair"
                          value={expenseForm.customTitle}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, customTitle: e.target.value }))}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                          required
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label style={{ fontWeight: 600, color: '#475569' }}>{expenseForm.expenseType === 'other' ? 'Expense Details' : 'Optional Reference'}</label>
                      <input
                        name="notes"
                        type="text"
                        placeholder={expenseForm.expenseType === 'other'
                          ? 'What happened? Why this expense?'
                          : 'Vendor, bill number, or payment note'}
                        value={expenseForm.notes}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div className="form-group">
                        <label style={{ fontWeight: 600, color: '#475569' }}>Amount (INR) *</label>
                        <input
                          name="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontWeight: 600, color: '#475569' }}>Expense Date *</label>
                        <input
                          name="date"
                          type="date"
                          value={expenseForm.date}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <button type="button" className="btn secondary" onClick={closeModal}>Cancel</button>
                      <button type="submit" className="btn" style={{ backgroundColor: '#f43f5e', border: 'none', color: '#ffffff' }} disabled={loading}>{loading ? 'Saving...' : 'Save Expense'}</button>
                    </div>
                  </form>
                ) : modalTab === 'withdrawal' ? (
                  <form onSubmit={saveWithdrawal} style={{ display: 'grid', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ fontWeight: 600, color: '#475569' }}>Withdrawal Purpose / Item *</label>
                      <input
                        name="purpose"
                        type="text"
                        placeholder="E.g. Stationery, tea expenses, vendor payment"
                        value={withdrawalForm.purpose}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, purpose: e.target.value }))}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: 600, color: '#475569' }}>Taken By *</label>
                      <input
                        name="givenBy"
                        type="text"
                        placeholder="Who handed over or authorized this cash?"
                        value={withdrawalForm.givenBy}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, givenBy: e.target.value }))}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: 600, color: '#475569' }}>Optional Remarks / Notes</label>
                      <input
                        name="notes"
                        type="text"
                        placeholder="Any additional details or reference"
                        value={withdrawalForm.notes}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, notes: e.target.value }))}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div className="form-group">
                        <label style={{ fontWeight: 600, color: '#475569' }}>Amount (INR) *</label>
                        <input
                          name="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={withdrawalForm.amount}
                          onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontWeight: 600, color: '#475569' }}>Withdrawal Date *</label>
                        <input
                          name="date"
                          type="date"
                          value={withdrawalForm.date}
                          onChange={(e) => setWithdrawalForm(prev => ({ ...prev, date: e.target.value }))}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <button type="button" className="btn secondary" onClick={closeModal}>Cancel</button>
                      <button type="submit" className="btn" style={{ backgroundColor: '#0284c7', border: 'none', color: '#ffffff' }} disabled={loading}>{loading ? 'Saving...' : 'Save Withdrawal'}</button>
                    </div>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
          );
        })()}
      </main>
    </div>
  );
}
