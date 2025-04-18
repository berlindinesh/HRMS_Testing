import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { format } from 'date-fns';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tooltip,
  IconButton,
  Typography,
  Stack,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Badge,
  Avatar,
  AvatarGroup,
  Tabs,
  Tab,
  LinearProgress,
  Breadcrumbs,
  Link,
  Autocomplete
} from "@mui/material";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Edit, 
  Delete, 
  Search, 
  FilterList, 
  Add, 
  Archive, 
  Unarchive, 
  Refresh,
  AccessTime,
  Person,
  Group,
  CheckCircle,
  Home,
  Dashboard,
  Assessment,
  MoreVert,
  Close
} from "@mui/icons-material";
import Popover from "@mui/material/Popover";

import "./Objectives.css";

const API_URL = "http://localhost:5000/api/objectives";
const EMPLOYEES_API_URL = "http://localhost:5000/api/employees/registered";

const Objectives = () => {
  const [objectives, setObjectives] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    managers: "",
    assignees: "",
    keyResults: "",
    duration: "",
    archived: "",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentObjective, setCurrentObjective] = useState(null);
  const [showArchivedTable, setShowArchivedTable] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  
  // New state variables for enhanced functionality
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [tabValue, setTabValue] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalObjectives, setTotalObjectives] = useState(0);
  const [objectiveStats, setObjectiveStats] = useState({
    total: 0,
    active: 0,
    archived: 0,
    selfObjectives: 0,
    allObjectives: 0
  });
  const [viewMode, setViewMode] = useState("table"); // table, card, kanban
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // State variables for managers and assignees
  const [managerInput, setManagerInput] = useState("");
  const [assigneeInput, setAssigneeInput] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // State for key results
  const [keyResultInput, setKeyResultInput] = useState({
    title: "",
    description: "",
    targetValue: "",
    unit: "",
    dueDate: null
  });

  // Filter button click handler
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
    setIsFilterModalOpen(true);
  };

  // Filter close handler
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setIsFilterModalOpen(false);
  };

  // Load objectives on component mount and when dependencies change
  useEffect(() => {
    loadObjectives();
    fetchEmployees();
  }, [selectedTab, searchTerm, page, rowsPerPage, sortConfig]);

  // Calculate statistics when objectives change
  useEffect(() => {
    if (objectives.length > 0) {
      const stats = {
        total: objectives.length,
        active: objectives.filter(obj => !obj.archived).length,
        archived: objectives.filter(obj => obj.archived).length,
        selfObjectives: objectives.filter(obj => obj.objectiveType === 'self').length,
        allObjectives: objectives.filter(obj => obj.objectiveType === 'all').length
      };
      setObjectiveStats(stats);
    }
  }, [objectives]);

  // Fetch employees data
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await axios.get(EMPLOYEES_API_URL);
      
      // Transform the data to the format we need
      const formattedEmployees = response.data.map(emp => ({
        id: emp.Emp_ID,
        name: `${emp.personalInfo?.firstName || ''} ${emp.personalInfo?.lastName || ''}`.trim(),
        designation: emp.joiningDetails?.initialDesignation || 'No Designation',
        department: emp.joiningDetails?.department || 'No Department'
      }));
      
      setEmployees(formattedEmployees);
      setLoadingEmployees(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setLoadingEmployees(false);
    }
  };

  // Load objectives from API
  const loadObjectives = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        searchTerm,
        objectiveType: selectedTab !== "all" ? selectedTab : undefined,
        page,
        limit: rowsPerPage,
        sortBy: sortConfig.key,
        sortDirection: sortConfig.direction
      };
      const response = await axios.get(API_URL, { params });
      setObjectives(response.data);
      setTotalObjectives(response.headers['x-total-count'] || response.data.length);
      setLoading(false);
    } catch (error) {
      console.error("Error loading objectives:", error);
      setError("Failed to load objectives. Please try again.");
      setLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter objectives based on criteria
  const filteredObjectives = objectives.filter((obj) => {
    return (
      (selectedTab === "all" ? true : obj.objectiveType === selectedTab) &&
      (searchTerm === "" ||
        obj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filter.managers === "" || 
        (Array.isArray(obj.managers) 
          ? obj.managers.length.toString() === filter.managers
          : obj.managers.toString() === filter.managers)) &&
      (filter.assignees === "" ||
        (Array.isArray(obj.assignees) 
          ? obj.assignees.length.toString() === filter.assignees
          : obj.assignees.toString() === filter.assignees)) &&
      (filter.keyResults === "" ||
        obj.keyResults.toString() === filter.keyResults) &&
      (filter.duration === "" || obj.duration.includes(filter.duration)) &&
      (filter.archived === "" || obj.archived.toString() === filter.archived)
    );
  });

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilter({ ...filter, [field]: value });
  };

  // Apply filter
  const applyFilter = () => {
    setIsFilterModalOpen(false);
    loadObjectives();
  };

  // Reset filter
  const resetFilter = () => {
    setFilter({
      managers: "",
      assignees: "",
      keyResults: "",
      duration: "",
      archived: "",
    });
    setIsFilterModalOpen(false);
    loadObjectives();
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this objective? This action cannot be undone.")) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/${id}`);
        setObjectives(objectives.filter((obj) => obj._id !== id));
        setNotification({
          open: true,
          message: "Objective deleted successfully",
          severity: "success"
        });
        setLoading(false);
      } catch (error) {
        console.error("Error deleting objective:", error);
        setNotification({
          open: true,
          message: "Failed to delete objective",
          severity: "error"
        });
        setLoading(false);
      }
    }
  };

  // Handle archive
  const handleArchive = async (id) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `${API_URL}/${id}/archive`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setObjectives((prevObjectives) =>
        prevObjectives.map((obj) => (obj._id === id ? response.data : obj))
      );
      
      setNotification({
        open: true,
        message: response.data.archived ? "Objective archived successfully" : "Objective unarchived successfully",
        severity: "success"
      });
      setLoading(false);
    } catch (error) {
      console.error("Error toggling archive status:", error);
      setNotification({
        open: true,
        message: "Failed to update archive status",
        severity: "error"
      });
      setLoading(false);
    }
  };

  // Handle add new objective
  const handleAdd = () => {
    const newObjective = {
      title: "",
      managers: [],
      keyResults: 0,
      keyResultsData: [],
      assignees: [],
      duration: "30 Days",
      description: "",
      archived: false,
      objectiveType: "all",
    };
    setCurrentObjective(newObjective);
    setIsCreateModalOpen(true);
  };

  // Handle create submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Format the data according to the schema
      const objectiveData = {
        title: currentObjective.title,
        managers: Array.isArray(currentObjective.managers) ? currentObjective.managers : [],
        keyResults: Number(currentObjective.keyResults) || 0,
        keyResultsData: Array.isArray(currentObjective.keyResultsData) ? currentObjective.keyResultsData : [],
        assignees: Array.isArray(currentObjective.assignees) ? currentObjective.assignees : [],
        duration: currentObjective.duration,
        description: currentObjective.description,
        objectiveType: currentObjective.objectiveType || "all",
        archived: false,
      };

      const response = await axios.post(API_URL, objectiveData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setObjectives([...objectives, response.data]);
      setIsCreateModalOpen(false);
      setCurrentObjective(null);
      setSelectedTab(response.data.objectiveType);
      setNotification({
        open: true,
        message: "Objective created successfully",
        severity: "success"
      });
      setLoading(false);
    } catch (error) {
      console.error("Error creating objective:", error);
      setNotification({
        open: true,
        message: "Failed to create objective",
        severity: "error"
      });
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (objective) => {
    setCurrentObjective({ ...objective });
    setIsEditModalOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/${currentObjective._id}`,
        currentObjective
      );
      setObjectives(
        objectives.map((obj) =>
          obj._id === currentObjective._id ? response.data : obj
        )
      );
      setIsEditModalOpen(false);
      setCurrentObjective(null);
      setNotification({
        open: true,
        message: "Objective updated successfully",
        severity: "success"
      });
      setLoading(false);
    } catch (error) {
      console.error("Error updating objective:", error);
      setNotification({
        open: true,
        message: "Failed to update objective",
        severity: "error"
      });
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentObjective((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedTab(newValue === 0 ? "all" : newValue === 1 ? "self" : "all");
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle view objective details
  const handleViewDetails = (objective) => {
    setSelectedObjective(objective);
    setIsDetailModalOpen(true);
  };

  // Handle refresh data
  const handleRefresh = () => {
    loadObjectives();
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Calculate progress for an objective (mock function)
  const calculateProgress = (objective) => {
    // In a real application, this would be based on completed key results
    return Math.floor(Math.random() * 100);
  };

   // Format date
   const formatDate = (dateString) => {
    return moment(dateString).format('MMM DD, YYYY');
  };

  // Handlers for managers and assignees
  const handleManagerInputChange = (e) => {
    setManagerInput(e.target.value);
  };

  const handleAssigneeInputChange = (e) => {
    setAssigneeInput(e.target.value);
  };

  const handleAddManager = () => {
    if (managerInput.trim() !== "") {
      setCurrentObjective(prev => ({
        ...prev,
        managers: Array.isArray(prev.managers) 
          ? [...prev.managers, managerInput.trim()] 
          : [managerInput.trim()]
      }));
      setManagerInput("");
    }
  };

  const handleAddAssignee = () => {
    if (assigneeInput.trim() !== "") {
      setCurrentObjective(prev => ({
        ...prev,
        assignees: Array.isArray(prev.assignees) 
          ? [...prev.assignees, assigneeInput.trim()] 
          : [assigneeInput.trim()]
      }));
      setAssigneeInput("");
    }
  };

  const handleRemoveManager = (index) => {
    setCurrentObjective(prev => ({
      ...prev,
      managers: prev.managers.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveAssignee = (index) => {
    setCurrentObjective(prev => ({
      ...prev,
      assignees: prev.assignees.filter((_, i) => i !== index)
    }));
  };

  const handleManagerKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddManager();
    }
  };

  const handleAssigneeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAssignee();
    }
  };

  // Key Results handlers
  const handleKeyResultInputChange = (e) => {
    const { name, value } = e.target;
    setKeyResultInput(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKeyResultDateChange = (newDate) => {
    setKeyResultInput(prev => ({
      ...prev,
      dueDate: newDate
    }));
  };

  const handleAddKeyResult = () => {
    if (keyResultInput.title.trim() === "") {
      setNotification({
        open: true,
        message: "Key result title is required",
        severity: "error"
      });
      return;
    }
    
    setCurrentObjective(prev => ({
      ...prev,
      keyResultsData: Array.isArray(prev.keyResultsData) 
        ? [...prev.keyResultsData, keyResultInput] 
        : [keyResultInput],
      keyResults: Array.isArray(prev.keyResultsData) 
        ? prev.keyResultsData.length + 1 
        : 1
    }));
    
    // Reset the input
    setKeyResultInput({
      title: "",
      description: "",
      targetValue: "",
      unit: "",
      dueDate: null
    });
  };

  const handleRemoveKeyResult = (index) => {
    setCurrentObjective(prev => {
      const updatedKeyResults = prev.keyResultsData.filter((_, i) => i !== index);
      return {
        ...prev,
        keyResultsData: updatedKeyResults,
        keyResults: updatedKeyResults.length
      };
    });
  };

  return (
    <div className="objectives">
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          href="#" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="#"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Dashboard sx={{ mr: 0.5 }} fontSize="inherit" />
          Performance
        </Link>
        <Typography 
          color="text.primary"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Assessment sx={{ mr: 0.5 }} fontSize="inherit" />
          Objectives
        </Typography>
      </Breadcrumbs>

      {/* Header and Stats */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "24px 32px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          marginBottom: "24px",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, color: "#1976d2" }}>
          Objectives & Key Results (OKRs)
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: '#e3f2fd',
                border: '1px solid #bbdefb'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {objectiveStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Objectives
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: '#e8f5e9',
                border: '1px solid #c8e6c9'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {objectiveStats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Objectives
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: '#fff8e1',
                border: '1px solid #ffecb3'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {objectiveStats.archived}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Archived Objectives
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: '#f3e5f5',
                border: '1px solid #e1bee7'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {objectiveStats.selfObjectives}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Self Objectives
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: '#e0f7fa',
                border: '1px solid #b2ebf2'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {objectiveStats.allObjectives}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team Objectives
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search and Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            width: "100%",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder="Search objectives..."
              value={searchTerm}
              onChange={handleSearch}
              size="small"
              sx={{
                width: "300px",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  "&:hover fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
              InputProps={{
                startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
              }}
            />
            <Button
              variant="outlined"
              onClick={handleFilterClick}
              startIcon={<FilterList />}
              sx={{
                borderColor: "#1976d2",
                color: "#1976d2",
                "&:hover": {
                  borderColor: "#1565c0",
                  backgroundColor: "#e3f2fd",
                },
                textTransform: "none",
                borderRadius: "8px",
                height: "40px",
              }}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              startIcon={<Refresh />}
              sx={{
                borderColor: "#4caf50",
                color: "#4caf50",
                "&:hover": {
                  borderColor: "#388e3c",
                  backgroundColor: "#e8f5e9",
                },
                textTransform: "none",
                borderRadius: "8px",
                height: "40px",
              }}
            >
              Refresh
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleAdd}
              startIcon={<Add />}
              sx={{
                background: "linear-gradient(45deg, #1976d2, #64b5f6)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(45deg, #1565c0, #42a5f5)",
                },
                textTransform: "none",
                borderRadius: "8px",
                height: "40px",
                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.25)",
              }}
            >
              Create Objective
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976d2',
              height: 3,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minWidth: 120,
              '&.Mui-selected': {
                color: '#1976d2',
              },
            },
          }}
        >
          <Tab 
            label="All Objectives" 
            icon={<Group />} 
            iconPosition="start"
          />
          <Tab 
            label="Self Objectives" 
            icon={<Person />} 
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge 
                badgeContent={objectiveStats.archived} 
                color="error"
                max={99}
                sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}
              >
                Archived
              </Badge>
            } 
            icon={<Archive />} 
            iconPosition="start"
            onClick={() => setShowArchivedTable(!showArchivedTable)}
          />
        </Tabs>
      </Box>

      {/* Loading and Error States */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button 
            size="small" 
            onClick={handleRefresh} 
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Main Content */}
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          overflow: "hidden",
          margin: "24px 0",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f8fafc",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              <th
                style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "#475569",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => handleSort('title')}
              >
                Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "#475569",
                  fontWeight: 600,
                }}
              >
                Managers
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "#475569",
                  fontWeight: 600,
                }}
              >
                Key Results
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "#475569",
                  fontWeight: 600,
                }}
              >
                Assignees
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "#475569",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => handleSort('duration')}
              >
                Duration {sortConfig.key === 'duration' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "#475569",
                  fontWeight: 600,
                }}
                >
                Progress
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "#475569",
                  fontWeight: 600,
                }}
              >
                Type
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "#475569",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => handleSort('createdAt')}
              >
                Created {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "#475569",
                  fontWeight: 600,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredObjectives
              .filter((obj) => tabValue !== 2 ? !obj.archived : obj.archived)
              .map((obj) => {
                const progress = calculateProgress(obj);
                return (
                  <tr
                    key={obj._id}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      "&:hover": {
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    <td 
                      style={{ 
                        padding: "16px",
                        cursor: "pointer",
                        color: "#1976d2",
                        fontWeight: 500
                      }}
                      onClick={() => handleViewDetails(obj)}
                    >
                      {obj.title}
                    </td>
                    <td style={{ padding: "16px" }}>
                      {Array.isArray(obj.managers) ? (
                        <Box>
                          <Chip 
                            label={`${obj.managers.length} Managers`} 
                            size="small" 
                            sx={{ 
                              bgcolor: '#e3f2fd',
                              color: '#0d47a1',
                              fontWeight: 500
                            }} 
                          />
                          <Box sx={{ mt: 1 }}>
                            {obj.managers.slice(0, 2).map((manager, index) => (
                              <Typography key={index} variant="caption" display="block" color="text.secondary">
                                • {manager}
                              </Typography>
                            ))}
                            {obj.managers.length > 2 && (
                              <Typography variant="caption" color="primary">
                                +{obj.managers.length - 2} more
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ) : (
                        <Chip 
                          label={`${obj.managers} Managers`} 
                          size="small" 
                          sx={{ 
                            bgcolor: '#e3f2fd',
                            color: '#0d47a1',
                            fontWeight: 500
                          }} 
                        />
                      )}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <Chip 
                        label={`${obj.keyResults} Key Results`} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#e8f5e9',
                          color: '#1b5e20',
                          fontWeight: 500
                        }} 
                      />
                      {obj.keyResultsData && obj.keyResultsData.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {obj.keyResultsData.slice(0, 2).map((kr, index) => (
                            <Typography key={index} variant="caption" display="block" color="text.secondary">
                              • {kr.title}
                            </Typography>
                          ))}
                          {obj.keyResultsData.length > 2 && (
                            <Typography variant="caption" color="primary">
                              +{obj.keyResultsData.length - 2} more
                            </Typography>
                          )}
                        </Box>
                      )}
                    </td>
                    <td style={{ padding: "16px" }}>
                      {Array.isArray(obj.assignees) ? (
                        <Box>
                          <Chip 
                            label={`${obj.assignees.length} Assignees`} 
                            size="small" 
                            sx={{ 
                              bgcolor: '#fff8e1',
                              color: '#ff6f00',
                              fontWeight: 500
                            }} 
                          />
                          <Box sx={{ mt: 1 }}>
                            {obj.assignees.slice(0, 2).map((assignee, index) => (
                              <Typography key={index} variant="caption" display="block" color="text.secondary">
                                • {assignee}
                              </Typography>
                            ))}
                            {obj.assignees.length > 2 && (
                              <Typography variant="caption" color="primary">
                                +{obj.assignees.length - 2} more
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ) : (
                        <Chip 
                          label={`${obj.assignees} Assignees`} 
                          size="small" 
                          sx={{ 
                            bgcolor: '#fff8e1',
                            color: '#ff6f00',
                            fontWeight: 500
                          }} 
                        />
                      )}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" color="action" />
                        {obj.duration}
                      </Box>
                    </td>
                    <td style={{ padding: "16px", width: '150px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ 
                            width: '100%',
                            height: 8,
                            borderRadius: 5,
                            bgcolor: '#f5f5f5',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: progress < 30 ? '#f44336' : progress < 70 ? '#ff9800' : '#4caf50',
                              borderRadius: 5,
                            }
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {progress}%
                        </Typography>
                      </Box>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <Chip 
                        label={obj.objectiveType === 'self' ? 'Self' : 'Team'} 
                        size="small" 
                        color={obj.objectiveType === 'self' ? 'primary' : 'secondary'}
                        sx={{ fontWeight: 500 }}
                      />
                    </td>
                    <td style={{ padding: "16px" }}>
                      {obj.createdAt ? formatDate(obj.createdAt) : 'N/A'}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Tooltip title="View Details">
                          <IconButton
                            color="info"
                            onClick={() => handleViewDetails(obj)}
                            size="small"
                            sx={{
                              backgroundColor: "info.lighter",
                              "&:hover": { backgroundColor: "info.light" },
                            }}
                          >
                            <Search fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(obj)}
                            size="small"
                            sx={{
                              backgroundColor: "primary.lighter",
                              "&:hover": { backgroundColor: "primary.light" },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={obj.archived ? "Unarchive" : "Archive"}>
                          <IconButton
                            color="warning"
                            onClick={() => handleArchive(obj._id)}
                            size="small"
                            sx={{
                              backgroundColor: "warning.lighter",
                              "&:hover": { backgroundColor: "warning.light" },
                            }}
                          >
                            {obj.archived ? <Unarchive fontSize="small" /> : <Archive fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(obj._id)}
                            size="small"
                            sx={{
                              backgroundColor: "error.lighter",
                              "&:hover": { backgroundColor: "error.light" },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        
        {/* Empty state */}
        {filteredObjectives.filter(obj => tabValue !== 2 ? !obj.archived : obj.archived).length === 0 && !loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No objectives found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {tabValue === 2 
                ? "There are no archived objectives matching your criteria." 
                : "There are no active objectives matching your criteria."}
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<Add />}
              onClick={handleAdd}
            >
              Create New Objective
            </Button>
          </Box>
        )}
        
        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, borderTop: '1px solid #e2e8f0' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2, alignSelf: 'center' }}>
            Showing {Math.min(rowsPerPage, filteredObjectives.length)} of {totalObjectives} objectives
          </Typography>
          <Button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            size="small"
          >
            Previous
          </Button>
          <Typography variant="body2" sx={{ mx: 2, alignSelf: 'center' }}>
            Page {page}
          </Typography>
          <Button 
            disabled={rowsPerPage * page >= totalObjectives}
            onClick={() => setPage(page + 1)}
            size="small"
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <Dialog
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              width: "800px",
              borderRadius: "20px",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(45deg, #1976d2, #64b5f6)",
              color: "white",
              fontSize: "1.5rem",
              fontWeight: 600,
              padding: "24px 32px",
              zIndex: 1,
              position: "relative",
              marginBottom: "0",
              marginTop: "0",
            }}
          >
            Create New Objective
          </DialogTitle>

          <DialogContent
            sx={{
              padding: "32px",
              backgroundColor: "f8fafc",
              marginTop: "20px",
            }}
          >
            <form onSubmit={handleCreateSubmit}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                  mt: 2,
                }}
              >
                <TextField
                  name="title"
                  label="Title"
                  value={currentObjective.title}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      borderRadius: "12px",
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
                  }}
                />

                <TextField
                  name="duration"
                  label="Duration"
                  value={currentObjective.duration}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      borderRadius: "12px",
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
                  }}
                />

                {/* Managers Input */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Managers ({Array.isArray(currentObjective.managers) ? currentObjective.managers.length : 0})
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Autocomplete
                      options={employees}
                      getOptionLabel={(option) => option.name || ""}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} className="employee-option">
                          <Avatar className="employee-option-avatar">
                            {option.name.charAt(0)}
                          </Avatar>
                          <Box className="employee-option-info">
                            <Typography className="employee-option-name">
                              {option.name}
                            </Typography>
                            <Box className="employee-option-details">
                              <Typography className="employee-option-id">
                                {option.id}
                              </Typography>
                              <Typography className="employee-option-designation">
                                {option.designation}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select manager"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                              "&:hover fieldset": {
                                borderColor: "#1976d2",
                              },
                            },
                          }}
                        />
                      )}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          const employeeInfo = `${newValue.name} (${newValue.id}, ${newValue.designation})`;
                          setCurrentObjective(prev => ({
                            ...prev,
                            managers: Array.isArray(prev.managers) 
                              ? [...prev.managers, employeeInfo] 
                              : [employeeInfo]
                          }));
                        }
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        if (managerInput.trim() !== "") {
                          handleAddManager();
                        }
                      }}
                      sx={{ 
                        minWidth: '80px',
                        background: "linear-gradient(45deg, #1976d2, #64b5f6)",
                        borderRadius: "8px"
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  
                  {/* Display added managers */}
                  {Array.isArray(currentObjective.managers) && currentObjective.managers.length > 0 && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1, 
                        p: 2, 
                        bgcolor: '#f0f7ff', 
                        borderRadius: 2,
                        maxHeight: '150px',
                        overflowY: 'auto'
                      }}
                    >
                      {currentObjective.managers.map((manager, index) => (
                        <Chip
                          key={index}
                          label={manager}
                          onDelete={() => handleRemoveManager(index)}
                          sx={{ 
                            bgcolor: '#e3f2fd',
                            '&:hover': { bgcolor: '#bbdefb' }
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Key Results Section */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Key Results ({currentObjective.keyResults || 0})
                  </Typography>
                  
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          name="title"
                          label="Key Result Title"
                          value={keyResultInput.title}
                          onChange={handleKeyResultInputChange}
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          name="description"
                          label="Description"
                          value={keyResultInput.description}
                          onChange={handleKeyResultInputChange}
                          multiline
                          rows={2}
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          name="targetValue"
                          label="Target Value"
                          value={keyResultInput.targetValue}
                          onChange={handleKeyResultInputChange}
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          name="unit"
                          label="Unit"
                          value={keyResultInput.unit}
                          onChange={handleKeyResultInputChange}
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Due Date"
                            value={keyResultInput.dueDate}
                            onChange={handleKeyResultDateChange}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                fullWidth
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                  },
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          onClick={handleAddKeyResult}
                          startIcon={<Add />}
                          sx={{
                            background: "linear-gradient(45deg, #2e7d32, #66bb6a)",
                            color: "white",
                            borderRadius: "8px",
                            textTransform: "none",
                          }}
                        >
                          Add Key Result
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {/* Display added key results */}
                  {Array.isArray(currentObjective.keyResultsData) && currentObjective.keyResultsData.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Added Key Results:
                      </Typography>
                      
                      {currentObjective.keyResultsData.map((kr, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            bgcolor: '#e8f5e9', 
                            borderRadius: 2,
                            border: '1px solid #c8e6c9',
                            position: 'relative'
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveKeyResult(index)}
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8,
                              bgcolor: '#ffebee',
                              '&:hover': { bgcolor: '#ffcdd2' }
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                          
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, pr: 4 }}>
                            {kr.title}
                          </Typography>
                          
                          {kr.description && (
                            <Typography variant="body2" sx={{ mb: 2, color: '#546e7a' }}>
                              {kr.description}
                            </Typography>
                          )}
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {kr.targetValue && kr.unit && (
                              <Chip 
                                size="small" 
                                label={`Target: ${kr.targetValue} ${kr.unit}`}
                                sx={{ bgcolor: '#c8e6c9', color: '#2e7d32' }}
                              />
                            )}
                            
                            {kr.dueDate && (
                              <Chip 
                                size="small" 
                                label={`Due: ${format(new Date(kr.dueDate), 'MMM dd, yyyy')}`}
                                sx={{ bgcolor: '#bbdefb', color: '#1565c0' }}
                              />
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Assignees Input */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Assignees ({Array.isArray(currentObjective.assignees) ? currentObjective.assignees.length : 0})
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Autocomplete
                      options={employees}
                      getOptionLabel={(option) => option.name || ""}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} className="employee-option">
                          <Avatar className="employee-option-avatar">
                            {option.name.charAt(0)}
                          </Avatar>
                          <Box className="employee-option-info">
                            <Typography className="employee-option-name">
                              {option.name}
                            </Typography>
                            <Box className="employee-option-details">
                              <Typography className="employee-option-id">
                                {option.id}
                              </Typography>
                              <Typography className="employee-option-designation">
                                {option.designation}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select assignee"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                              "&:hover fieldset": {
                                borderColor: "#1976d2",
                              },
                            },
                          }}
                        />
                      )}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          const employeeInfo = `${newValue.name} (${newValue.id}, ${newValue.designation})`;
                          setCurrentObjective(prev => ({
                            ...prev,
                            assignees: Array.isArray(prev.assignees) 
                              ? [...prev.assignees, employeeInfo] 
                              : [employeeInfo]
                          }));
                        }
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        if (assigneeInput.trim() !== "") {
                          handleAddAssignee();
                        }
                      }}
                      sx={{ 
                        minWidth: '80px',
                        background: "linear-gradient(45deg, #ff9800, #ffb74d)",
                        borderRadius: "8px"
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  
                  {/* Display added assignees */}
                  {Array.isArray(currentObjective.assignees) && currentObjective.assignees.length > 0 && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1, 
                        p: 2, 
                        bgcolor: '#fff8e1', 
                        borderRadius: 2,
                        maxHeight: '150px',
                        overflowY: 'auto'
                      }}
                    >
                      {currentObjective.assignees.map((assignee, index) => (
                        <Chip
                          key={index}
                          label={assignee}
                          onDelete={() => handleRemoveAssignee(index)}
                          sx={{ 
                            bgcolor: '#ffecb3',
                            '&:hover': { bgcolor: '#ffe082' }
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Objective Type</InputLabel>
                  <Select
                    name="objectiveType"
                    value={currentObjective.objectiveType}
                    onChange={handleInputChange}
                    required
                    sx={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    }}
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    <MenuItem value="self">Self Objective</MenuItem>
                    <MenuItem value="all">Team Objective</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  name="description"
                  label="Description"
                  value={currentObjective.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      borderRadius: "12px",
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  mt: 4,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  onClick={() => setIsCreateModalOpen(false)}
                  sx={{
                    border: "2px solid #1976d2",
                    color: "#1976d2",
                    "&:hover": {
                      border: "2px solid #64b5f6",
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                    },
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 3,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  sx={{
                    background: "linear-gradient(45deg, #1976d2, #64b5f6)",
                    color: "white",
                    "&:hover": {
                      background: "linear-gradient(45deg, #1565c0, #42a5f5)",
                    },
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 4,
                    py: 1,
                    fontWeight: 600,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Create"}
                </Button>
              </Box>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              width: "800px",
              borderRadius: "20px",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(45deg, #1976d2, #64b5f6)",
              color: "white",
              fontSize: "1.5rem",
              fontWeight: 600,
              padding: "24px 32px",
              zIndex: 1,
              position: "relative",
              marginBottom: "0",
              marginTop: "0",
            }}
          >
            Edit Objective
          </DialogTitle>

          <DialogContent
            sx={{
              padding: "32px",
              backgroundColor: "#f8fafc",
              marginTop: "20px",
            }}
            >
            <form onSubmit={handleEditSubmit}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                  mt: 2,
                }}
              >
                <TextField
                  name="title"
                  label="Title"
                  value={currentObjective.title}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      borderRadius: "12px",
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
                  }}
                />

                <TextField
                  name="duration"
                  label="Duration"
                  value={currentObjective.duration}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      borderRadius: "12px",
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
                  }}
                />

                {/* Managers Input */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Managers ({Array.isArray(currentObjective.managers) ? currentObjective.managers.length : 0})
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Autocomplete
                      options={employees}
                      getOptionLabel={(option) => option.name || ""}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} className="employee-option">
                          <Avatar className="employee-option-avatar">
                            {option.name.charAt(0)}
                          </Avatar>
                          <Box className="employee-option-info">
                            <Typography className="employee-option-name">
                              {option.name}
                            </Typography>
                            <Box className="employee-option-details">
                              <Typography className="employee-option-id">
                                {option.id}
                              </Typography>
                              <Typography className="employee-option-designation">
                                {option.designation}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select manager"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                              "&:hover fieldset": {
                                borderColor: "#1976d2",
                              },
                            },
                          }}
                        />
                      )}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          const employeeInfo = `${newValue.name} (${newValue.id}, ${newValue.designation})`;
                          setCurrentObjective(prev => ({
                            ...prev,
                            managers: Array.isArray(prev.managers) 
                              ? [...prev.managers, employeeInfo] 
                              : [employeeInfo]
                          }));
                        }
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        if (managerInput.trim() !== "") {
                          handleAddManager();
                        }
                      }}
                      sx={{ 
                        minWidth: '80px',
                        background: "linear-gradient(45deg, #1976d2, #64b5f6)",
                        borderRadius: "8px"
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  
                  {/* Display added managers */}
                  {Array.isArray(currentObjective.managers) && currentObjective.managers.length > 0 && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1, 
                        p: 2, 
                        bgcolor: '#f0f7ff', 
                        borderRadius: 2,
                        maxHeight: '150px',
                        overflowY: 'auto'
                      }}
                    >
                      {currentObjective.managers.map((manager, index) => (
                        <Chip
                          key={index}
                          label={manager}
                          onDelete={() => handleRemoveManager(index)}
                          sx={{ 
                            bgcolor: '#e3f2fd',
                            '&:hover': { bgcolor: '#bbdefb' }
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Key Results Section */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Key Results ({currentObjective.keyResults || 0})
                  </Typography>
                  
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          name="title"
                          label="Key Result Title"
                          value={keyResultInput.title}
                          onChange={handleKeyResultInputChange}
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          name="description"
                          label="Description"
                          value={keyResultInput.description}
                          onChange={handleKeyResultInputChange}
                          multiline
                          rows={2}
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          name="targetValue"
                          label="Target Value"
                          value={keyResultInput.targetValue}
                          onChange={handleKeyResultInputChange}
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          name="unit"
                          label="Unit"
                          value={keyResultInput.unit}
                          onChange={handleKeyResultInputChange}
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Due Date"
                            value={keyResultInput.dueDate}
                            onChange={handleKeyResultDateChange}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                fullWidth
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                  },
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          onClick={handleAddKeyResult}
                          startIcon={<Add />}
                          sx={{
                            background: "linear-gradient(45deg, #2e7d32, #66bb6a)",
                            color: "white",
                            borderRadius: "8px",
                            textTransform: "none",
                          }}
                        >
                          Add Key Result
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {/* Display added key results */}
                  {Array.isArray(currentObjective.keyResultsData) && currentObjective.keyResultsData.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Added Key Results:
                      </Typography>
                      
                      {currentObjective.keyResultsData.map((kr, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            bgcolor: '#e8f5e9', 
                            borderRadius: 2,
                            border: '1px solid #c8e6c9',
                            position: 'relative'
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveKeyResult(index)}
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8,
                              bgcolor: '#ffebee',
                              '&:hover': { bgcolor: '#ffcdd2' }
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                          
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, pr: 4 }}>
                            {kr.title}
                          </Typography>
                          
                          {kr.description && (
                            <Typography variant="body2" sx={{ mb: 2, color: '#546e7a' }}>
                              {kr.description}
                            </Typography>
                          )}
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {kr.targetValue && kr.unit && (
                              <Chip 
                                size="small" 
                                label={`Target: ${kr.targetValue} ${kr.unit}`}
                                sx={{ bgcolor: '#c8e6c9', color: '#2e7d32' }}
                              />
                            )}
                            
                            {kr.dueDate && (
                              <Chip 
                                size="small" 
                                label={`Due: ${format(new Date(kr.dueDate), 'MMM dd, yyyy')}`}
                                sx={{ bgcolor: '#bbdefb', color: '#1565c0' }}
                              />
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Assignees Input */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Assignees ({Array.isArray(currentObjective.assignees) ? currentObjective.assignees.length : 0})
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Autocomplete
                      options={employees}
                      getOptionLabel={(option) => option.name || ""}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} className="employee-option">
                          <Avatar className="employee-option-avatar">
                            {option.name.charAt(0)}
                          </Avatar>
                          <Box className="employee-option-info">
                            <Typography className="employee-option-name">
                              {option.name}
                            </Typography>
                            <Box className="employee-option-details">
                              <Typography className="employee-option-id">
                                {option.id}
                              </Typography>
                              <Typography className="employee-option-designation">
                                {option.designation}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select assignee"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              borderRadius: "8px",
                              "&:hover fieldset": {
                                borderColor: "#1976d2",
                              },
                            },
                          }}
                        />
                      )}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          const employeeInfo = `${newValue.name} (${newValue.id}, ${newValue.designation})`;
                          setCurrentObjective(prev => ({
                            ...prev,
                            assignees: Array.isArray(prev.assignees) 
                              ? [...prev.assignees, employeeInfo] 
                              : [employeeInfo]
                          }));
                        }
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        if (assigneeInput.trim() !== "") {
                          handleAddAssignee();
                        }
                      }}
                      sx={{ 
                        minWidth: '80px',
                        background: "linear-gradient(45deg, #ff9800, #ffb74d)",
                        borderRadius: "8px"
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  
                  {/* Display added assignees */}
                  {Array.isArray(currentObjective.assignees) && currentObjective.assignees.length > 0 && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1, 
                        p: 2, 
                        bgcolor: '#fff8e1', 
                        borderRadius: 2,
                        maxHeight: '150px',
                        overflowY: 'auto'
                      }}
                    >
                      {currentObjective.assignees.map((assignee, index) => (
                        <Chip
                          key={index}
                          label={assignee}
                          onDelete={() => handleRemoveAssignee(index)}
                          sx={{ 
                            bgcolor: '#ffecb3',
                            '&:hover': { bgcolor: '#ffe082' }
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Objective Type</InputLabel>
                  <Select
                    name="objectiveType"
                    value={currentObjective.objectiveType}
                    onChange={handleInputChange}
                    required
                    sx={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    }}
                    >
                    <MenuItem value="self">Self Objective</MenuItem>
                    <MenuItem value="all">Team Objective</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  name="description"
                  label="Description"
                  value={currentObjective.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      borderRadius: "12px",
                      "&:hover fieldset": {
                        borderColor: "#1976d2",
                      },
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  mt: 4,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  onClick={() => setIsEditModalOpen(false)}
                  sx={{
                    border: "2px solid #1976d2",
                    color: "#1976d2",
                    "&:hover": {
                      border: "2px solid #64b5f6",
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                    },
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 3,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  sx={{
                    background: "linear-gradient(45deg, #1976d2, #64b5f6)",
                    color: "white",
                    "&:hover": {
                      background: "linear-gradient(45deg, #1565c0, #42a5f5)",
                    },
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 4,
                    py: 1,
                    fontWeight: 600,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                </Button>
              </Box>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Objective Details Modal */}
      {isDetailModalOpen && selectedObjective && (
        <Dialog
          open={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "20px",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(45deg, #1976d2, #64b5f6)",
              color: "white",
              fontSize: "1.5rem",
              fontWeight: 600,
              padding: "24px 32px",
            }}
          >
            Objective Details
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, bgcolor: '#f8fafc' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
                {selectedObjective.title}
              </Typography>

              <Chip 
                label={selectedObjective.objectiveType === 'self' ? 'Self Objective' : 'Team Objective'} 
                color={selectedObjective.objectiveType === 'self' ? 'primary' : 'secondary'}
                sx={{ mb: 2 }}
              />

              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                {selectedObjective.description}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" color="action" />
                      {selectedObjective.duration}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateProgress(selectedObjective)} 
                        sx={{ 
                          width: '100%',
                          height: 10,
                          borderRadius: 5,
                          bgcolor: '#e0e0e0',
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {calculateProgress(selectedObjective)}%
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Managers
                    </Typography>
                    {Array.isArray(selectedObjective.managers) ? (
                      <Box sx={{ mt: 1 }}>
                        {selectedObjective.managers.length > 0 ? (
                          selectedObjective.managers.map((manager, index) => (
                            <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person fontSize="small" color="primary" />
                              {manager}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">No managers assigned</Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#0d47a1' }}>
                        {selectedObjective.managers}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Key Results
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1b5e20' }}>
                      {selectedObjective.keyResults}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff8e1', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Assignees
                    </Typography>
                    {Array.isArray(selectedObjective.assignees) ? (
                      <Box sx={{ mt: 1 }}>
                        {selectedObjective.assignees.length > 0 ? (
                          selectedObjective.assignees.map((assignee, index) => (
                            <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person fontSize="small" color="warning" />
                              {assignee}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">No assignees assigned</Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff6f00' }}>
                        {selectedObjective.assignees}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Timeline
                </Typography>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedObjective.createdAt ? formatDate(selectedObjective.createdAt) : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedObjective.updatedAt ? formatDate(selectedObjective.updatedAt) : 'N/A'}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
            
            <Divider />
            
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEdit(selectedObjective);
                }}
                startIcon={<Edit />}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => {
                  handleArchive(selectedObjective._id);
                  setIsDetailModalOpen(false);
                }}
                startIcon={selectedObjective.archived ? <Unarchive /> : <Archive />}
              >
                {selectedObjective.archived ? 'Unarchive' : 'Archive'}
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* Filter Popover */}
      {isFilterModalOpen && (
        <Popover
          open={Boolean(filterAnchorEl)}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              width: "400px",
              borderRadius: "16px",
              mt: 1,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              position: "relative",
              zIndex: 1300,
            },
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(45deg, #1976d2, #64b5f6)",
              color: "white",
              p: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filter Objectives
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Select
                value={filter.managers}
                onChange={(e) => handleFilterChange("managers", e.target.value)}
                fullWidth
                displayEmpty
                sx={{
                  height: "56px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e0e7ff",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                }}
                renderValue={(selected) => selected || "Select Managers"}
              >
                <MenuItem value="">All Managers</MenuItem>
                <MenuItem value="1">1 Manager</MenuItem>
                <MenuItem value="2">2 Managers</MenuItem>
                <MenuItem value="3">3 Managers</MenuItem>
                <MenuItem value="4">4+ Managers</MenuItem>
              </Select>

              <Select
                value={filter.assignees}
                onChange={(e) =>
                  handleFilterChange("assignees", e.target.value)
                }
                fullWidth
                displayEmpty
                sx={{
                  height: "56px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e0e7ff",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                }}
                renderValue={(selected) => selected || "Select Assignees"}
              >
                <MenuItem value="">All Assignees</MenuItem>
                <MenuItem value="1">1 Assignee</MenuItem>
                <MenuItem value="2">2 Assignees</MenuItem>
                <MenuItem value="3">3 Assignees</MenuItem>
                <MenuItem value="4">4+ Assignees</MenuItem>
              </Select>

              <Select
                value={filter.keyResults}
                onChange={(e) =>
                  handleFilterChange("keyResults", e.target.value)
                }
                fullWidth
                displayEmpty
                sx={{
                  height: "56px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e0e7ff",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                }}
                renderValue={(selected) => selected || "Select Key Results"}
              >
                <MenuItem value="">All Results</MenuItem>
                <MenuItem value="1">1 Result</MenuItem>
                <MenuItem value="2">2 Results</MenuItem>
                <MenuItem value="3">3 Results</MenuItem>
                <MenuItem value="4">4+ Results</MenuItem>
              </Select>

              <Select
                value={filter.archived}
                onChange={(e) => handleFilterChange("archived", e.target.value)}
                fullWidth
                displayEmpty
                sx={{
                  height: "56px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e0e7ff",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                }}
                renderValue={(selected) => selected || "Archive Status"}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="true">Archived</MenuItem>
                  <MenuItem value="false">Not Archived</MenuItem>
                </Select>
              </Stack>
  
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button
                  fullWidth
                  onClick={resetFilter}
                  sx={{
                    border: "2px solid #1976d2",
                    color: "#1976d2",
                    "&:hover": {
                      border: "2px solid #64b5f6",
                      backgroundColor: "#e3f2fd",
                    },
                    borderRadius: "8px",
                    py: 1,
                    fontWeight: 600,
                  }}
                >
                  Clear All
                </Button>
  
                <Button
                  fullWidth
                  onClick={applyFilter}
                  sx={{
                    background: "linear-gradient(45deg, #1976d2, #64b5f6)",
                    color: "white",
                    "&:hover": {
                      background: "linear-gradient(45deg, #1565c0, #42a5f5)",
                    },
                    borderRadius: "8px",
                    py: 1,
                    fontWeight: 600,
                  }}
                >
                  Apply Filters
                </Button>
              </Stack>
            </Box>
          </Popover>
        )}
  
        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={5000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleNotificationClose} 
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </div>
    );
  };
  
  export default Objectives;
  
 









      


 

