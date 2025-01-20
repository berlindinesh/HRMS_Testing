import React, { useState, useEffect } from 'react';
import {

  Box,

  Button,

  IconButton,

  Table,

  TableBody,

  TableCell,

  TableContainer,

  TableHead,

  TableRow,

  Tabs,
  Menu,
  Tab,

  Checkbox,

  Typography,
  Paper,

  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  Switch,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Select,
  MenuItem,
  Badge as CommentIcon,
  InputAdornment

} from '@mui/material';

import { FilterList, Search, GroupWork, Add, Edit, FileCopy, Delete } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
  fetchWorkTypeRequests,
  createWorkTypeRequest,
  updateWorkTypeRequest,
  deleteWorkTypeRequest,
  approveWorkTypeRequest,
  rejectWorkTypeRequest
} from '../api/workTypeRequestApi';


// Add this sample data at the top of your component
const employees = Array.from({ length: 20 }, (_, i) => ({
id: i + 1,

  name: `Employee ${i + 1}`,

  employeeCode: `#EMP${i + 1}`,

  requestedShift: i % 2 === 0 ? 'First Shift' : 'Second Shift',

  currentShift: 'Regular Shift',

  requestedDate: 'Nov. 7, 2024',

  requestedTill: 'Nov. 9, 2024',

  status: i % 2 === 0 ? 'Approved' : 'Rejected',

  description: 'Request for shift adjustment',

  comment: 'Needs urgent consideration',

}));



