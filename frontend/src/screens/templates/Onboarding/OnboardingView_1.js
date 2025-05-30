import React, { useState, useEffect } from "react";
import axios from "axios";
import "./OnboardingView.css";

import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
} from "@mui/material";
import { Search, Add, Email, Delete } from "@mui/icons-material";

// Add these styled components after the imports
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .1)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(2),
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

function OnboardingView() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    jobPosition: "",
    mobile: "",
    joiningDate: "",
    stage: "Test",
    portalStatus: "Active",
    taskStatus: "Pending",
  });

  // Add these validation functions at the top of your component
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePosition = (position) => {
    const positionRegex = /^[a-zA-Z\s]+$/;
    return positionRegex.test(position);
  };

  // Add state for validation errors
  const [validationErrors, setValidationErrors] = useState({
    phone: "",
    email: "",
    position: "",
  });

  const uniqueStages = ["All", "Test", "Interview", "Offer"];

  useEffect(() => {
    fetchCandidates();
  }, [stageFilter]);

  const fetchCandidates = async () => {
    try {
      const url =
        stageFilter === "All"
          ? "http://localhost:5000/api/onboarding"
          : `http://localhost:5000/api/onboarding/filter?stage=${stageFilter}`;
      const response = await axios.get(url);
      setCandidates(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  // Update the handleInputChange function
  const handleInputChange = (e, field) => {
    const value = e.target.value;

    switch (field) {
      case "mobile":
        if (value === "" || /^\d+$/.test(value)) {
          setNewCandidate({ ...newCandidate, mobile: value });
          setValidationErrors({
            ...validationErrors,
            phone: validatePhone(value)
              ? ""
              : "Please enter a valid 10-digit phone number",
          });
        }
        break;

      case "email":
        setNewCandidate({ ...newCandidate, email: value });
        setValidationErrors({
          ...validationErrors,
          email: validateEmail(value)
            ? ""
            : "Please enter a valid email address",
        });
        break;

      case "jobPosition":
        if (value === "" || /^[a-zA-Z\s]+$/.test(value)) {
          setNewCandidate({ ...newCandidate, jobPosition: value });
          setValidationErrors({
            ...validationErrors,
            position: validatePosition(value)
              ? ""
              : "Position should contain only letters",
          });
        }
        break;

      default:
        setNewCandidate({ ...newCandidate, [field]: value });
    }
  };

  // Update the form submission handler
  const handleCreateCandidate = async (e) => {
    e.preventDefault();

    const errors = {
      phone: validatePhone(newCandidate.mobile) ? "" : "Invalid phone number",
      email: validateEmail(newCandidate.email) ? "" : "Invalid email",
      position: validatePosition(newCandidate.jobPosition)
        ? ""
        : "Invalid position",
    };

    setValidationErrors(errors);

    if (Object.values(errors).some((error) => error !== "")) {
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/onboarding",
        newCandidate
      );
      setCandidates([...candidates, response.data]);
      setNewCandidate({
        name: "",
        email: "",
        jobPosition: "",
        mobile: "",
        joiningDate: "",
        stage: "Test",
        portalStatus: "Active",
        taskStatus: "Pending",
      });
      setValidationErrors({
        phone: "",
        email: "",
        position: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating candidate:", error);
    }
  };

  const handleDeleteCandidate = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/onboarding/${id}`);
      setCandidates(candidates.filter((candidate) => candidate._id !== id));
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
  };

  const sendMailToCandidate = async (candidate) => {
    try {
      await axios.post("http://localhost:5000/api/onboarding/send-email", {
        email: candidate.email,
        name: candidate.name,
        jobPosition: candidate.jobPosition,
        joiningDate: candidate.joiningDate,
      });
      alert("Onboarding email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    }
  };

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="onboarding-container">
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: { xs: 2, sm: 4 },
            color: theme.palette.primary.main,
            fontWeight: 600,
            letterSpacing: 0.5,
            fontSize: { xs: "1.5rem", sm: "2rem" },
          }}
        >
          Onboarding Dashboard
        </Typography>

        <StyledPaper>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={2}
            sx={{
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <SearchTextField
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                width: { xs: "100%", sm: "300px" },
                marginRight: { xs: 0, sm: "auto" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                display: "flex",
                gap: 1,
                width: { xs: "100%", sm: "auto" },
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                select
                size="small"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                sx={{
                  width: { xs: "100%", sm: 120 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              >
                {uniqueStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </TextField>

              <Button
                variant="contained"
                // startIcon={<Add />}
                onClick={() => setShowCreateForm(true)}
                sx={{
                  height: { xs: "auto", sm: 40 },
                  padding: { xs: "10px 0", sm: "auto" },
                  width: { xs: "100%", sm: "auto" },
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                  color: "white",
                  "&:hover": {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                  },
                }}
              >
                Add New Candidate
              </Button>
            </Box>
          </Box>
        </StyledPaper>

        {/* Material UI Dialog for Add New Candidate */}
        <Dialog
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          fullScreen={isMobile}
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 3,
              width: isMobile ? "100%" : "650px",
              margin: isMobile ? 0 : 2,
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #1976d2, #2196f3)",
              color: "white",
              fontSize: { xs: "1.25rem", sm: "1.75rem" },
              fontWeight: 600,
              padding: { xs: "16px 20px", sm: "24px 32px" },
              m: 0,
            }}
          >
            Add New Candidate
          </DialogTitle>

          <DialogContent
            sx={{
              backgroundColor: "#f8fafc",
              padding: { xs: "16px", sm: "24px 32px" },
              paddingTop: { xs: "20px", sm: "28px" },
            }}
          >
            <Grid container spacing={isMobile ? 2 : 3}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  value={newCandidate.name}
                  onChange={(e) => handleInputChange(e, "name")}
                  required
                  fullWidth
                  placeholder="Enter candidate's full name"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  value={newCandidate.email}
                  onChange={(e) => handleInputChange(e, "email")}
                  required
                  fullWidth
                  placeholder="email@example.com"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile Number"
                  value={newCandidate.mobile}
                  onChange={(e) => handleInputChange(e, "mobile")}
                  required
                  fullWidth
                  placeholder="Enter 10-digit number"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  error={!!validationErrors.phone}
                  helperText={validationErrors.phone}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Job Position"
                  value={newCandidate.jobPosition}
                  onChange={(e) => handleInputChange(e, "jobPosition")}
                  required
                  fullWidth
                  placeholder="Enter job position"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  error={!!validationErrors.position}
                  helperText={validationErrors.position}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Joining Date"
                  type="date"
                  value={newCandidate.joiningDate}
                  onChange={(e) => handleInputChange(e, "joiningDate")}
                  required
                  fullWidth
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                    },
                  }}
                >
                  <InputLabel id="stage-label" shrink>
                    Stage
                  </InputLabel>
                  <Select
                    labelId="stage-label"
                    id="stage"
                    value={newCandidate.stage}
                    onChange={(e) => handleInputChange(e, "stage")}
                    label="Stage"
                    notched
                    displayEmpty
                  >
                    <MenuItem value="Test">Test</MenuItem>
                    <MenuItem value="Interview">Interview</MenuItem>
                    <MenuItem value="Offer">Offer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              backgroundColor: "#f8fafc",
              padding: { xs: "16px", sm: "24px 32px" },
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 2 },
            }}
          >
            <Button
              onClick={() => setShowCreateForm(false)}
              fullWidth={isMobile}
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderWidth: 2,
                borderColor: "#1976d2",
                color: "#1976d2",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "#1565c0",
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleCreateCandidate(e);
              }}
              fullWidth={isMobile}
              variant="contained"
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #1976d2, #2196f3)",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, #1565c0, #1976d2)",
                },
              }}
            >
              Create Candidate
            </Button>
          </DialogActions>
        </Dialog>

        {/* Table  */}

        <div
          className="candidates-table-container"
          style={{
            overflowX: "auto",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            marginTop: "24px",
          }}
        >
          <table
            className="candidates-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: isMobile ? "800px" : "auto", // Force horizontal scroll on mobile
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
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Job Position
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Mobile
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Joining Date
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Stage
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Portal Status
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Task Status
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#64748b",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    No candidates found. Add your first candidate!
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate, index) => (
                  <tr
                    key={candidate._id}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      transition: "background-color 0.2s",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                      },
                    }}
                  >
                    <td style={{ padding: "14px 16px", color: "#334155" }}>
                      {candidate.name}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#334155" }}>
                      {candidate.email}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#334155" }}>
                      {candidate.jobPosition}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#334155" }}>
                      {candidate.mobile}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#334155" }}>
                      {new Date(candidate.joiningDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor:
                            candidate.stage === "Test"
                              ? "#e3f2fd"
                              : candidate.stage === "Interview"
                              ? "#e8f5e9"
                              : "#fff8e1",
                          color:
                            candidate.stage === "Test"
                              ? "#1976d2"
                              : candidate.stage === "Interview"
                              ? "#2e7d32"
                              : "#f57c00",
                        }}
                      >
                        {candidate.stage}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor:
                            candidate.portalStatus === "Active"
                              ? "#e8f5e9"
                              : "#ffebee",
                          color:
                            candidate.portalStatus === "Active"
                              ? "#2e7d32"
                              : "#c62828",
                        }}
                      >
                        {candidate.portalStatus}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor:
                            candidate.taskStatus === "Completed"
                              ? "#e8f5e9"
                              : candidate.taskStatus === "Pending"
                              ? "#fff8e1"
                              : "#f5f5f5",
                          color:
                            candidate.taskStatus === "Completed"
                              ? "#2e7d32"
                              : candidate.taskStatus === "Pending"
                              ? "#f57c00"
                              : "#616161",
                        }}
                      >
                        {candidate.taskStatus}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() => sendMailToCandidate(candidate)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            // backgroundColor: '#e3f2fd',
                            color: "#1976d2",
                            border: "none",
                            borderRadius: "50%",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                            padding: 0,
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#bbdefb";
                            e.currentTarget.style.transform = "scale(1.1)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.12)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#e3f2fd";
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 5px rgba(0,0,0,0.08)";
                          }}
                        >
                          <Email fontSize="small" />
                        </button>
                        <button
                          onClick={() => handleDeleteCandidate(candidate._id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            //backgroundColor: 'transparent',
                            color: "#c62828",
                            border: "none",
                            borderRadius: "50%",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                            padding: 0,
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#ffcdd2";
                            e.currentTarget.style.transform = "scale(1.1)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.12)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#ffebee";
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 5px rgba(0,0,0,0.08)";
                          }}
                        >
                          <Delete fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Box>
    </div>
  );
}

export default OnboardingView;
