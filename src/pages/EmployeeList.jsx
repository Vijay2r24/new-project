import { useState, useEffect, useCallback } from "react";
import { Mail, Phone, Award, Briefcase, DollarSign, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import ActionButtons from "../components/ActionButtons";
import { useTranslation } from "react-i18next";
import { useTitle } from "../context/TitleContext";
import Switch from "../components/Switch";
import userProfile from "../../assets/images/userProfile.svg";
import Loader from "../components/Loader";
import * as XLSX from "xlsx";

const Employees = () => {
  const navigate = useNavigate();
  const [sSearchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const [sViewMode, setViewMode] = useState("table");
  const [nCurrentPage, setCurrentPage] = useState(1);
  const [sShowFilterDropdown, setShowFilterDropdown] = useState(false);
  const itemsPerPage = 10;
  
  // State for export loading
  const [bExporting, setExporting] = useState(false);

  // Dummy employees data with images, employee IDs and rewards
  const dummyEmployees = [
    {
      EmployeeID: "EMP001",
      FirstName: "John",
      LastName: "Doe",
      Email: "john.doe@company.com",
      PhoneNumber: "+1 (555) 123-4567",
      Department: "Sales",
      Position: "Sales Manager",
      IsActive: true,
      JoiningDate: "2023-01-15",
      Rewards: 1250,
      ProfileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP002",
      FirstName: "Sarah",
      LastName: "Johnson",
      Email: "sarah.j@company.com",
      PhoneNumber: "+1 (555) 234-5678",
      Department: "Marketing",
      Position: "Marketing Director",
      IsActive: true,
      JoiningDate: "2022-08-22",
      Rewards: 2100,
      ProfileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP003",
      FirstName: "Michael",
      LastName: "Chen",
      Email: "michael.chen@company.com",
      PhoneNumber: "+1 (555) 345-6789",
      Department: "Engineering",
      Position: "Senior Software Engineer",
      IsActive: true,
      JoiningDate: "2021-11-05",
      Rewards: 1850,
      ProfileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP004",
      FirstName: "Emma",
      LastName: "Williams",
      Email: "emma.w@company.com",
      PhoneNumber: "+1 (555) 456-7890",
      Department: "Human Resources",
      Position: "HR Manager",
      IsActive: true,
      JoiningDate: "2023-03-10",
      Rewards: 950,
      ProfileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP005",
      FirstName: "David",
      LastName: "Brown",
      Email: "david.b@company.com",
      PhoneNumber: "+1 (555) 567-8901",
      Department: "Finance",
      Position: "Financial Analyst",
      IsActive: false,
      JoiningDate: "2022-05-18",
      Rewards: 750,
      ProfileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP006",
      FirstName: "Lisa",
      LastName: "Rodriguez",
      Email: "lisa.r@company.com",
      PhoneNumber: "+1 (555) 678-9012",
      Department: "Operations",
      Position: "Operations Manager",
      IsActive: true,
      JoiningDate: "2021-09-30",
      Rewards: 1950,
      ProfileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP007",
      FirstName: "Robert",
      LastName: "Patel",
      Email: "robert.p@company.com",
      PhoneNumber: "+1 (555) 789-0123",
      Department: "IT",
      Position: "System Administrator",
      IsActive: true,
      JoiningDate: "2023-06-14",
      Rewards: 1100,
      ProfileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP008",
      FirstName: "Jennifer",
      LastName: "Wilson",
      Email: "jennifer.w@company.com",
      PhoneNumber: "+1 (555) 890-1234",
      Department: "Customer Support",
      Position: "Support Lead",
      IsActive: true,
      JoiningDate: "2022-12-03",
      Rewards: 1420,
      ProfileImageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP009",
      FirstName: "James",
      LastName: "Taylor",
      Email: "james.t@company.com",
      PhoneNumber: "+1 (555) 901-2345",
      Department: "Sales",
      Position: "Account Executive",
      IsActive: true,
      JoiningDate: "2023-08-21",
      Rewards: 680,
      ProfileImageUrl: "https://images.unsplash.com/photo-1506919258185-6078bba55d2a?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP010",
      FirstName: "Amanda",
      LastName: "Garcia",
      Email: "amanda.g@company.com",
      PhoneNumber: "+1 (555) 012-3456",
      Department: "Marketing",
      Position: "Content Strategist",
      IsActive: false,
      JoiningDate: "2022-02-28",
      Rewards: 890,
      ProfileImageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP011",
      FirstName: "Kevin",
      LastName: "Lee",
      Email: "kevin.lee@company.com",
      PhoneNumber: "+1 (555) 123-7890",
      Department: "Engineering",
      Position: "Frontend Developer",
      IsActive: true,
      JoiningDate: "2023-04-12",
      Rewards: 1250,
      ProfileImageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP012",
      FirstName: "Olivia",
      LastName: "Martinez",
      Email: "olivia.m@company.com",
      PhoneNumber: "+1 (555) 234-8901",
      Department: "Product",
      Position: "Product Manager",
      IsActive: true,
      JoiningDate: "2021-07-19",
      Rewards: 2300,
      ProfileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP013",
      FirstName: "Daniel",
      LastName: "Kim",
      Email: "daniel.kim@company.com",
      PhoneNumber: "+1 (555) 345-9012",
      Department: "Engineering",
      Position: "Backend Developer",
      IsActive: true,
      JoiningDate: "2022-10-05",
      Rewards: 1550,
      ProfileImageUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP014",
      FirstName: "Sophia",
      LastName: "Anderson",
      Email: "sophia.a@company.com",
      PhoneNumber: "+1 (555) 456-0123",
      Department: "Design",
      Position: "UX Designer",
      IsActive: true,
      JoiningDate: "2023-02-17",
      Rewards: 1350,
      ProfileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP015",
      FirstName: "Thomas",
      LastName: "Wright",
      Email: "thomas.w@company.com",
      PhoneNumber: "+1 (555) 567-1234",
      Department: "Finance",
      Position: "Accountant",
      IsActive: true,
      JoiningDate: "2022-04-09",
      Rewards: 1020,
      ProfileImageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP016",
      FirstName: "Natalie",
      LastName: "Scott",
      Email: "natalie.s@company.com",
      PhoneNumber: "+1 (555) 678-2345",
      Department: "Legal",
      Position: "Legal Counsel",
      IsActive: true,
      JoiningDate: "2021-12-01",
      Rewards: 1950,
      ProfileImageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP017",
      FirstName: "Christopher",
      LastName: "Nguyen",
      Email: "chris.n@company.com",
      PhoneNumber: "+1 (555) 789-3456",
      Department: "IT",
      Position: "Network Engineer",
      IsActive: false,
      JoiningDate: "2022-07-25",
      Rewards: 830,
      ProfileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP018",
      FirstName: "Megan",
      LastName: "Baker",
      Email: "megan.b@company.com",
      PhoneNumber: "+1 (555) 890-4567",
      Department: "Customer Support",
      Position: "Customer Success Manager",
      IsActive: true,
      JoiningDate: "2023-09-08",
      Rewards: 920,
      ProfileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP019",
      FirstName: "Alexander",
      LastName: "Davis",
      Email: "alex.d@company.com",
      PhoneNumber: "+1 (555) 901-5678",
      Department: "Sales",
      Position: "Business Development",
      IsActive: true,
      JoiningDate: "2022-01-30",
      Rewards: 1750,
      ProfileImageUrl: "https://images.unsplash.com/photo-1506919258185-6078bba55d2a?w=400&h=400&fit=crop",
    },
    {
      EmployeeID: "EMP020",
      FirstName: "Isabella",
      LastName: "Clark",
      Email: "isabella.c@company.com",
      PhoneNumber: "+1 (555) 012-6789",
      Department: "Research & Development",
      Position: "Research Scientist",
      IsActive: true,
      JoiningDate: "2021-06-14",
      Rewards: 2450,
      ProfileImageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
    }
  ];

  const [aEmployees, setEmployees] = useState(dummyEmployees);
  const [bLoading, setLoading] = useState(false);
  const [nTotalPages, setTotalPages] = useState(Math.ceil(dummyEmployees.length / itemsPerPage));
  const [nTotalRecords, setTotalRecords] = useState(dummyEmployees.length);

  const defaultFilters = {
    department: "all",
    status: "all",
    position: "all",
  };
  const [oFilters, setFilters] = useState(defaultFilters);

  // Function to export employees to Excel
  const handleExportToExcel = useCallback(async () => {
    try {
      setExporting(true);
      
      // Prepare data for export
      const exportData = aEmployees.map(employee => ({
        "Employee ID": employee.EmployeeID,
        "First Name": employee.FirstName,
        "Last Name": employee.LastName,
        "Full Name": `${employee.FirstName} ${employee.LastName}`,
        "Email": employee.Email,
        "Phone Number": employee.PhoneNumber,
        "Department": employee.Department,
        "Position": employee.Position,
        "Status": employee.IsActive ? "Active" : "Inactive",
        "Joining Date": formatDate(employee.JoiningDate),
        "Rewards Points": employee.Rewards,
        "Profile Image URL": employee.ProfileImageUrl
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const maxWidths = {};
      XLSX.utils.sheet_to_json(worksheet, { header: 1 }).forEach(row => {
        row.forEach((cell, colIndex) => {
          const cellLength = cell ? String(cell).length : 0;
          maxWidths[colIndex] = Math.max(maxWidths[colIndex] || 0, cellLength);
        });
      });

      worksheet['!cols'] = Object.keys(maxWidths).map(col => ({
        wch: Math.min(maxWidths[col] + 2, 50)
      }));

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

      // Add summary statistics sheet
      const summaryData = [
        {
          "Metric": "Total Employees",
          "Value": aEmployees.length
        },
        {
          "Metric": "Active Employees",
          "Value": aEmployees.filter(e => e.IsActive).length
        },
        {
          "Metric": "Inactive Employees",
          "Value": aEmployees.filter(e => !e.IsActive).length
        },
        {
          "Metric": "Total Rewards Points",
          "Value": aEmployees.reduce((sum, e) => sum + e.Rewards, 0)
        },
        {
          "Metric": "Average Rewards per Employee",
          "Value": Math.round(aEmployees.reduce((sum, e) => sum + e.Rewards, 0) / aEmployees.length)
        }
      ];

      // Department breakdown
      const departments = [...new Set(aEmployees.map(e => e.Department))];
      departments.forEach(dept => {
        const deptEmployees = aEmployees.filter(e => e.Department === dept);
        summaryData.push({
          "Metric": `${dept} Department Employees`,
          "Value": deptEmployees.length
        });
        summaryData.push({
          "Metric": `${dept} Total Rewards`,
          "Value": deptEmployees.reduce((sum, e) => sum + e.Rewards, 0)
        });
      });

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      
      // Auto-size summary columns
      const summaryMaxWidths = {};
      XLSX.utils.sheet_to_json(summaryWorksheet, { header: 1 }).forEach(row => {
        row.forEach((cell, colIndex) => {
          const cellLength = cell ? String(cell).length : 0;
          summaryMaxWidths[colIndex] = Math.max(summaryMaxWidths[colIndex] || 0, cellLength);
        });
      });

      summaryWorksheet['!cols'] = Object.keys(summaryMaxWidths).map(col => ({
        wch: Math.min(summaryMaxWidths[col] + 2, 50)
      }));

      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

      // Generate file name with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `employees_export_${timestamp}.xlsx`;

      // Generate and download Excel file
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error("Export error:", error);
      // Silent fail - no alert
    } finally {
      setExporting(false);
    }
  }, [aEmployees]);

  // Helper function to get profile image URL
  const getProfileImageUrl = (employee) => {
    return employee.ProfileImageUrl || userProfile;
  };

  // Helper function to get department color
  const getDepartmentColor = (department) => {
    const departmentColors = {
      Sales: "bg-blue-100 text-blue-800",
      Marketing: "bg-purple-100 text-purple-800",
      IT: "bg-green-100 text-green-800",
      HR: "bg-pink-100 text-pink-800",
      Finance: "bg-yellow-100 text-yellow-800",
      Operations: "bg-indigo-100 text-indigo-800",
      "Customer Service": "bg-orange-100 text-orange-800",
    };
    return departmentColors[department] || "bg-gray-100 text-gray-800";
  };

  // Helper function to get rewards color based on amount
  const getRewardsColor = (rewards) => {
    if (rewards >= 2500) return "bg-green-100 text-green-800";
    if (rewards >= 1500) return "bg-blue-100 text-blue-800";
    if (rewards >= 1000) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter employees based on search term and filters
  const filteredEmployees = aEmployees.filter(employee => {
    const matchesSearch =
      sSearchTerm === "" ||
      employee.FirstName.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      employee.LastName.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      employee.Email.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      employee.PhoneNumber.includes(sSearchTerm) ||
      employee.Department.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      employee.Position.toLowerCase().includes(sSearchTerm.toLowerCase()) ||
      employee.EmployeeID.toLowerCase().includes(sSearchTerm.toLowerCase());

    const matchesDepartment =
      oFilters.department === "all" ||
      employee.Department === oFilters.department;

    const matchesStatus =
      oFilters.status === "all" ||
      (oFilters.status === "true" && employee.IsActive) ||
      (oFilters.status === "false" && !employee.IsActive);

    const matchesPosition =
      oFilters.position === "all" ||
      employee.Position === oFilters.position;

    return matchesSearch && matchesDepartment && matchesStatus && matchesPosition;
  });

  // Calculate pagination
  const startIndex = (nCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);
  const totalFilteredPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleFilterChange = (e, filterName) => {
    setFilters({
      ...oFilters,
      [filterName]: e.target.value,
    });
    setCurrentPage(1);
  };

  const departmentOptions = [
    { value: "all", label: t("COMMON.ALL") },
    { value: "Sales", label: "Sales" },
    { value: "Marketing", label: "Marketing" },
    { value: "IT", label: "IT" },
    { value: "HR", label: "HR" },
    { value: "Finance", label: "Finance" },
    { value: "Operations", label: "Operations" },
    { value: "Customer Service", label: "Customer Service" },
  ];

  const positionOptions = [
    { value: "all", label: t("COMMON.ALL") },
    { value: "Sales Manager", label: "Sales Manager" },
    { value: "Sales Executive", label: "Sales Executive" },
    { value: "Marketing Director", label: "Marketing Director" },
    { value: "Content Strategist", label: "Content Strategist" },
    { value: "Senior Developer", label: "Senior Developer" },
    { value: "Frontend Developer", label: "Frontend Developer" },
    { value: "DevOps Engineer", label: "DevOps Engineer" },
    { value: "HR Manager", label: "HR Manager" },
    { value: "Recruiter", label: "Recruiter" },
    { value: "Financial Analyst", label: "Financial Analyst" },
    { value: "Accountant", label: "Accountant" },
    { value: "Operations Manager", label: "Operations Manager" },
    { value: "Logistics Coordinator", label: "Logistics Coordinator" },
    { value: "Support Lead", label: "Support Lead" },
    { value: "Customer Support", label: "Customer Support" },
  ];

  const statusOptions = [
    { value: "all", label: t("COMMON.ALL") },
    { value: "true", label: t("COMMON.ACTIVE") },
    { value: "false", label: t("COMMON.INACTIVE") },
  ];

  const additionalFilters = [
    {
      label: t("EMPLOYEES.FILTERS.DEPARTMENT"),
      name: "department",
      value: oFilters.department,
      options: departmentOptions,
      placeholder: t("EMPLOYEES.FILTERS.DEPARTMENT"),
    },
    {
      label: t("EMPLOYEES.FILTERS.POSITION"),
      name: "position",
      value: oFilters.position,
      options: positionOptions,
      placeholder: t("EMPLOYEES.FILTERS.POSITION"),
    },
    {
      label: t("EMPLOYEES.FILTERS.STATUS"),
      name: "status",
      value: oFilters.status,
      options: statusOptions,
    },
  ];

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage(prev => Math.min(prev + 1, totalFilteredPages));
  const handlePageClick = (page) => setCurrentPage(page);

  const handleEdit = (employeeId) => navigate(`/editEmployee/${employeeId}`);

  const handleStatusChange = (employeeId, newStatus) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(employee =>
        employee.EmployeeID === employeeId
          ? { ...employee, IsActive: newStatus }
          : employee
      )
    );
  };

  useEffect(() => {
    setTitle(t("EMPLOYEES.TITLE"));
  }, [setTitle, t]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50">
      <Toolbar
        searchTerm={sSearchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={sViewMode}
        setViewMode={setViewMode}
        showFilterDropdown={sShowFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        additionalFilters={additionalFilters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={t("EMPLOYEES.SEARCH_PLACEHOLDER")}
        onClearFilters={handleClearFilters}
        onExport={handleExportToExcel}
        exportLoading={bExporting}
      />

      {/* Table view */}
      {sViewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("EMPLOYEES.TABLE.EMPLOYEE_ID")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("COMMON.EMPLOYEE")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("EMPLOYEES.TABLE.DEPARTMENT")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("EMPLOYEES.TABLE.POSITION")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("EMPLOYEES.TABLE.REWARDS")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("COMMON.STATUS")}
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {bLoading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <div className="flex justify-center items-center h-32">
                          <Loader className="h-8 w-8" />
                        </div>
                      </td>
                    </tr>
                  ) : paginatedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-500 py-4">
                        {t("EMPLOYEES.NO_EMPLOYEES_FOUND")}
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployees.map((employee) => (
                      <tr key={employee.EmployeeID} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.EmployeeID}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(employee.JoiningDate)}
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                src={getProfileImageUrl(employee)}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = userProfile;
                                }}
                                alt={`${employee.FirstName} ${employee.LastName}`}
                              />
                            </div>
                            <div className="ml-4 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {employee.FirstName} {employee.LastName}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                <a
                                  href={`mailto:${employee.Email}`}
                                  className="hover:text-blue-600 hover:underline"
                                >
                                  {employee.Email}
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(employee.Department)}`}>
                            {employee.Department}
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-normal">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="break-words">{employee.Position}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-2 text-yellow-500 flex-shrink-0" />
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRewardsColor(employee.Rewards)}`}>
                              {employee.Rewards.toLocaleString()} points
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={employee.IsActive}
                              onChange={(e) =>
                                handleStatusChange(employee.EmployeeID, e.target.checked)
                              }
                            />
                            <span className={`text-xs px-2 py-1 rounded ${employee.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {employee.IsActive ? t("COMMON.ACTIVE") : t("COMMON.INACTIVE")}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="flex justify-center items-center h-32">
                <Loader className="h-8 w-8" />
              </div>
            </div>
          ) : paginatedEmployees.length === 0 ? (
            <div className="col-span-full text-center py-4">
              {t("EMPLOYEES.NO_EMPLOYEES_FOUND")}
            </div>
          ) : (
            paginatedEmployees.map((employee) => (
              <div
                key={employee.EmployeeID}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200">
                      <img
                        className="h-full w-full object-cover"
                        src={getProfileImageUrl(employee)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = userProfile;
                        }}
                        alt={`${employee.FirstName} ${employee.LastName}`}
                      />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-white ${employee.IsActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-gray-900 truncate">
                      {employee.FirstName} {employee.LastName}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {employee.EmployeeID}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="font-medium">{employee.Position}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getDepartmentColor(employee.Department)}`}>
                      {employee.Department}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2 flex-shrink-0 text-yellow-500" />
                    <span className="font-semibold">{employee.Rewards.toLocaleString()} points</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Joined: {formatDate(employee.JoiningDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <a
                      href={`mailto:${employee.Email}`}
                      className="truncate hover:text-blue-600 hover:underline"
                      title={employee.Email}
                    >
                      {employee.Email}
                    </a>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={employee.IsActive}
                        onChange={(e) =>
                          handleStatusChange(employee.EmployeeID, e.target.checked)
                        }
                        size="small"
                      />
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${employee.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {employee.IsActive ? t("COMMON.ACTIVE") : t("COMMON.INACTIVE")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {filteredEmployees.length > 0 && (
        <Pagination
          currentPage={nCurrentPage}
          totalPages={totalFilteredPages}
          totalItems={filteredEmployees.length}
          itemsPerPage={itemsPerPage}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}
    </div>
  );
};

export default Employees;