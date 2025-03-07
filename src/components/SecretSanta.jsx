"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { assignSecretSanta, removeDuplicateGivers } from "./Utils";

export default function SecretSanta() {
  const [employees, setEmployees] = useState([]);
  const [previousAssignments, setPreviousAssignments] = useState([]);
  const [newAssignments, setNewAssignments] = useState([]);
  const [error, setError] = useState(null);
  const [key1,setKey1]=useState(0)
  const [key2,setKey2]=useState(120)
  // Handle file upload & parse XLSX
  const handleFileUpload = (event, isPrevious) => {
    if(event.target.files){
      let fileName=event.target.files?.[0].name
         let xlsx=fileName.substring(fileName.length,fileName.length-4)
         if(xlsx!=='xlsx'){
          //reset value
          if(isPrevious){
            setKey2((k)=>k+1)
          }else{
            setKey1((k)=>k+1)
          }
          alert("Please input only valid xlsx file")
          return
         }
    }
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      if (isPrevious) {
        setPreviousAssignments(
          parsedData.map((p) => ({
             giverName: p.Employee_Name, giverEmail: p.Employee_EmailID ,
              receiverName: p.Secret_Child_Name, receiverEmail: p.Secret_Child_EmailID ,
          }))
        );
      } else {
        setEmployees(
          parsedData.map((row) => ({
            name: row.Employee_Name,
            email: row.Employee_EmailID,
          }))
        );
      }
    };
  };
 
  // Generate Secret Santa Assignments
  const generateAssignments = () => {
    const presentEmp = Array.from(new Map(employees.map(obj => [obj.name, obj])).values());
    const prevEmp=removeDuplicateGivers(previousAssignments)
    const result=assignSecretSanta(presentEmp,prevEmp)
    setNewAssignments(result)
  };

  // Export XLSX file
  const exportXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      newAssignments.map((assignment) => ({
        Employee_Name: assignment.giverName,
        Employee_EmailID: assignment.giverEmail,
        Secret_Child_Name: assignment.receiverName,
        Secret_Child_EmailID: assignment.receiverEmail,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Secret Santa");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "SecretSantaAssignments.xlsx");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-xl font-bold text-center mb-4">🎁 Secret Santa Generator</h1>

      {/* Upload Employee XLSX */}
      <div key={key1}>
        <label>Input a file </label>
        <input type="file" accept=".xlsx" onChange={(e) => handleFileUpload(e, false)} className="mb-2 w-full" />
      </div> 
      <div key={key2} style={{marginTop:'10px'}}>
        <label>Previous assignment</label>
        <input type="file" accept=".xlsx" onChange={(e) => handleFileUpload(e, true)} className="mb-4 w-full" />
      </div>
      
      {/* Generate Button */}
      <button
        onClick={generateAssignments}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
        style={{marginTop:'10px'}}
      >
        Generate Secret Santa 🎅
      </button>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Display Assignments */}
      {newAssignments.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">🎄 Assignments</h2>
          <ul className="bg-gray-100 p-4 rounded-md">
            {newAssignments.map((assignment, index) => (
              <li style={{listStyleType:'none'}} key={index} className="mb-1">
                <strong>{assignment.giverName}</strong> → {assignment.receiverName}
              </li>
            ))}
          </ul>

          {/* Export XLSX */}
          <button onClick={exportXLSX} className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            Download XLSX 📂
          </button>
        </div>
      )}
    </div>
  );
}
