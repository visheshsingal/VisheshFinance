'use client';
import React, { useState, useEffect } from 'react';
import API from '@/lib/api';
import { 
  GraduationCap, 
  Users, 
  CreditCard, 
  BookOpen, 
  TrendingDown, 
  LogOut, 
  RefreshCw, 
  Menu, 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Wallet,
  Calendar,
  Layers,
  FileText,
  Clipboard,
  Archive,
  RotateCcw
} from 'lucide-react';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  
  // Custom search and mobile sidebar states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);

  // Dynamic advanced filter states
  const [studentFilters, setStudentFilters] = useState({ startDate: '', endDate: '', course: '' });
  const [expenseFilters, setExpenseFilters] = useState({ startDate: '', endDate: '', classification: '' });
  const [refundFilters, setRefundFilters] = useState({ startDate: '', endDate: '' });
  const mainExpenseCategories = ['Electricity Bill', 'Office Rent', 'Staff Salary'];
  const [feeFilters, setFeeFilters] = useState({ startDate: '', endDate: '', course: '', bankName: '', method: '', student: '' });
  
  // Selected daily activity log date range (defaults to today)
  const [logFilters, setLogFilters] = useState(() => ({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  }));

  const [statementFilters, setStatementFilters] = useState(() => ({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    source: ''
  }));

  // Fetch all data
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, f, c, e, r] = await Promise.all([
        API.get('/students'),
        API.get('/fees'),
        API.get('/courses'),
        API.get('/expenses'),
        API.get('/refunds')
      ]);
      setStudents(s.data || []);
      setFees(f.data || []);
      setCourses(c.data || []);
      setExpenses(e.data || []);
      setRefunds(r.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load data from backend server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Form handlers
  const updateBatchPreviews = (courseName, month, year, currentFormData) => {
    const cName = courseName || '';
    const m = month || 'May';
    const y = year || new Date().getFullYear().toString();
    
    // Format code safely (replace spaces with hyphens, remove special characters, uppercase)
    const cleanCourse = cName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const cleanMonth = m.trim();
    const cleanYear = y.trim();
    
    const generatedName = cName ? `${cName} - ${m} ${y}` : '';
    const generatedClassId = cName 
      ? `${cleanCourse.replace(/\s+/g, '-')}-${cleanMonth.substring(0, 3).toUpperCase()}-${cleanYear}`
      : '';
      
    return {
      ...currentFormData,
      name: generatedName,
      classId: generatedClassId.toUpperCase()
    };
  };

  const defaultBaseCourses = ['CA FOUNDATION', 'CA INTER', '+1', '+2'];
  const existingBaseCourses = Array.from(new Set(
    courses.map(c => c.courseName || c.className).filter(Boolean)
  ));
  const allBaseCourses = Array.from(new Set([...defaultBaseCourses, ...existingBaseCourses]));
  const filteredBaseCourses = allBaseCourses.filter(course =>
    course.toLowerCase().includes((formData.courseName || '').toLowerCase())
  );
  const yearOptions = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleCourseNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, courseName: value };
      return updateBatchPreviews(value, prev.month, prev.year, updated);
    });
  };

  const selectBaseCourse = (course) => {
    setFormData(prev => {
      const updated = { ...prev, courseName: course };
      return updateBatchPreviews(course, prev.month, prev.year, updated);
    });
    setShowCourseDropdown(false);
  };

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, month: value };
      return updateBatchPreviews(prev.courseName, value, prev.year, updated);
    });
  };

  const handleYearChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, year: value };
      return updateBatchPreviews(prev.courseName, prev.month, value, updated);
    });
  };

  const openAddForm = (type) => {
    setEditingId(null);
    if (type === 'courses') {
      const currentYear = new Date().getFullYear().toString();
      const currentMonth = 'May';
      setFormData({
        courseName: '',
        month: currentMonth,
        year: currentYear,
        name: '',
        classId: ''
      });
    } else if (type === 'fees') {
      setFormData({
        receiptType: 'student',
        course: '',
        student: '',
        totalAmount: '',
        paidAmount: '',
        method: 'cash',
        bankName: '',
        date: new Date().toISOString().split('T')[0]
      });
    } else if (type === 'otherReceipt') {
      setFormData({
        receiptType: 'other',
        title: '',
        description: '',
        amount: '',
        method: 'cash',
        bankName: '',
        date: new Date().toISOString().split('T')[0]
      });
    } else if (type === 'expenses') {
      setFormData({
        expenseType: 'main',
        category: '',
        customTitle: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } else if (type === 'refunds') {
      setFormData({
        course: '',
        student: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({});
    }
    setShowModal(type);
  };

  const openEditForm = (type, item) => {
    setEditingId(item._id);
    if (type === 'students') {
      setFormData({
        ...item,
        course: item.course?._id || item.course || ''
      });
    } else if (type === 'fees' && item.student) {
      setFormData({
        ...item,
        receiptType: item.receiptType || 'student',
        course: item.student.course?._id || item.student.course || '',
        student: item.student._id || item.student,
        totalAmount: item.totalAmount || item.amount || 0,
        paidAmount: item.paidAmount || item.amount || 0,
        method: item.method || 'cash',
        bankName: item.bankName || '',
        date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else if (type === 'otherReceipt') {
      setFormData({
        ...item,
        receiptType: 'other',
        title: item.title || '',
        description: item.description || '',
        amount: item.amount || item.paidAmount || 0,
        method: item.method || 'cash',
        bankName: item.bankName || '',
        date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else if (type === 'courses') {
      setFormData({
        ...item,
        courseName: item.courseName || item.className || item.name || '',
        month: item.month || 'May',
        year: item.year || new Date().getFullYear().toString()
      });
    } else if (type === 'expenses') {
      const isMainCategory = mainExpenseCategories.includes(item.type);
      setFormData({
        expenseType: isMainCategory ? 'main' : 'other',
        category: isMainCategory ? item.type : '',
        customTitle: isMainCategory ? '' : item.type,
        amount: item.amount || 0,
        notes: item.notes || '',
        date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else if (type === 'refunds') {
      setFormData({
        course: item.student?.course?._id || item.student?.course || '',
        student: item.student?._id || item.student || '',
        amount: item.amount || 0,
        date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData(item);
    }
    setShowModal(type);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Students API
  const saveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/students/${editingId}`, formData);
      } else {
        await API.post('/students', formData);
      }
      fetchAll();
      closeModal();
    } catch (err) {
      setError('Failed to save student record');
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await API.delete(`/students/${id}`);
        fetchAll();
      } catch (err) {
        setError('Failed to delete student');
      }
    }
  };

  // Fees / Receipt API
  const saveFee = async (e) => {
    e.preventDefault();
    try {
      const receiptType = formData.receiptType || 'student';
      let data;

      if (receiptType === 'other') {
        const finalAmount = parseFloat(formData.amount || 0);
        data = {
          receiptType,
          title: formData.title?.trim() || '',
          description: formData.description?.trim() || '',
          totalAmount: 0,
          paidAmount: finalAmount,
          amount: finalAmount,
          method: formData.method || 'cash',
          bankName: formData.bankName ? formData.bankName.trim() : '',
          date: formData.date || new Date().toISOString()
        };
      } else {
        const selectedStudentId = formData.student;
        const studentFees = fees.filter(f => {
          const studentId = f.student?._id || f.student;
          const matchesStudent = studentId === selectedStudentId;
          const isNotCurrentEdit = editingId ? f._id !== editingId : true;
          return matchesStudent && isNotCurrentEdit;
        });
        const existingTotalAmount = studentFees[0]?.totalAmount || 0;
        const finalTotalAmount = parseFloat(formData.totalAmount !== undefined ? formData.totalAmount : existingTotalAmount) || 0;
        const finalPaidAmount = parseFloat(formData.paidAmount || 0);

        data = {
          receiptType,
          student: selectedStudentId,
          course: formData.course || '',
          title: '',
          description: '',
          totalAmount: finalTotalAmount,
          paidAmount: finalPaidAmount,
          amount: finalPaidAmount,
          method: formData.method || 'cash',
          bankName: formData.bankName ? formData.bankName.trim() : '',
          date: formData.date || new Date().toISOString()
        };
      }

      if (editingId) {
        await API.put(`/fees/${editingId}`, data);
      } else {
        await API.post('/fees', data);
      }
      fetchAll();
      closeModal();
    } catch (err) {
      setError('Failed to record payment');
    }
  };

  const deleteFee = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      try {
        await API.delete(`/fees/${id}`);
        fetchAll();
      } catch (err) {
        setError('Failed to delete fee transaction');
      }
    }
  };

  // Courses API
  const saveCourse = async (e) => {
    e.preventDefault();
    try {
      const cName = formData.courseName || '';
      const m = formData.month || 'May';
      const y = formData.year || new Date().getFullYear().toString();
      
      const cleanCourse = cName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const cleanMonth = m.trim();
      const cleanYear = y.trim();
      
      const generatedName = cName ? `${cName} - ${m} ${y}` : '';
      const generatedClassId = cName 
        ? `${cleanCourse.replace(/\s+/g, '-')}-${cleanMonth.substring(0, 3).toUpperCase()}-${cleanYear}`
        : '';

      const payload = {
        ...formData,
        name: generatedName,
        classId: generatedClassId.toUpperCase(),
        className: cName
      };

      if (editingId) {
        await API.put(`/courses/${editingId}`, payload);
      } else {
        await API.post('/courses', payload);
      }
      fetchAll();
      closeModal();
    } catch (err) {
      setError('Failed to save course details');
    }
  };

  const deleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await API.delete(`/courses/${id}`);
        fetchAll();
      } catch (err) {
        setError('Failed to delete course');
      }
    }
  };

  // Expenses API
  const saveExpense = async (e) => {
    e.preventDefault();
    try {
      const finalType = formData.expenseType === 'other'
        ? (formData.customTitle?.trim() || 'Other Expense')
        : (formData.category || 'Other Expense');

      const data = {
        type: finalType,
        amount: parseFloat(formData.amount) || 0,
        date: formData.date || new Date().toISOString(),
        notes: formData.notes || ''
      };

      if (editingId) {
        await API.put(`/expenses/${editingId}`, data);
      } else {
        await API.post('/expenses', data);
      }
      fetchAll();
      closeModal();
    } catch (err) {
      setError('Failed to save expense details');
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await API.delete(`/expenses/${id}`);
        fetchAll();
      } catch (err) {
        setError('Failed to delete expense record');
      }
    }
  };

  const saveRefund = async (e) => {
    e.preventDefault();
    if (!formData.course) {
      setError('Please select a batch');
      return;
    }
    if (!formData.student) {
      setError('Please select a student');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Enter a valid refund amount');
      return;
    }
    try {
      setError('');
      const data = {
        student: formData.student,
        amount: parseFloat(formData.amount) || 0,
        date: formData.date || new Date().toISOString()
      };
      if (editingId) {
        await API.put(`/refunds/${editingId}`, data);
      } else {
        await API.post('/refunds', data);
      }
      fetchAll();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save refund record');
    }
  };

  const deleteRefund = async (id) => {
    if (window.confirm('Are you sure you want to delete this refund record?')) {
      try {
        await API.delete(`/refunds/${id}`);
        fetchAll();
      } catch (err) {
        setError('Failed to delete refund record');
      }
    }
  };

  // CSV Export utility
  const exportToCSV = (data, headers, filename) => {
    if (!data || !data.length) {
      alert("No visible record to download");
      return;
    }
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ('' + (val !== undefined && val !== null ? val : '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    const csvContent = "\ufeff" + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStudents = () => {
    const headers = ["Name", "Email", "Parent Name", "Contact", "Enrolled Batch", "Batch Code", "Admission Date"];
    const csvData = filteredStudents.map(s => ({
      "Name": s.name || '',
      "Email": s.email || '',
      "Parent Name": s.parentName || '',
      "Contact": s.contact || '',
      "Enrolled Batch": s.course?.name || s.courseName || '—',
      "Batch Code": s.classId || '—',
      "Admission Date": s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '—'
    }));
    exportToCSV(csvData, headers, "students_directory");
  };

  const exportFees = () => {
    const headers = [
      "Student Name", 
      "Enrolled Batch", 
      "Batch Code", 
      "Receipt Date", 
      "Amount Received Now (INR)", 
      "Payment Mode", 
      "Bank or Cash Account",
      "Total Course Fees (INR)",
      "Total Paid So Far (INR)",
      "Remaining Due (INR)"
    ];
    const csvData = filteredStudentFees.map(f => {
      const studentId = f.student?._id || f.student;
      const studentFeesList = fees.filter(fee => (fee.student?._id || fee.student) === studentId);
      
      const total = f.totalAmount || f.amount || 0;
      const receivedAmount = f.paidAmount || f.amount || 0;
      const totalPaid = studentFeesList.reduce((sum, fee) => sum + (fee.amount || fee.paidAmount || 0), 0);
      const remainingDue = Math.max(0, total - totalPaid);
      
      return {
        "Student Name": f.student?.name || '—',
        "Enrolled Batch": f.student?.course?.name || '—',
        "Batch Code": f.student?.classId || '—',
        "Receipt Date": f.date ? new Date(f.date).toLocaleDateString('en-IN') : '—',
        "Amount Received Now (INR)": receivedAmount,
        "Payment Mode": f.method === 'cash' ? 'Cash' : (f.method === 'upi' ? 'UPI' : 'Bank Transfer'),
        "Bank or Cash Account": f.bankName || '—',
        "Total Course Fees (INR)": total,
        "Total Paid So Far (INR)": totalPaid,
        "Remaining Due (INR)": remainingDue
      };
    });
    exportToCSV(csvData, headers, "fees_transactions_ledger");
  };

  const exportExpenses = () => {
    const headers = ["Expense Classification", "Amount Paid (INR)", "Payment Date", "Explanatory Notes"];
    const csvData = filteredExpenses.map(e => ({
      "Expense Classification": e.type || '',
      "Amount Paid (INR)": e.amount || 0,
      "Payment Date": e.date ? new Date(e.date).toLocaleDateString('en-IN') : '—',
      "Explanatory Notes": e.notes || '—'
    }));
    exportToCSV(csvData, headers, "office_operational_expenses");
  };

  const exportRefunds = () => {
    const headers = ['Batch', 'Student', 'Refund Amount (INR)', 'Date'];
    const csvData = filteredRefunds.map(r => ({
      Batch: r.student?.course?.name || '—',
      Student: r.student?.name || '—',
      'Refund Amount (INR)': r.amount || 0,
      Date: r.date ? new Date(r.date).toLocaleDateString('en-IN') : '—'
    }));
    exportToCSV(csvData, headers, 'refunds_ledger');
  };

  const isInLogRange = (dateString) => {
    if (!dateString) return false;
    const itemDate = new Date(dateString).toISOString().split('T')[0];
    if (logFilters.startDate && itemDate < logFilters.startDate) return false;
    if (logFilters.endDate && itemDate > logFilters.endDate) return false;
    return true;
  };

  // Daily Logs filter calculations
  const dailyFees = fees.filter(f => {
    if (!f.date) return false;
    if (!isInLogRange(f.date)) return false;
    return f.receiptType !== 'other';
  });

  const dailyOtherReceipts = fees.filter(f => {
    if (!f.date) return false;
    if (!isInLogRange(f.date)) return false;
    return f.receiptType === 'other';
  });

  const dailyExpenses = expenses.filter(e => {
    if (!e.date) return false;
    return isInLogRange(e.date);
  });

  const exportDailyLogs = () => {
    const headers = [
      "Activity Type",
      "Title / Name",
      "Reference Details",
      "Transaction Date",
      "Payment Mode / Flow",
      "Amount (INR)"
    ];
    const csvData = [];
    dailyFees.forEach(f => {
      csvData.push({
        "Activity Type": "Payment Receipt",
        "Title / Name": f.student?.name || '—',
        "Reference Details": f.student?.course?.name || '—',
        "Transaction Date": f.date ? new Date(f.date).toLocaleDateString('en-IN') : '—',
        "Payment Mode / Flow": f.bankName ? `${f.method} (${f.bankName})` : f.method,
        "Amount (INR)": f.paidAmount || f.amount || 0
      });
    });
    dailyOtherReceipts.forEach(f => {
      csvData.push({
        "Activity Type": "Other Receipt",
        "Title / Name": f.title || 'Other Receipt',
        "Reference Details": f.description || '—',
        "Transaction Date": f.date ? new Date(f.date).toLocaleDateString('en-IN') : '—',
        "Payment Mode / Flow": f.bankName ? `${f.method} (${f.bankName})` : f.method,
        "Amount (INR)": f.amount || f.paidAmount || 0
      });
    });
    dailyExpenses.forEach(e => {
      csvData.push({
        "Activity Type": "Expense",
        "Title / Name": e.type || '—',
        "Reference Details": e.notes || '—',
        "Transaction Date": e.date ? new Date(e.date).toLocaleDateString('en-IN') : '—',
        "Payment Mode / Flow": "Outflow",
        "Amount (INR)": e.amount || 0
      });
    });
    const fileName = `daily_financial_logs_${logFilters.startDate}${logFilters.endDate ? `_to_${logFilters.endDate}` : ''}`;
    exportToCSV(csvData, headers, fileName);
  };

  // Calculate totals
  const totalStudents = students.length;
  const totalFees = fees.reduce((sum, f) => sum + (f.paidAmount || f.amount || 0), 0);
  const totalCourses = courses.length;
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalRefunds = refunds.reduce((sum, r) => sum + (r.amount || 0), 0);
 
  // Search and Advanced filter logic
  const filteredStudents = students.filter(s => {
    // 1. Search Query
    const matchesSearch = !searchQuery || 
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.classId?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;

    // 2. Batch Filter
    if (studentFilters.course) {
      const sCourseId = s.course?._id || s.course || '';
      if (sCourseId !== studentFilters.course) return false;
    }

    // 3. Date Filter (createdAt)
    if (studentFilters.startDate || studentFilters.endDate) {
      const dateVal = s.createdAt ? new Date(s.createdAt) : null;
      if (!dateVal) return false;
      if (studentFilters.startDate) {
        const start = new Date(studentFilters.startDate);
        start.setHours(0, 0, 0, 0);
        if (dateVal < start) return false;
      }
      if (studentFilters.endDate) {
        const end = new Date(studentFilters.endDate);
        end.setHours(23, 59, 59, 999);
        if (dateVal > end) return false;
      }
    }

    return true;
  });
  
  const filteredFees = fees.filter(f => {
    // 1. Search Query
    const matchesSearch = !searchQuery ||
      f.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.student?.course?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.paidAmount || f.amount || 0).toString().includes(searchQuery) ||
      (f.totalAmount || 0).toString().includes(searchQuery);
      
    if (!matchesSearch) return false;

    // 2. Batch Filter
    if (feeFilters.course) {
      const fCourseId = f.student?.course?._id || f.student?.course || '';
      if (fCourseId !== feeFilters.course) return false;
    }

    // Student Filter (under the selected Batch)
    if (feeFilters.student) {
      const fStudentId = f.student?._id || f.student || '';
      if (fStudentId !== feeFilters.student) return false;
    }

    // 3. Transaction Mode (UPI / Cash / Bank)
    if (feeFilters.method && f.method !== feeFilters.method) {
      return false;
    }

    // 4. Bank Account Filter (bankName)
    if (feeFilters.bankName && f.bankName !== feeFilters.bankName) {
      return false;
    }

    // 5. Date Filter (date)
    if (feeFilters.startDate || feeFilters.endDate) {
      const dateVal = f.date ? new Date(f.date) : null;
      if (!dateVal) return false;
      if (feeFilters.startDate) {
        const start = new Date(feeFilters.startDate);
        start.setHours(0, 0, 0, 0);
        if (dateVal < start) return false;
      }
      if (feeFilters.endDate) {
        const end = new Date(feeFilters.endDate);
        end.setHours(23, 59, 59, 999);
        if (dateVal > end) return false;
      }
    }

    return true;
  });

  const filteredStudentFees = filteredFees.filter(f => f.receiptType === 'student');
  const filteredOtherReceipts = fees.filter(f => {
    if (f.receiptType !== 'other') return false;
    const matchesSearch = !searchQuery ||
      f.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.amount || f.paidAmount || 0).toString().includes(searchQuery);
    return matchesSearch;
  });

  const filteredCourses = courses.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.classId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExpenses = expenses.filter(e => {
    // 1. Search Query
    const matchesSearch = !searchQuery ||
      e.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.amount?.toString().includes(searchQuery);
      
    if (!matchesSearch) return false;

    // 2. Classification Filter
    if (expenseFilters.classification && e.type !== expenseFilters.classification) {
      return false;
    }

    // 3. Date Filter (date)
    if (expenseFilters.startDate || expenseFilters.endDate) {
      const dateVal = e.date ? new Date(e.date) : null;
      if (!dateVal) return false;
      if (expenseFilters.startDate) {
        const start = new Date(expenseFilters.startDate);
        start.setHours(0, 0, 0, 0);
        if (dateVal < start) return false;
      }
      if (expenseFilters.endDate) {
        const end = new Date(expenseFilters.endDate);
        end.setHours(23, 59, 59, 999);
        if (dateVal > end) return false;
      }
    }

    return true;
  });

  const filteredMainExpenses = filteredExpenses.filter(e => mainExpenseCategories.includes(e.type));
  const filteredOtherExpenses = filteredExpenses.filter(e => !mainExpenseCategories.includes(e.type));

  const filteredRefunds = refunds.filter(r => {
    const matchesSearch = !searchQuery ||
      r.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student?.course?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student?.classId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.amount || 0).toString().includes(searchQuery);

    if (!matchesSearch) return false;

    if (refundFilters.startDate || refundFilters.endDate) {
      const dateVal = r.date ? new Date(r.date) : null;
      if (!dateVal) return false;
      if (refundFilters.startDate) {
        const start = new Date(refundFilters.startDate);
        start.setHours(0, 0, 0, 0);
        if (dateVal < start) return false;
      }
      if (refundFilters.endDate) {
        const end = new Date(refundFilters.endDate);
        end.setHours(23, 59, 59, 999);
        if (dateVal > end) return false;
      }
    }

    return true;
  });

  const statementFees = fees.filter(f => {
    if (!f.date) return false;
    const itemDate = new Date(f.date).toISOString().split('T')[0];
    if (statementFilters.startDate && itemDate < statementFilters.startDate) return false;
    if (statementFilters.endDate && itemDate > statementFilters.endDate) return false;
    const sourceName = f.method === 'cash'
      ? 'Cash'
      : (f.bankName || f.method?.toUpperCase() || 'Bank');
    if (statementFilters.source && statementFilters.source !== sourceName) return false;
    return true;
  });

  const statementSourceOptions = Array.from(new Set(statementFees.map(f => f.method === 'cash' ? 'Cash' : (f.bankName || f.method?.toUpperCase() || 'Bank'))));

  const statementSourceTotals = statementFees.reduce((acc, fee) => {
    const source = fee.method === 'cash'
      ? 'Cash'
      : (fee.bankName || fee.method?.toUpperCase() || 'Bank');
    const batchName = fee.student?.course?.name || 'Unknown Batch';
    const studentName = fee.student?.name || fee.student || 'Unknown Person';

    if (!acc[source]) acc[source] = { source, count: 0, amount: 0, batches: new Set(), persons: new Set() };
    acc[source].count += 1;
    acc[source].amount += (fee.paidAmount || fee.amount || 0);
    acc[source].batches.add(batchName);
    acc[source].persons.add(studentName);
    return acc;
  }, {});

  const statementSourceList = Object.values(statementSourceTotals).map(group => ({
    source: group.source,
    count: group.count,
    amount: group.amount,
    batches: Array.from(group.batches),
    persons: Array.from(group.persons)
  }));

  return (
    <div className="dashboard-layout">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <GraduationCap size={24} color="#ffffff" />
            </div>
            <div className="brand-name-container">
              <span className="brand-name">Vishesh Academy</span>
              <span className="brand-sub">of Commerce</span>
            </div>
          </div>
        </div>

        <div className="sidebar-menu">
          <span className="sidebar-menu-title">Finance Modules</span>
          
          <button 
            className={`menu-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => { setActiveTab('students'); setSearchQuery(''); setIsSidebarOpen(false); }}
          >
            <Users size={18} />
            <span>Students Directory</span>
            <span className="menu-item-badge">{totalStudents}</span>
          </button>

          <button 
            className={`menu-item ${activeTab === 'fees' ? 'active' : ''}`}
            onClick={() => { setActiveTab('fees'); setSearchQuery(''); setIsSidebarOpen(false); }}
          >
            <CreditCard size={18} />
            <span>Payment Receipts</span>
          </button>

          <button 
            className={`menu-item ${activeTab === 'otherReceipts' ? 'active' : ''}`}
            onClick={() => { setActiveTab('otherReceipts'); setSearchQuery(''); setIsSidebarOpen(false); }}
          >
            <FileText size={18} />
            <span>Other Receipts</span>
          </button>

          <button 
            className={`menu-item ${activeTab === 'statement' ? 'active' : ''}`}
            onClick={() => { setActiveTab('statement'); setSearchQuery(''); setIsSidebarOpen(false); }}
          >
            <FileText size={18} />
            <span>Statement</span>
          </button>

          <button 
            className={`menu-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => { setActiveTab('courses'); setSearchQuery(''); setIsSidebarOpen(false); }}
          >
            <Layers size={18} />
            <span>Courses Manager</span>
            <span className="menu-item-badge">{totalCourses}</span>
          </button>

          <button 
            className={`menu-item ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => { setActiveTab('expenses'); setSearchQuery(''); setIsSidebarOpen(false); }}
          >
            <TrendingDown size={18} />
            <span>Office Expenses</span>
          </button>

          <button 
            className={`menu-item ${activeTab === 'refunds' ? 'active' : ''}`}
            onClick={() => { setActiveTab('refunds'); setSearchQuery(''); setIsSidebarOpen(false); }}
          >
            <RotateCcw size={18} />
            <span>Refunds</span>
          </button>

          <button 
            className={`menu-item ${activeTab === 'dailyLogs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dailyLogs'); setSearchQuery(''); setIsSidebarOpen(false); }}
          >
            <Calendar size={18} />
            <span>Daily Activity Logs</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">AD</div>
            <div className="user-info">
              <span className="user-name">Admin Portal</span>
              <span className="user-role">Manager Access</span>
            </div>
          </div>
          <button className="menu-item" onClick={onLogout} style={{ color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.2)', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '8px', padding: '10px 14px' }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        {/* Sticky Top Header */}
        <header className="top-nav">
          <div className="top-nav-left">
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="page-title-container">
              <h2 className="page-title">
                {activeTab === 'students' && 'Students'}
                {activeTab === 'fees' && 'Payment Receipts'}
                {activeTab === 'otherReceipts' && 'Other Receipts'}
                {activeTab === 'courses' && 'Academy Courses'}
                {activeTab === 'expenses' && 'Corporate Expenses'}
                {activeTab === 'refunds' && 'Refunds'}
                {activeTab === 'statement' && 'Statement'}
                {activeTab === 'dailyLogs' && 'Daily Activity Logs'}
              </h2>
              <span className="page-sub">Vishesh Academy of Commerce Dashboard</span>
            </div>
          </div>

          <div className="top-nav-right">
            <button className="btn secondary" onClick={fetchAll}>
              <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
              <span className="hide-mobile">Sync Data</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="container">
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              <span className="loading-dots">Updating system data...</span>
            </div>
          )}

          {/* Core Stat Cards */}
          <div className="stats">
            <div className="stat-card students">
              <div className="stat-info">
                <span className="stat-label">Total Enrolled</span>
                <span className="stat-value">{totalStudents}</span>
              </div>
              <div className="stat-icon-wrapper">
                <Users size={24} />
              </div>
            </div>

            <div className="stat-card fees">
              <div className="stat-info">
                <span className="stat-label">Revenue Collected</span>
                <span className="stat-value">₹{totalFees.toLocaleString('en-IN')}</span>
              </div>
              <div className="stat-icon-wrapper">
                <Wallet size={24} />
              </div>
            </div>

            <div className="stat-card courses">
              <div className="stat-info">
                <span className="stat-label">Total Courses</span>
                <span className="stat-value">{totalCourses}</span>
              </div>
              <div className="stat-icon-wrapper">
                <Layers size={24} />
              </div>
            </div>

            <div className="stat-card expenses">
              <div className="stat-info">
                <span className="stat-label">Total Expenses</span>
                <span className="stat-value">₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="stat-icon-wrapper">
                <TrendingDown size={24} />
              </div>
            </div>

            <div className="stat-card refunds">
              <div className="stat-info">
                <span className="stat-label">Total Refunded</span>
                <span className="stat-value">₹{totalRefunds.toLocaleString('en-IN')}</span>
              </div>
              <div className="stat-icon-wrapper">
                <RotateCcw size={24} />
              </div>
            </div>
          </div>

          {/* Students Directory Component */}
          {activeTab === 'students' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <div className="card-title-icon">
                    <Users size={20} />
                  </div>
                  <h3>Students List</h3>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                  <div className="search-wrapper">
                    <Search size={16} className="search-icon-inside" />
                    <input 
                      type="text"
                      className="search-input"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="btn" onClick={() => openAddForm('students')}>
                    <Plus size={16} />
                    <span>Add Student</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Filter Bar */}
              <div style={{
                display: 'flex',
                gap: '16px',
                padding: '16px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Filters:
                </span>
                
                {/* Batch Selector Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Batch:</label>
                  <select
                    value={studentFilters.course}
                    onChange={(e) => setStudentFilters(prev => ({ ...prev, course: e.target.value }))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">All Batches</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Admission Date Filter (Start Date) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>From Date:</label>
                  <input
                    type="date"
                    value={studentFilters.startDate}
                    onChange={(e) => setStudentFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* Admission Date Filter (End Date) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>To Date:</label>
                  <input
                    type="date"
                    value={studentFilters.endDate}
                    onChange={(e) => setStudentFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* Reset Filters button */}
                {(studentFilters.course || studentFilters.startDate || studentFilters.endDate) && (
                  <button
                    onClick={() => setStudentFilters({ course: '', startDate: '', endDate: '' })}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    Reset Filters
                  </button>
                )}

                {/* Download CSV button */}
                <button
                  onClick={exportStudents}
                  style={{
                    background: '#10b981',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    marginLeft: 'auto',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.15)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#059669'}
                  onMouseLeave={(e) => e.target.style.background = '#10b981'}
                >
                  <FileText size={14} />
                  <span>Download Excel/CSV</span>
                </button>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Users size={32} />
                  </div>
                  <h4>No students found</h4>
                  <p>{searchQuery ? 'Try adjusting your search criteria' : 'Enroll a student to get started.'}</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Parent's Name</th>
                        <th>Contact Number</th>
                        <th>Batch Code</th>
                        <th style={{ textAlign: 'right' }}>Management Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(s => (
                        <tr key={s._id}>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>
                            <div style={{ fontSize: '15px' }}>{s.name}</div>
                          </td>
                          <td style={{ color: '#1e293b', fontWeight: '600', fontSize: '14px' }}>
                            {s.parentName || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 'normal' }}>Not Set</span>}
                          </td>
                          <td style={{ color: '#0f172a', fontWeight: '600', fontSize: '14px' }}>
                            {s.contact || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 'normal' }}>Not Set</span>}
                          </td>
                          <td>
                            <span className="badge info" style={{ padding: '6px 10px', fontSize: '12px', fontWeight: '600' }}>
                              {s.classId || 'N/A'}
                            </span>
                          </td>
                          <td className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-small secondary" onClick={() => openEditForm('students', s)}>
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                            <button className="btn btn-small danger" onClick={() => deleteStudent(s._id)}>
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Fees Tracking Component */}
          {activeTab === 'fees' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <div className="card-title-icon" style={{ color: '#10b981', background: '#d1fae5' }}>
                    <CreditCard size={20} />
                  </div>
                  <h3>Payment Receipt Ledger</h3>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                  <div className="search-wrapper">
                    <Search size={16} className="search-icon-inside" />
                    <input 
                      type="text"
                      className="search-input"
                      placeholder="Search payment receipts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="btn" onClick={() => openAddForm('fees')} style={{ background: '#10b981', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)' }}>
                    <Plus size={16} />
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Filter Bar */}
              <div style={{
                display: 'flex',
                gap: '16px',
                padding: '16px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Filters:
                </span>
                
                {/* Batch Selector Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Batch:</label>
                  <select
                    value={feeFilters.course}
                    onChange={(e) => setFeeFilters(prev => ({ ...prev, course: e.target.value, student: '' }))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">All Batches</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Student Filter (Cascaded under Batch selection) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Student:</label>
                  <select
                    value={feeFilters.student || ''}
                    onChange={(e) => setFeeFilters(prev => ({ ...prev, student: e.target.value }))}
                    disabled={!feeFilters.course}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: feeFilters.course ? '#ffffff' : '#f1f5f9',
                      color: feeFilters.course ? '#1e293b' : '#94a3b8',
                      cursor: feeFilters.course ? 'pointer' : 'not-allowed',
                      maxWidth: '180px'
                    }}
                  >
                    <option value="">{feeFilters.course ? 'All Enrolled Students' : 'Select Batch First'}</option>
                    {feeFilters.course && students
                      .filter(s => (s.course?._id || s.course || '') === feeFilters.course)
                      .map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))
                    }
                  </select>
                </div>

                {/* Transaction Mode Selector Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Mode:</label>
                  <select
                    value={feeFilters.method}
                    onChange={(e) => setFeeFilters(prev => ({ ...prev, method: e.target.value }))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">All Modes</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="upi">UPI / QR</option>
                  </select>
                </div>

                {/* Bank / Cash Account Selector Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Account/Bank:</label>
                  <select
                    value={feeFilters.bankName}
                    onChange={(e) => setFeeFilters(prev => ({ ...prev, bankName: e.target.value }))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">All Accounts/Banks</option>
                    {Array.from(new Set(fees.map(f => f.bankName).filter(Boolean))).map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Date Filter (Start Date) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>From:</label>
                  <input
                    type="date"
                    value={feeFilters.startDate}
                    onChange={(e) => setFeeFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* Payment Date Filter (End Date) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>To:</label>
                  <input
                    type="date"
                    value={feeFilters.endDate}
                    onChange={(e) => setFeeFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* Reset Filters button */}
                {(feeFilters.course || feeFilters.method || feeFilters.bankName || feeFilters.startDate || feeFilters.endDate || feeFilters.student) && (
                  <button
                    onClick={() => setFeeFilters({ course: '', method: '', bankName: '', startDate: '', endDate: '', student: '' })}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    Reset Filters
                  </button>
                )}

                {/* Download CSV button */}
                <button
                  onClick={exportFees}
                  style={{
                    background: '#10b981',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    marginLeft: 'auto',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.15)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#059669'}
                  onMouseLeave={(e) => e.target.style.background = '#10b981'}
                >
                  <FileText size={14} />
                  <span>Download Excel/CSV</span>
                </button>
              </div>

              {filteredStudentFees.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <CreditCard size={32} />
                  </div>
                  <h4>No transactions recorded</h4>
                  <p>{searchQuery ? 'Try adjusting your search query' : 'Record your first student payment receipt.'}</p>
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
                        <th style={{ textAlign: 'right' }}>Management Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudentFees.map(f => {
                        const studentId = f.student?._id || f.student;
                        const studentFees = fees.filter(fee => (fee.student?._id || fee.student) === studentId);
                        
                        const total = f.totalAmount || f.amount || 0;
                        const receivedAmount = f.paidAmount || f.amount || 0;
                        
                        // Total paid so far across all transactions
                        const totalPaid = studentFees.reduce((sum, fee) => sum + (fee.amount || fee.paidAmount || 0), 0);
                        const overallRemaining = Math.max(0, total - totalPaid);
                        
                        return (
                          <tr key={f._id}>
                            <td style={{ fontWeight: '600', color: '#0f172a' }}>
                              <div style={{ fontSize: '15px' }}>{f.student?.name || '—'}</div>
                            </td>
                            <td style={{ color: '#0f172a', fontWeight: '500', fontSize: '14px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={13} style={{ color: '#64748b' }} />
                                {new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </td>
                            <td style={{ fontWeight: '700', color: '#16a34a', fontSize: '15px' }}>
                              ₹{receivedAmount.toLocaleString('en-IN')}
                            </td>
                            <td>
                              <div>
                                <span className={`badge ${f.method === 'cash' ? 'warning' : (f.method === 'upi' ? 'success' : 'info')}`} style={{
                                  padding: '5px 8px',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  {f.method === 'cash' && 'Cash'}
                                  {f.method === 'bank' && 'Bank'}
                                  {f.method === 'upi' && 'UPI'}
                                </span>
                                {f.bankName && (
                                  <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500', marginTop: '4px' }}>
                                    {f.bankName}
                                  </div>
                                )}
                              </div>
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
                            <td className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                              <button className="btn btn-small secondary" onClick={() => openEditForm('fees', f)}>
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>
                              <button className="btn btn-small danger" onClick={() => deleteFee(f._id)}>
                                <Trash2 size={12} />
                                <span>Delete</span>
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
          )}

          {activeTab === 'otherReceipts' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <div className="card-title-icon" style={{ color: '#6366f1', background: '#eef2ff' }}>
                    <FileText size={20} />
                  </div>
                  <h3>Other Receipts Ledger</h3>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                  <div className="search-wrapper">
                    <Search size={16} className="search-icon-inside" />
                    <input 
                      type="text"
                      className="search-input"
                      placeholder="Search other receipts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="btn" onClick={() => openAddForm('otherReceipt')} style={{ background: '#6366f1', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.15)' }}>
                    <Plus size={16} />
                    <span>Record Other Receipt</span>
                  </button>
                </div>
              </div>

              {filteredOtherReceipts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FileText size={32} />
                  </div>
                  <h4>No other receipts recorded</h4>
                  <p>{searchQuery ? 'Try adjusting your search query' : 'Record your first custom receipt.'}</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Receipt Title</th>
                        <th>Description</th>
                        <th>Received On</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOtherReceipts.map(f => (
                        <tr key={f._id}>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>{f.title || 'Other Receipt'}</td>
                          <td style={{ color: '#334155', fontSize: '14px' }}>{f.description || 'No description provided'}</td>
                          <td style={{ color: '#0f172a', fontWeight: '500', fontSize: '14px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={13} style={{ color: '#64748b' }} />
                              {new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td style={{ fontWeight: '700', color: '#16a34a', fontSize: '15px' }}>
                            ₹{(f.amount || f.paidAmount || 0).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <span className={`badge ${f.method === 'cash' ? 'warning' : (f.method === 'upi' ? 'success' : 'info')}`} style={{
                              padding: '5px 8px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {f.method === 'cash' && 'Cash'}
                              {f.method === 'bank' && 'Bank'}
                              {f.method === 'upi' && 'UPI'}
                            </span>
                            {f.bankName && (
                              <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500', marginTop: '4px' }}>
                                {f.bankName}
                              </div>
                            )}
                          </td>
                          <td className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-small secondary" onClick={() => openEditForm('otherReceipt', f)}>
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                            <button className="btn btn-small danger" onClick={() => deleteFee(f._id)}>
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'statement' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <div className="card-title-icon" style={{ color: '#0f766e', background: '#d8f5f1' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3>Statement</h3>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Cash and bank entry summary for chosen dates</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>From:</label>
                    <input
                      type="date"
                      value={statementFilters.startDate}
                      onChange={(e) => setStatementFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', color: '#1e293b' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>To:</label>
                    <input
                      type="date"
                      value={statementFilters.endDate}
                      onChange={(e) => setStatementFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', color: '#1e293b' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Source:</label>
                    <select
                      value={statementFilters.source}
                      onChange={(e) => setStatementFilters(prev => ({ ...prev, source: e.target.value }))}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', color: '#1e293b', cursor: 'pointer' }}
                    >
                      <option value="">All Sources</option>
                      {statementSourceOptions.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#166534', textTransform: 'uppercase' }}>Total Entries</span>
                  <h3 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: '800', color: '#14532d' }}>{statementFees.length}</h3>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '20px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', textTransform: 'uppercase' }}>Total Amount</span>
                  <h3 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: '800', color: '#1e3a8a' }}>₹{statementFees.reduce((sum, f) => sum + (f.paidAmount || f.amount || 0), 0).toLocaleString('en-IN')}</h3>
                </div>
              </div>

              {statementSourceList.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FileText size={32} />
                  </div>
                  <h4>No statement entries found</h4>
                  <p>Use the date range filter to display Cash, Bank, or UPI receipts.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Entry Count</th>
                        <th>Total Amount</th>
                        <th>Batch / Course</th>
                        <th>Person</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statementSourceList.map(group => (
                        <tr key={group.source}>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>{group.source}</td>
                          <td style={{ fontWeight: '700', color: '#0f172a' }}>{group.count}</td>
                          <td style={{ fontWeight: '700', color: '#0f172a' }}>₹{group.amount.toLocaleString('en-IN')}</td>
                          <td style={{ color: '#64748b', fontSize: '14px' }}>
                            {group.batches.length > 0 ? group.batches.join(', ') : '—'}
                          </td>
                          <td style={{ color: '#64748b', fontSize: '14px' }}>
                            {group.persons.length > 0 ? group.persons.join(', ') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Courses Component */}
          {activeTab === 'courses' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <div className="card-title-icon" style={{ color: '#06b6d4', background: '#ecfeff' }}>
                    <BookOpen size={20} />
                  </div>
                  <h3>Courses Registry</h3>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                  <div className="search-wrapper">
                    <Search size={16} className="search-icon-inside" />
                    <input 
                      type="text"
                      className="search-input"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="btn" onClick={() => openAddForm('courses')} style={{ background: '#06b6d4', boxShadow: '0 4px 10px rgba(6, 182, 212, 0.15)' }}>
                    <Plus size={16} />
                    <span>Add Course</span>
                  </button>
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <BookOpen size={32} />
                  </div>
                  <h4>No courses registered</h4>
                  <p>{searchQuery ? 'No match found' : 'Create a course syllabus to begin.'}</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Batch / Course Name</th>
                        <th>Base Course Name</th>
                        <th>Session Month / Year</th>
                        <th>Batch Code ID</th>
                        <th style={{ textAlign: 'right' }}>Management Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map(c => (
                        <tr key={c._id}>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>{c.name}</td>
                          <td style={{ color: '#475569' }}>{c.courseName || c.className || '—'}</td>
                          <td style={{ color: '#475569' }}>
                            {c.month && c.year ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={12} />
                                {c.month} {c.year}
                              </span>
                            ) : '—'}
                          </td>
                          <td>
                            <span className="badge info">{c.classId || 'N/A'}</span>
                          </td>
                          <td className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-small secondary" onClick={() => openEditForm('courses', c)}>
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                            <button className="btn btn-small danger" onClick={() => deleteCourse(c._id)}>
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Refunds Tracking Component */}
          {activeTab === 'refunds' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <div className="card-title-icon" style={{ color: '#ea580c', background: '#ffedd5' }}>
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <h3>Refund Ledger</h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {filteredRefunds.length} entries · ₹{filteredRefunds.reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString('en-IN')} filtered
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                  <div className="search-wrapper">
                    <Search size={16} className="search-icon-inside" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search refunds..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="btn" onClick={() => openAddForm('refunds')} style={{ background: '#ea580c', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.15)' }}>
                    <Plus size={16} />
                    <span>Record Refund</span>
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '16px',
                padding: '16px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Filters:
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>From:</label>
                  <input
                    type="date"
                    value={refundFilters.startDate}
                    onChange={(e) => setRefundFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>To:</label>
                  <input
                    type="date"
                    value={refundFilters.endDate}
                    onChange={(e) => setRefundFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                {(refundFilters.startDate || refundFilters.endDate) && (
                  <button
                    onClick={() => setRefundFilters({ startDate: '', endDate: '' })}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                  >
                    Reset Filters
                  </button>
                )}

                <button
                  onClick={exportRefunds}
                  style={{
                    background: '#10b981',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    marginLeft: 'auto'
                  }}
                >
                  <FileText size={14} />
                  <span>Download CSV</span>
                </button>
              </div>

              {filteredRefunds.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <RotateCcw size={32} />
                  </div>
                  <h4>No refunds recorded</h4>
                  <p>{searchQuery ? 'Try adjusting your search or filters' : 'Record your first refund entry.'}</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Batch</th>
                        <th>Student</th>
                        <th>Refund Date</th>
                        <th>Amount Refunded</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRefunds.map(r => (
                        <tr key={r._id}>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>
                            {r.student?.course?.name || '—'}
                            {r.student?.classId ? (
                              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{r.student.classId}</div>
                            ) : null}
                          </td>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>{r.student?.name || '—'}</td>
                          <td style={{ color: '#64748b' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={12} />
                              {r.date ? new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </span>
                          </td>
                          <td style={{ fontWeight: '700', color: '#ea580c', fontSize: '15px' }}>
                            ₹{(r.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-small secondary" onClick={() => openEditForm('refunds', r)}>
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                            <button className="btn btn-small danger" onClick={() => deleteRefund(r._id)}>
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Expenses Tracking Component */}
          {activeTab === 'expenses' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <div className="card-title-icon" style={{ color: '#f43f5e', background: '#ffe4e6' }}>
                    <TrendingDown size={20} />
                  </div>
                  <h3>Office Operational Expenses</h3>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                  <div className="search-wrapper">
                    <Search size={16} className="search-icon-inside" />
                    <input 
                      type="text"
                      className="search-input"
                      placeholder="Search expenses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="btn" onClick={() => openAddForm('expenses')} style={{ background: '#f43f5e', boxShadow: '0 4px 10px rgba(244, 63, 94, 0.15)' }}>
                    <Plus size={16} />
                    <span>Record Expense</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Filter Bar */}
              <div style={{
                display: 'flex',
                gap: '16px',
                padding: '16px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Filters:
                </span>
                
                {/* Classification Selector Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Classification:</label>
                  <select
                    value={expenseFilters.classification}
                    onChange={(e) => setExpenseFilters(prev => ({ ...prev, classification: e.target.value }))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">All Categories</option>
                    {Array.from(new Set(expenses.map(exp => exp.type).filter(Boolean))).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Expense Date Filter (Start Date) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>From Date:</label>
                  <input
                    type="date"
                    value={expenseFilters.startDate}
                    onChange={(e) => setExpenseFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* Expense Date Filter (End Date) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>To Date:</label>
                  <input
                    type="date"
                    value={expenseFilters.endDate}
                    onChange={(e) => setExpenseFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* Reset Filters button */}
                {(expenseFilters.classification || expenseFilters.startDate || expenseFilters.endDate) && (
                  <button
                    onClick={() => setExpenseFilters({ classification: '', startDate: '', endDate: '' })}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    Reset Filters
                  </button>
                )}

                {/* Download CSV button */}
                <button
                  onClick={exportExpenses}
                  style={{
                    background: '#10b981',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    marginLeft: 'auto',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.15)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#059669'}
                  onMouseLeave={(e) => e.target.style.background = '#10b981'}
                >
                  <FileText size={14} />
                  <span>Download Excel/CSV</span>
                </button>
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <TrendingDown size={32} />
                  </div>
                  <h4>No expense receipts found</h4>
                  <p>{searchQuery ? 'Adjust your keyword' : 'Create an expense log for bills, salaries, rent etc.'}</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gap: '24px' }}>
                    <div className="card" style={{ padding: '0', border: '1px solid #e2e8f0' }}>
                      <div className="card-header" style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <div className="card-title-group">
                          <div className="card-title-icon" style={{ color: '#1d4ed8', background: '#dbeafe' }}>
                            <Clipboard size={20} />
                          </div>
                          <div>
                            <h3>Main Expenses</h3>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{filteredMainExpenses.length} entries · ₹{filteredMainExpenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                      {filteredMainExpenses.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                          No main expense entries match the current filters.
                        </div>
                      ) : (
                        <div className="table-container">
                          <table>
                            <thead>
                              <tr>
                                <th>Classification</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Notes</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredMainExpenses.map(e => (
                                <tr key={e._id}>
                                  <td style={{ fontWeight: '600', color: '#0f172a' }}>{e.type}</td>
                                  <td style={{ fontWeight: '700', color: '#1d4ed8' }}>₹{e.amount?.toLocaleString('en-IN') || '0'}</td>
                                  <td style={{ color: '#64748b' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      <Calendar size={12} />
                                      {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </td>
                                  <td style={{ maxWidth: '220px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#64748b' }}>
                                    {e.notes || '—'}
                                  </td>
                                  <td className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                                    <button className="btn btn-small secondary" onClick={() => openEditForm('expenses', e)}>
                                      <Edit2 size={12} />
                                      <span>Edit</span>
                                    </button>
                                    <button className="btn btn-small danger" onClick={() => deleteExpense(e._id)}>
                                      <Trash2 size={12} />
                                      <span>Delete</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="card" style={{ padding: '0', border: '1px solid #e2e8f0' }}>
                      <div className="card-header" style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <div className="card-title-group">
                          <div className="card-title-icon" style={{ color: '#2563eb', background: '#dbeafe' }}>
                            <Archive size={20} />
                          </div>
                          <div>
                            <h3>Other Expenses</h3>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{filteredOtherExpenses.length} entries · ₹{filteredOtherExpenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                      {filteredOtherExpenses.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                          No other expense entries match the current filters.
                        </div>
                      ) : (
                        <div className="table-container">
                          <table>
                            <thead>
                              <tr>
                                <th>Title</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Notes</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredOtherExpenses.map(e => (
                                <tr key={e._id}>
                                  <td style={{ fontWeight: '600', color: '#0f172a' }}>{e.type}</td>
                                  <td style={{ fontWeight: '700', color: '#2563eb' }}>₹{e.amount?.toLocaleString('en-IN') || '0'}</td>
                                  <td style={{ color: '#64748b' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      <Calendar size={12} />
                                      {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </td>
                                  <td style={{ maxWidth: '220px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#64748b' }}>
                                    {e.notes || '—'}
                                  </td>
                                  <td className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                                    <button className="btn btn-small secondary" onClick={() => openEditForm('expenses', e)}>
                                      <Edit2 size={12} />
                                      <span>Edit</span>
                                    </button>
                                    <button className="btn btn-small danger" onClick={() => deleteExpense(e._id)}>
                                      <Trash2 size={12} />
                                      <span>Delete</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Daily Activity Logs Tab */}
          {activeTab === 'dailyLogs' && (
            <div>
              {/* Daily Logs Header / Filter Bar */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px 24px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  background: '#ffffff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      color: '#6366f1',
                      background: '#e0e7ff',
                      padding: '8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Daily Logs Ledger</h3>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Track payment receipts, other receipts, and expenses within a custom date range</span>
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>From:</label>
                      <input
                        type="date"
                        value={logFilters.startDate}
                        onChange={(e) => setLogFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          background: '#ffffff',
                          color: '#1e293b',
                          fontWeight: '600',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>To:</label>
                      <input
                        type="date"
                        value={logFilters.endDate}
                        onChange={(e) => setLogFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          background: '#ffffff',
                          color: '#1e293b',
                          fontWeight: '600',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </div>

                  {/* Excel/CSV Export button */}
                  <button
                    onClick={exportDailyLogs}
                    style={{
                      background: '#10b981',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      marginLeft: 'auto',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.15)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#059669'}
                    onMouseLeave={(e) => e.target.style.background = '#10b981'}
                  >
                    <FileText size={14} />
                    <span>Download Excel/CSV</span>
                  </button>
                </div>
              </div>

              {/* Day's Financial Summary Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                {/* Payment Receipts */}
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ background: '#d1fae5', color: '#16a34a', padding: '10px', borderRadius: '10px' }}>
                    <Plus size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#166534', textTransform: 'uppercase' }}>Payment Receipts</span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: '#14532d' }}>
                      ₹{dailyFees.reduce((sum, f) => sum + (f.paidAmount || f.amount || 0), 0).toLocaleString('en-IN')}
                    </h3>
                    <span style={{ fontSize: '11px', color: '#15803d' }}>{dailyFees.length} entries</span>
                  </div>
                </div>

                {/* Other Receipts */}
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ background: '#dbeafe', color: '#2563eb', padding: '10px', borderRadius: '10px' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', textTransform: 'uppercase' }}>Other Receipts</span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: '#1e3a8a' }}>
                      ₹{dailyOtherReceipts.reduce((sum, f) => sum + (f.amount || f.paidAmount || 0), 0).toLocaleString('en-IN')}
                    </h3>
                    <span style={{ fontSize: '11px', color: '#1d4ed8' }}>{dailyOtherReceipts.length} entries</span>
                  </div>
                </div>

                {/* Office Expenses */}
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ background: '#ffe4e6', color: '#f43f5e', padding: '10px', borderRadius: '10px' }}>
                    <TrendingDown size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#991b1b', textTransform: 'uppercase' }}>Office Expenses</span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: '#7f1d1d' }}>
                      ₹{dailyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString('en-IN')}
                    </h3>
                    <span style={{ fontSize: '11px', color: '#b91c1c' }}>{dailyExpenses.length} entries</span>
                  </div>
                </div>
              </div>

              {/* Side-by-side Tables Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
                
                {/* Inflow Card (Fees) */}
                <div className="card">
                  <div className="card-header" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#16a34a' }}>●</span> Payment Receipts
                    </h3>
                  </div>
                  {dailyFees.length === 0 ? (
                    <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '500' }}>No payment receipts logged for the selected range.</p>
                    </div>
                  ) : (
                    <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Mode</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyFees.map(f => (
                            <tr key={f._id}>
                              <td style={{ fontWeight: '600' }}>
                                <div>{f.student?.name || '—'}</div>
                                <span style={{ fontSize: '11px', color: '#6366f1' }}>{f.student?.course?.name || ''}</span>
                              </td>
                              <td>
                                <span className={`badge ${f.method === 'cash' ? 'warning' : (f.method === 'upi' ? 'success' : 'info')}`} style={{ padding: '4px 6px', fontSize: '10px' }}>
                                  {f.method === 'cash' ? 'Cash' : (f.method === 'upi' ? 'UPI' : 'Bank')}
                                </span>
                                {f.bankName && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{f.bankName}</div>}
                              </td>
                              <td style={{ fontWeight: '700', color: '#16a34a' }}>
                                ₹{(f.paidAmount || f.amount || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Other Receipts Card */}
                <div className="card">
                  <div className="card-header" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#2563eb' }}>●</span> Other Receipts
                    </h3>
                  </div>
                  {dailyOtherReceipts.length === 0 ? (
                    <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '500' }}>No other receipts logged for the selected range.</p>
                    </div>
                  ) : (
                    <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyOtherReceipts.map(f => (
                            <tr key={f._id}>
                              <td style={{ fontWeight: '600' }}>{f.title || 'Other Receipt'}</td>
                              <td style={{ color: '#64748b', fontSize: '12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {f.description || '—'}
                              </td>
                              <td style={{ fontWeight: '700', color: '#2563eb' }}>
                                ₹{(f.amount || f.paidAmount || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Outflow Card (Expenses) */}
                <div className="card">
                  <div className="card-header" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#f43f5e' }}>●</span> Expenses
                    </h3>
                  </div>
                  {dailyExpenses.length === 0 ? (
                    <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '500' }}>No expense entries logged for the selected range.</p>
                    </div>
                  ) : (
                    <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Classification</th>
                            <th>Notes</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyExpenses.map(e => (
                            <tr key={e._id}>
                              <td style={{ fontWeight: '600' }}>{e.type || '—'}</td>
                              <td style={{ color: '#64748b', fontSize: '12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {e.notes || '—'}
                              </td>
                              <td style={{ fontWeight: '700', color: '#dc2626' }}>
                                ₹{(e.amount || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modern Dialog Form Modal */}
      <div className={`modal ${showModal ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>
              {showModal === 'students' && (editingId ? 'Modify Student Details' : 'Enroll New Student')}
              {(showModal === 'fees' || showModal === 'otherReceipt') && (editingId ? 'Modify Receipt Details' : (formData.receiptType === 'other' ? 'Record Other Receipt' : 'Record Student Payment'))}
              {showModal === 'courses' && (editingId ? 'Modify Course details' : 'Register New Course')}
              {showModal === 'expenses' && (editingId ? 'Modify Expense details' : 'Log Operational Expense')}
              {showModal === 'refunds' && (editingId ? 'Modify Refund' : 'Record Refund')}
            </h3>
            <button className="modal-close" onClick={closeModal}>
              <X size={16} />
            </button>
          </div>

          {showModal === 'students' && (
            <form onSubmit={saveStudent}>
              <div className="form-group">
                <label>Student Full Name *</label>
                <input 
                  name="name" 
                  type="text"
                  placeholder="Enter student's full name"
                  value={formData.name || ''} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Parent's Name *</label>
                  <input 
                    name="parentName" 
                    type="text"
                    placeholder="Enter parent's name"
                    value={formData.parentName || ''} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input 
                    name="contact" 
                    type="text"
                    placeholder="Enter contact number"
                    value={formData.contact || ''} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Select Batch / Course *</label>
                <select 
                  name="course" 
                  value={formData.course || ''} 
                  onChange={(e) => {
                    const selectedCourseId = e.target.value;
                    const selectedCourse = courses.find(c => c._id === selectedCourseId);
                    setFormData(prev => ({
                      ...prev,
                      course: selectedCourseId,
                      classId: selectedCourse ? selectedCourse.classId : prev.classId
                    }));
                  }}
                  required
                >
                  <option value="">Select a Batch</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.classId || 'No Code'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Classroom Code / Batch ID</label>
                <input 
                  name="classId" 
                  type="text"
                  placeholder="e.g. CA-FOUNDATION-MAY-2026"
                  value={formData.classId || ''} 
                  onChange={handleInputChange} 
                  disabled
                  style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn">Save Profile</button>
                <button type="button" className="btn secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          )}

          {(showModal === 'fees' || showModal === 'otherReceipt') && (() => {
            const isOtherReceipt = formData.receiptType === 'other';
            const selectedCourseId = formData.course || '';
            const filteredStudentsForFee = students.filter(s => {
              const studentCourseId = s.course?._id || s.course || '';
              return selectedCourseId ? studentCourseId === selectedCourseId : true;
            });

            const selectedStudentId = formData.student || '';
            
            // Get all existing fees for this student (excluding the current one if in edit mode)
            const studentFees = fees.filter(f => {
              const studentId = f.student?._id || f.student;
              const matchesStudent = studentId === selectedStudentId;
              const isNotCurrentEdit = editingId ? f._id !== editingId : true;
              return matchesStudent && isNotCurrentEdit;
            });

            // Calculate total and paid so far
            const totalPaidSoFar = studentFees.reduce((sum, f) => sum + (f.amount || f.paidAmount || 0), 0);
            const existingTotalAmount = studentFees[0]?.totalAmount || 0;

            const total = parseFloat(formData.totalAmount !== undefined ? formData.totalAmount : (existingTotalAmount || 0));
            const newPayment = parseFloat(formData.paidAmount || 0);
            const currentRemaining = Math.max(0, total - totalPaidSoFar);
            const newRemaining = Math.max(0, total - totalPaidSoFar - newPayment);

            return (
              <form onSubmit={saveFee}>
                {!isOtherReceipt ? (
                  <>
                    {/* Course Selection */}
                    <div className="form-group">
                      <label>Select Course / Batch *</label>
                      <select 
                        name="course" 
                        value={formData.course || ''} 
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            course: value,
                            student: '', // Reset student selection when course changes
                            totalAmount: undefined,
                            paidAmount: ''
                          }));
                        }}
                        required
                        disabled={!!editingId}
                        style={editingId ? { background: '#f1f5f9', cursor: 'not-allowed' } : {}}
                      >
                        <option value="">Select a Course / Batch</option>
                        {courses.map(c => (
                          <option key={c._id} value={c._id}>
                            {c.name} ({c.classId || 'No Code'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Enrolled Students Selection */}
                    <div className="form-group">
                      <label>Select Enrolled Student *</label>
                      <select 
                        name="student" 
                        value={formData.student || ''} 
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            student: value,
                            totalAmount: undefined,
                            paidAmount: ''
                          }));
                        }} 
                        required
                        disabled={!!editingId}
                        style={editingId ? { background: '#f1f5f9', cursor: 'not-allowed' } : {}}
                      >
                        <option value="">
                          {selectedCourseId 
                            ? `Select Student (${filteredStudentsForFee.length} Enrolled)` 
                            : 'Select Student (Select Course first)'
                          }
                        </option>
                        {filteredStudentsForFee.map(s => (
                          <option key={s._id} value={s._id}>
                            {s.name} {s.contact ? `(Ph: ${s.contact})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Optional payment history lookup display */}
                    {selectedStudentId && (
                      totalPaidSoFar > 0 ? (
                        <div style={{
                          background: '#f0f6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          marginBottom: '16px'
                        }}>
                          <h4 style={{ color: '#1e40af', margin: 0, fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📋</span> Student Payment History Found
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', color: '#1e3a8a', marginTop: '8px' }}>
                            <div>Course Price: <strong>₹{total.toLocaleString('en-IN')}</strong></div>
                            <div>Already Paid: <strong style={{ color: '#16a34a' }}>₹{totalPaidSoFar.toLocaleString('en-IN')}</strong></div>
                            <div style={{ gridColumn: 'span 2', borderTop: '1px dashed #bfdbfe', paddingTop: '6px', marginTop: '2px', fontWeight: '600' }}>
                              Remaining Due Before Today: <span style={{ color: currentRemaining === 0 ? '#16a34a' : '#ea580c' }}>₹{currentRemaining.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          marginBottom: '16px',
                          textAlign: 'center',
                          fontSize: '12px',
                          color: '#64748b',
                          fontWeight: '500'
                        }}>
                          🎉 First fee entry for this student.
                        </div>
                      )
                    )}

                    {/* Fees Amount Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label>Total Course Fees (INR) *</label>
                        <input 
                          name="totalAmount" 
                          type="number" 
                          placeholder="e.g. 20000"
                          value={formData.totalAmount !== undefined ? formData.totalAmount : (existingTotalAmount || '')} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label>New Payment Received Now (INR) *</label>
                        <input 
                          name="paidAmount" 
                          type="number" 
                          placeholder="e.g. 5000"
                          value={formData.paidAmount || ''} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                    </div>

                    {/* Live Remaining Fees Preview */}
                    {selectedStudentId && (
                      <div style={{
                        background: newRemaining === 0 ? '#f0fdf4' : '#fff7ed',
                        border: newRemaining === 0 ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '12px', color: newRemaining === 0 ? '#15803d' : '#c2410c', fontWeight: '500' }}>
                            New Remaining Balance after today's payment
                          </span>
                          <span style={{ fontSize: '20px', fontWeight: '700', color: newRemaining === 0 ? '#166534' : '#9a3412', marginTop: '2px' }}>
                            ₹{newRemaining.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          padding: '4px 8px',
                          borderRadius: '20px',
                          background: newRemaining === 0 ? '#dcfce7' : '#ffedd5',
                          color: newRemaining === 0 ? '#15803d' : '#ea580c'
                        }}>
                          {newRemaining === 0 ? 'Fully Paid' : 'Pending Dues'}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Receipt Title *</label>
                      <input
                        name="title"
                        type="text"
                        placeholder="e.g. Misc payment, donation, custom receipt"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Receipt Description</label>
                      <input
                        name="description"
                        type="text"
                        placeholder="Describe the receipt details"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Amount Received (INR) *</label>
                      <input
                        name="amount"
                        type="number"
                        placeholder="e.g. 4500"
                        value={formData.amount || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {/* Payment Date Selector */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Payment Date *</label>
                    <input 
                      name="date" 
                      type="date" 
                      value={formData.date ? formData.date.split('T')[0] : new Date().toISOString().split('T')[0]} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Mode of Transaction *</label>
                    <select 
                      name="method" 
                      value={formData.method || 'cash'} 
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ 
                          ...prev, 
                          method: value,
                          bankName: '' // reset bankName when switching payment methods
                        }));
                      }} 
                      required
                    >
                      <option value="cash">Cash Payment</option>
                      <option value="bank">Bank Transfer / Online</option>
                      <option value="upi">UPI / QR Payment</option>
                    </select>
                  </div>
                </div>

                {/* Bank / Account Selector & Combobox */}
                {(() => {
                  const method = formData.method || 'cash';
                  const labelText = method === 'bank' ? 'Select or Type Bank Name *' : (method === 'upi' ? 'Select or Type UPI App/Account *' : 'Select or Type Cash Account *');
                  const placeholderText = method === 'bank' ? 'e.g. SBI, HDFC, PNB Bank...' : (method === 'upi' ? 'e.g. GPay, PhonePe, Paytm...' : 'e.g. Main Cash Drawer, Office Cash...');
                  
                  // Get ALL previously entered bank/account names commonly from database across all methods
                  const filteredUniqueBanks = Array.from(
                    new Set(
                      fees
                        .filter(f => f.bankName)
                        .map(f => f.bankName)
                    )
                  );

                  // Filter options by currently typed value
                  const searchVal = formData.bankName || '';
                  const matchingBanks = filteredUniqueBanks.filter(bank => 
                    bank.toLowerCase().includes(searchVal.toLowerCase())
                  );

                  return (
                    <div className="form-group" style={{ position: 'relative' }}>
                      <label>{labelText}</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          name="bankName"
                          type="text" 
                          placeholder={placeholderText} 
                          value={formData.bankName || ''}
                          onChange={handleInputChange}
                          onFocus={() => setShowBankDropdown(true)}
                          onBlur={() => setTimeout(() => setShowBankDropdown(false), 250)}
                          required
                          autoComplete="off"
                        />
                        <div style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                          color: '#94a3b8',
                          fontSize: '10px'
                        }}>
                          ▼
                        </div>
                        {showBankDropdown && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            maxHeight: '160px',
                            overflowY: 'auto',
                            zIndex: 100,
                            marginTop: '4px'
                          }}>
                            {matchingBanks.map((bank, index) => (
                              <div 
                                key={index} 
                                onMouseDown={() => {
                                  setFormData(prev => ({ ...prev, bankName: bank }));
                                }}
                                style={{
                                  padding: '10px 14px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  color: '#1e293b',
                                  borderBottom: index !== matchingBanks.length - 1 ? '1px solid #f1f5f9' : 'none'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                              >
                                {bank}
                              </div>
                            ))}
                            {matchingBanks.length === 0 && (
                              <div style={{
                                padding: '10px 14px',
                                fontSize: '13px',
                                color: '#64748b',
                                fontStyle: 'italic'
                              }}>
                                {searchVal ? `"${searchVal}" will be saved as new` : 'Type to add new...'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="form-actions">
                  <button type="submit" className="btn" style={{ background: '#10b981', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)' }}>
                    {editingId ? 'Update Receipt Details' : (formData.receiptType === 'other' ? 'Record Other Receipt' : 'Record Payment Receipt')}
                  </button>
                  <button type="button" className="btn secondary" onClick={closeModal}>Cancel</button>
                </div>
              </form>
            );
          })()}

          {showModal === 'courses' && (
            <form onSubmit={saveCourse}>
              {/* Course Name Selector / Combobox */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Select or Type Base Course Name *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Select course (e.g. CA FOUNDATION) or type custom..." 
                    value={formData.courseName || ''}
                    onChange={handleCourseNameChange}
                    onFocus={() => setShowCourseDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCourseDropdown(false), 250)}
                    required
                    autoComplete="off"
                  />
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#94a3b8',
                    fontSize: '10px'
                  }}>
                    ▼
                  </div>
                </div>
                {showCourseDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    zIndex: 100,
                    marginTop: '4px'
                  }}>
                    {filteredBaseCourses.map((course, idx) => (
                      <div 
                        key={idx}
                        onMouseDown={() => selectBaseCourse(course)}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#1e293b',
                          borderBottom: idx !== filteredBaseCourses.length - 1 ? '1px solid #f1f5f9' : 'none'
                        }}
                        className="combobox-item"
                      >
                        {course}
                      </div>
                    ))}
                    {filteredBaseCourses.length === 0 && (
                      <div style={{
                        padding: '10px 14px',
                        fontSize: '13px',
                        color: '#64748b',
                        fontStyle: 'italic'
                      }}>
                        "{formData.courseName}" will be added as a custom course
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Session Month and Year Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Batch Session Month *</label>
                  <select 
                    name="month" 
                    value={formData.month || 'May'} 
                    onChange={handleMonthChange} 
                    required
                  >
                    {monthOptions.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Batch Session Year *</label>
                  <select 
                    name="year" 
                    value={formData.year || '2026'} 
                    onChange={handleYearChange} 
                    required
                  >
                    {yearOptions.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn" style={{ background: '#06b6d4', boxShadow: '0 4px 10px rgba(6, 182, 212, 0.15)' }}>
                  Save Batch / Course
                </button>
                <button type="button" className="btn secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          )}

          {showModal === 'refunds' && (() => {
            const selectedCourseId = formData.course || '';
            const studentsInBatch = students.filter(s => (s.course?._id || s.course || '') === selectedCourseId);

            return (
            <form onSubmit={saveRefund}>
              <div className="form-group">
                <label>Select Batch *</label>
                <select
                  name="course"
                  value={formData.course || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    course: e.target.value,
                    student: ''
                  }))}
                  required
                  disabled={!!editingId}
                  style={editingId ? { background: '#f1f5f9', cursor: 'not-allowed' } : {}}
                >
                  <option value="">Select a Batch</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name}{c.classId ? ` (${c.classId})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Student *</label>
                <select
                  name="student"
                  value={formData.student || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!selectedCourseId || !!editingId}
                  style={(!selectedCourseId || editingId) ? { background: '#f1f5f9', cursor: 'not-allowed' } : {}}
                >
                  <option value="">
                    {selectedCourseId
                      ? `Select Student (${studentsInBatch.length} enrolled)`
                      : 'Select batch first'}
                  </option>
                  {studentsInBatch.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name}{s.contact ? ` · ${s.contact}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Refund Amount (INR) *</label>
                  <input
                    name="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Refund Date *</label>
                  <input
                    name="date"
                    type="date"
                    value={formData.date ? formData.date.split('T')[0] : new Date().toISOString().split('T')[0]}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn" style={{ background: '#ea580c', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.15)' }}>
                  {editingId ? 'Update Refund' : 'Save Refund'}
                </button>
                <button type="button" className="btn secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
            );
          })()}

          {showModal === 'expenses' && (
            <form onSubmit={saveExpense}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, expenseType: 'main', customTitle: '' }))}
                  className={`btn ${formData.expenseType === 'main' ? '' : 'secondary'}`}
                  style={{ minWidth: '150px' }}
                >
                  Main Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, expenseType: 'other', category: '' }))}
                  className={`btn ${formData.expenseType === 'other' ? '' : 'secondary'}`}
                  style={{ minWidth: '150px' }}
                >
                  Other Expense
                </button>
              </div>

              {formData.expenseType === 'main' ? (
                <div className="form-group">
                  <label>Main Expense Category *</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {mainExpenseCategories.map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category }))}
                        className={formData.category === category ? 'btn' : 'btn secondary'}
                        style={{ minWidth: '140px', whiteSpace: 'normal' }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="category" value={formData.category || ''} />
                </div>
              ) : (
                <div className="form-group">
                  <label>Other Expense Title *</label>
                  <input
                    name="customTitle"
                    type="text"
                    placeholder="Describe the expense, e.g. printer repair"
                    value={formData.customTitle || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>{formData.expenseType === 'other' ? 'Expense Details' : 'Optional Reference'}</label>
                <input
                  name="notes"
                  type="text"
                  placeholder={formData.expenseType === 'other'
                    ? 'What happened? Why this expense?' 
                    : 'Vendor, bill number, or payment note'}
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Amount (INR) *</label>
                  <input 
                    name="amount" 
                    type="number" 
                    placeholder="Enter amount in ₹"
                    value={formData.amount || ''} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Expense Date *</label>
                  <input 
                    name="date" 
                    type="date" 
                    value={formData.date ? formData.date.split('T')[0] : new Date().toISOString().split('T')[0]} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn" style={{ background: '#f43f5e', boxShadow: '0 4px 10px rgba(244, 63, 94, 0.15)' }}>
                  {editingId ? 'Update Expense Details' : 'Log Office Expense'}
                </button>
                <button type="button" className="btn secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
