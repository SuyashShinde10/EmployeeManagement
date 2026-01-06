import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import EditEmployeeModal from "./EditEmployeeModal";

const EmployeeList = ({ refreshTrigger }) => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmp, setEditingEmp] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); 
  const [internalRefresh, setInternalRefresh] = useState(0);

  // GET TOKEN
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEmployees = async () => {
      const companyId = localStorage.getItem("companyId");
      try {
        const res = await axios.get(`http://localhost:8000/api/employees/search?companyId=${companyId}&query=&includeResigned=true`, {
            headers: { Authorization: `Bearer ${token}` } // 🔒 SECURE HEADER
        });
        setEmployees(res.data);
      } catch (err) { 
        console.error(err);
      }
    };
    if(token) fetchEmployees();
  }, [refreshTrigger, internalRefresh, token]);

  const handleDelete = async (id) => {
    if (window.confirm("Archive this employee?")) {
        try {
            await axios.put(`http://localhost:8000/api/employee/delete/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` } // 🔒 SECURE HEADER
            });
            toast.info("Archived");
            setInternalRefresh(prev => prev + 1);
        } catch (err) { toast.error("Failed"); }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.team.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const activeEmployees = filteredEmployees.filter(emp => emp.status === 'Active');
  const resignedEmployees = filteredEmployees.filter(emp => emp.status === 'Resigned');

  return (
    <div className="card border-0 shadow-sm h-100" style={{borderRadius: '12px'}}>
      <div className="card-header bg-white border-0 pt-4 pb-0 px-4 d-flex justify-content-between align-items-center">
        <h5 className="fw-bold mb-0">Team Directory</h5>
        <div className="bg-light rounded-pill px-3 py-1">
            <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-0 small" 
                style={{outline: 'none', width: '150px'}}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      
      <div className="card-body p-4">
        <div className="d-flex gap-3 mb-3 border-bottom pb-2">
            <button className={`btn btn-sm rounded-pill px-3 fw-bold ${activeTab === 'active' ? 'btn-dark' : 'btn-light text-muted'}`} onClick={() => setActiveTab('active')}>Active ({activeEmployees.length})</button>
            <button className={`btn btn-sm rounded-pill px-3 fw-bold ${activeTab === 'resigned' ? 'btn-dark' : 'btn-light text-muted'}`} onClick={() => setActiveTab('resigned')}>Archived ({resignedEmployees.length})</button>
        </div>

        <div className="table-responsive">
            <table className="table align-middle">
                <thead className="text-secondary small text-uppercase">
                    <tr><th className="fw-bold border-0">Name</th><th className="fw-bold border-0">Role</th><th className="text-end fw-bold border-0"></th></tr>
                </thead>
                <tbody>
                    {(activeTab === 'active' ? activeEmployees : resignedEmployees).map(emp => (
                        <tr key={emp._id}>
                            <td className="border-0 py-3">
                                <div className="d-flex align-items-center">
                                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 fw-bold" style={{width: 35, height: 35}}>{emp.name.charAt(0)}</div>
                                    <div>
                                        <div className="fw-bold text-dark" style={{fontSize: '0.9rem'}}>{emp.name}</div>
                                        <div className="text-muted" style={{fontSize: '0.75rem'}}>{emp.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="border-0"><span className="badge bg-light text-dark border fw-normal">{emp.team}</span></td>
                            <td className="border-0 text-end">
                                {activeTab === 'active' && (
                                    <>
                                        <button className="btn btn-icon btn-sm text-muted" onClick={() => setEditingEmp(emp)}>✎</button>
                                        <button className="btn btn-icon btn-sm text-danger" onClick={() => handleDelete(emp._id)}>×</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
      {editingEmp && <EditEmployeeModal employee={editingEmp} onClose={() => setEditingEmp(null)} onSuccess={() => setInternalRefresh(prev => prev + 1)} />}
    </div>
  );
};

export default EmployeeList;