const WorkTypeRequest = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedAllocations, setSelectedAllocations] = useState([]);
  const [groupByOpen, setGroupByOpen] = useState(false);
  const [groupByOption, setGroupByOption] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isPermanentRequest, setIsPermanentRequest] = useState(false);
  const [showSelectionButtons, setShowSelectionButtons] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftRequests, setShiftRequests] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    requestShift: '',
    requestedDate: '',
    requestedTill: '',
    description: ''
  });

  useEffect(() => {
    const loadWorkTypeRequests = async () => {
      try {
        const response = await fetchWorkTypeRequests();
        setShiftRequests(response.data);
        console.log('Fetched data:', response.data);
      } catch (error) {
        console.error('Error loading work type requests:', error);
      }
    };
    loadWorkTypeRequests();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterClick = () => setFilterOpen(true);
  const handleGroupByClick = () => setGroupByOpen(true);

  const handleActionsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSelectAll = () => {
    const allIds = shiftRequests.map(req => req._id);
    setSelectedAllocations(allIds);
    setShowSelectionButtons(true);
  };

  const handleUnselectAll = () => {
    setSelectedAllocations([]);
    setShowSelectionButtons(false);
  };

  const handleApprove = async (id) => {
    try {
      const response = await approveWorkTypeRequest(id);
      setShiftRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === id ? response.data : req
        )
      );
    } catch (error) {
      console.error('Error approving work type request:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await rejectWorkTypeRequest(id);
      setShiftRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === id ? response.data : req
        )
      );
    } catch (error) {
      console.error('Error rejecting work type request:', error);
    }
  };

  const handleCreateShift = async (formData) => {
    try {
      const requestData = {
        employee: formData.employee,
        requestedShift: formData.requestShift,
        currentShift: 'Regular Shift',
        requestedDate: formData.requestedDate,
        requestedTill: formData.requestedTill,
        description: formData.description,
        isPermanentRequest: isPermanentRequest,
        status: 'Pending'
      };

      console.log('Sending data:', requestData);
      const response = await createWorkTypeRequest(requestData);
      console.log('Created:', response.data);

      setShiftRequests(prev => [...prev, response.data]);
      setCreateDialogOpen(false);
      setFormData({
        employee: '',
        requestShift: '',
        requestedDate: '',
        requestedTill: '',
        description: ''
      });
    } catch (error) {
      console.error('Error creating work type request:', error);
    }
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setFormData({
      employee: shift.name,
      requestShift: shift.requestedShift,
      requestedDate: shift.requestedDate,
      requestedTill: shift.requestedTill,
      description: shift.description
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await updateWorkTypeRequest(editingShift._id, formData);
      setShiftRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === editingShift._id ? response.data : req
        )
      );
      setEditDialogOpen(false);
      setEditingShift(null);
    } catch (error) {
      console.error('Error updating work type request:', error);
    }
  };

  const handleCopy = (shift) => {
    const newShift = {
      ...shift,
      id: shiftRequests.length + 1,
      status: 'Pending'
    };

    setShiftRequests([...shiftRequests, newShift]);
  };

  const handleDelete = async (id) => {
    try {
      await deleteWorkTypeRequest(id);
      setShiftRequests(prevRequests =>
        prevRequests.filter(req => req._id !== id)
      );
    } catch (error) {
      console.error('Error deleting work type request:', error);
    }
  };



  const groupByOptions = [
    'Department',
    'Shift Type',
    'Status',
    'Employee',
    'Date',
    'Location'
  ]
  const allocatedShifts = [
    {
      id: 1,
      employee: { name: 'John Smith', code: 'EMP001' },
      allocatedEmployee: 'Sarah Johnson',
      userAvailability: 'Available',
      requestedShift: 'Morning Shift',
      currentShift: 'Night Shift',
      requestedDate: '2024-01-15',
      requestedTill: '2024-01-20',
      description: 'Temporary shift coverage needed',
      hasComments: true
    },
    {
      id: 2,
      employee: { name: 'Michael Brown', code: 'EMP002' },
      allocatedEmployee: 'David Wilson',
      userAvailability: 'Partially Available',
      requestedShift: 'Evening Shift',
      currentShift: 'Morning Shift',
      requestedDate: '2024-01-16',
      requestedTill: '2024-01-22',
      description: 'Emergency coverage request',
      hasComments: true
    },
    {
      id: 3,
      employee: { name: 'Emma Davis', code: 'EMP003' },
      allocatedEmployee: 'James Miller',
      userAvailability: 'Available',
      requestedShift: 'Night Shift',
      currentShift: 'Evening Shift',
      requestedDate: '2024-01-17',
      requestedTill: '2024-01-25',
      description: 'Shift swap request',
      hasComments: false
    },
    {
      id: 4,
      employee: { name: 'Lisa Anderson', code: 'EMP004' },
      allocatedEmployee: 'Robert Taylor',
      userAvailability: 'Not Available',
      requestedShift: 'Morning Shift',
      currentShift: 'Evening Shift',
      requestedDate: '2024-01-18',
      requestedTill: '2024-01-23',
      description: 'Training period coverage',
      hasComments: true
    },
    {
      id: 5,
      employee: { name: 'Kevin White', code: 'EMP005' },
      allocatedEmployee: 'Patricia Moore',
      userAvailability: 'Available',
      requestedShift: 'Evening Shift',
      currentShift: 'Morning Shift',
      requestedDate: '2024-01-19',
      requestedTill: '2024-01-24',
      description: 'Personal emergency coverage',
      hasComments: true
    }
  ]

  return (
    <Box>
      <Box sx={{ padding: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Work Type Requests
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search Employee"
              size="small"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button startIcon={<FilterList />} onClick={handleFilterClick} variant="outlined">Filter</Button>
            <Button startIcon={<GroupWork />} variant="outlined" onClick={handleGroupByClick}>Group By</Button>
            <Button variant="outlined" onClick={handleActionsClick}>Actions</Button>
            <Button startIcon={<Add />} variant="contained" color="error" onClick={() => setCreateDialogOpen(true)}>Create</Button>
          </Box>
        </Box>
        {/* Second row with selection buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            sx={{ color: 'green', borderColor: 'green' }}
            onClick={handleSelectAll}
          >
            Select All Shifts
          </Button>
          {showSelectionButtons && (
            <>
              <Button
                variant="outlined"
                sx={{ color: 'grey.500', borderColor: 'grey.500' }}
                onClick={handleUnselectAll}
              >
                Unselect All
              </Button>
              <Button
                variant="outlined"
                sx={{ color: 'blue', borderColor: 'blue' }}
              >
                Export Shifts
              </Button>
              <Button
                variant="outlined"
                sx={{ color: 'maroon', borderColor: 'maroon' }}
              >
                {selectedAllocations.length} Selected
              </Button>
            </>
          )}
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>Export</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Approve Requests</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Reject Requests</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Delete</MenuItem>
      </Menu>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {/* Approval Status Indicators */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button sx={{ color: 'green' }} onClick={() => setFilterStatus('Approved')}>
            ● Approved
          </Button>
          <Button sx={{ color: 'red' }} onClick={() => setFilterStatus('Rejected')}>
            ● Rejected
          </Button>



          {showSelectionButtons && (

            <>

              <Button

                variant="outlined"

                sx={{ color: 'grey.500', borderColor: 'grey.500' }}

                onClick={handleUnselectAll}

              >

                Unselect All

              </Button>



              <Button

                variant="outlined"

                sx={{ color: 'blue', borderColor: 'blue' }}

              >

                Export Shifts

              </Button>



              <Button

                variant="outlined"

                sx={{ color: 'maroon', borderColor: 'maroon' }}

              >

                {selectedAllocations.length} Selected

              </Button>

            </>

          )}

        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} textColor="primary" indicatorColor="primary">
        <Tab label="Work Type Requests" />
      </Tabs>

      <Divider sx={{ mb: 2 }} />
      {/* Table */}
      {tabValue === 0 ? (
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allIds = shiftRequests.map(req => req._id);
                        setSelectedAllocations(allIds);
                        setShowSelectionButtons(true);
                      } else {
                        setSelectedAllocations([]);
                        setShowSelectionButtons(false);
                      }
                    }}
                    checked={selectedAllocations.length === shiftRequests.length && shiftRequests.length > 0}
                  />
                </TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Requested Work Type</TableCell>
                <TableCell>Previous/Current Work Type</TableCell>
                <TableCell>Requested Date</TableCell>
                <TableCell>Requested Till</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Confirmation</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shiftRequests
                .filter(req => {
                  const employeeName = req?.employee || '';
                  return employeeName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (filterStatus === 'all' || req.status === filterStatus);
                })
                .map((emp) => (
                  <TableRow key={emp._id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedAllocations.includes(emp._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAllocations(prev => [...prev, emp._id]);
                            setShowSelectionButtons(true);
                          } else {
                            setSelectedAllocations(prev => prev.filter(id => id !== emp._id));
                            if (selectedAllocations.length <= 1) {
                              setShowSelectionButtons(false);
                            }
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: emp.id % 2 === 0 ? 'primary.main' : 'secondary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1,
                          }}
                        >
                          {emp.employee?.[0] || 'U'}
                        </Box>
                        {emp.employee || 'Unknown'}
                      </Box>
                    </TableCell>
                    <TableCell>{emp.requestedShift}</TableCell>
                    <TableCell>{emp.currentShift}</TableCell>
                    <TableCell>{emp.requestedDate}</TableCell>
                    <TableCell>{emp.requestedTill}</TableCell>
                    <TableCell sx={{ color: emp.status === 'Approved' ? 'green' : 'red' }}>
                      {emp.status}
                    </TableCell>
                    <TableCell>{emp.description}</TableCell>
                    <TableCell>{emp.comment}</TableCell>
                    <TableCell>
                      <IconButton color="success" onClick={() => handleApprove(emp._id)}>
                        ✔
                      </IconButton>
                      <IconButton color="error" onClick={() => handleReject(emp._id)}>
                        ✖
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(emp)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleCopy(emp)}>
                        <FileCopy fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(emp._id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 3 }}>
                  <Checkbox />
                </TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Allocated Employee</TableCell>
                <TableCell>User Availability</TableCell>
                <TableCell>Requested Shift</TableCell>
                <TableCell>Previous/Current Shift</TableCell>
                <TableCell>Requested Date</TableCell>
                <TableCell>Requested Till</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell sx={{ position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 3 }}>Confirmation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allocatedShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 3 }}>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1,
                        }}
                      >
                        {shift.employee.name[0]}
                      </Box>
                      {shift.employee.name} ({shift.employee.code})
                    </Box>
                  </TableCell>
                  <TableCell>{shift.allocatedEmployee}</TableCell>
                  <TableCell>{shift.userAvailability}</TableCell>
                  <TableCell>{shift.requestedShift}</TableCell>
                  <TableCell>{shift.currentShift}</TableCell>
                  <TableCell>{shift.requestedDate}</TableCell>
                  <TableCell>{shift.requestedTill}</TableCell>
                  <TableCell>{shift.description}</TableCell>
                  <TableCell>
                    {shift.hasComments && <CommentIcon color="primary" />}
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 3 }}>
                    <IconButton color="success">✔</IconButton>
                    <IconButton color="error">✖</IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Work Request</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Employee"
              name="employee"
              fullWidth
              select
              value={formData.employee}
              onChange={handleFormChange}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.name}>
                  {emp.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Request Work Type"
              name="requestShift"
              value={formData.requestShift}
              onChange={handleFormChange}
              fullWidth
              select
            >
              <MenuItem value="Morning Shift">Morning Shift</MenuItem>
              <MenuItem value="Evening Shift">Evening Shift</MenuItem>
              <MenuItem value="Night Shift">Night Shift</MenuItem>
            </TextField>
            <TextField
              label="Requested Date"
              name="requestedDate"
              type="date"
              value={formData.requestedDate}
              onChange={handleFormChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Requested Till"
              name="requestedTill"
              type="date"
              value={formData.requestedTill}
              onChange={handleFormChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={4}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isPermanentRequest}
                  onChange={(e) => setIsPermanentRequest(e.target.checked)}
                />
              }
              label="Permanent Request"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Add save ogic here
              handleCreateShift(formData)
              setCreateDialogOpen(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Filter Options</DialogTitle>
        <DialogContent>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Work Info</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField label="Employee" fullWidth />
                <TextField label="Department" fullWidth />
                <TextField label="Job Position" fullWidth />
                <TextField label="Job Role" fullWidth />
                <TextField label="Shift" fullWidth />
                <TextField label="Work Type" fullWidth />
                <TextField label="Company" fullWidth />
                <TextField label="Reporting Manager" fullWidth />
                <FormControlLabel control={<Checkbox />} label="Is Active" />
                <Select label="Gender" fullWidth>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Shift Request</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField type="date" label="Requested Date" fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Requested Shift" fullWidth />
                <FormControlLabel control={<Checkbox />} label="Approved?" />
                <TextField label="Previous Shift" fullWidth />
                <FormControlLabel control={<Checkbox />} label="Cancelled" />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Advanced</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField type="date" label="Requested Date From" fullWidth InputLabelProps={{ shrink: true }} />
                <TextField type="date" label="Requested Date To" fullWidth InputLabelProps={{ shrink: true }} />
              </Box>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary">Filter</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={groupByOpen} onClose={() => setGroupByOpen(false)}>
        <DialogTitle>Group By</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            value={groupByOption}
            onChange={(e) => setGroupByOption(e.target.value)}
            sx={{ minWidth: 200, mt: 1 }}
          >
            {groupByOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGroupByOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Add your grouping logic here
              setGroupByOpen(false);
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Shift Request</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Employee"
              name="employee"
              fullWidth
              select
              value={formData.employee}
              onChange={handleFormChange}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.name}>
                  {emp.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Request Shift"
              name="requestShift"
              value={formData.requestShift}
              onChange={handleFormChange}
              fullWidth
              select
            >
              <MenuItem value="Morning Shift">Morning Shift</MenuItem>
              <MenuItem value="Evening Shift">Evening Shift</MenuItem>
              <MenuItem value="Night Shift">Night Shift</MenuItem>
            </TextField>
            <TextField
              label="Requested Date"
              name="requestedDate"
              type="date"
              value={formData.requestedDate}
              onChange={handleFormChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Requested Till"
              name="requestedTill"
              type="date"
              value={formData.requestedTill}
              onChange={handleFormChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={4}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isPermanentRequest}
                  onChange={(e) => setIsPermanentRequest(e.target.checked)}
                />
              }
              label="Permanent Request"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>

  );

};
export default WorkTypeRequest;
