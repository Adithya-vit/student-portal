import { Fragment, useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import "./App.css";
import { supabase } from "./supabaseClient";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const [loginLoading, setLoginLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // =========================
  // PASSWORD RECOVERY
  // =========================

  const [passwordRecoveryMode, setPasswordRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);
  const [passwordRecoveryError, setPasswordRecoveryError] = useState("");

  // =========================
  // STUDENTS
  // =========================

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [studentSaving, setStudentSaving] = useState(false);

  // =========================
  // STUDENT DELETION
  // =========================

  const [deleteStudentTarget, setDeleteStudentTarget] = useState(null);
  const [adminDeletePassword, setAdminDeletePassword] = useState("");
  const [confirmAdminDeletePassword, setConfirmAdminDeletePassword] = useState("");
  const [studentDeleting, setStudentDeleting] = useState(false);

  const [studentForm, setStudentForm] = useState({
    id: "",
    name: "",
    email: "",
    temporary_password: "",
    phone: "",
    program: "",
    intake: "",
    status: "Active",
    payment: "Pending",
  });

  // =========================
  // PAYMENTS
  // =========================

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    student_id: "",
    invoice_number: "",
    description: "",
    amount: "",
  });


  // =========================
  // PAYMENT PROOF SUBMISSION
  // =========================

  const [selectedProofPaymentId, setSelectedProofPaymentId] = useState(null);
  const [paymentProofReference, setPaymentProofReference] = useState("");
  const [selectedPaymentProofFile, setSelectedPaymentProofFile] = useState(null);
  const [paymentProofUploading, setPaymentProofUploading] = useState(false);
  const [paymentProofFileInputKey, setPaymentProofFileInputKey] = useState(0);


  // =========================
  // DOCUMENTS
  // =========================

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [selectedDocumentFile, setSelectedDocumentFile] = useState(null);
  const [documentFileInputKey, setDocumentFileInputKey] = useState(0);

  const [documentForm, setDocumentForm] = useState({
    student_id: "",
    document_name: "",
    document_type: "",
  });


  // =========================
  // REAL STUDENT PORTAL DATA
  // =========================

  const [studentRecord, setStudentRecord] = useState(null);
  const [studentPayments, setStudentPayments] = useState([]);
  const [studentDocuments, setStudentDocuments] = useState([]);
  const [studentDataLoading, setStudentDataLoading] = useState(false);
  const [studentDataError, setStudentDataError] = useState("");

  // =========================
  // SHARED WECHAT PAYMENT QR
  // =========================

  const [wechatQrPath, setWechatQrPath] = useState("");
  const [wechatQrUrl, setWechatQrUrl] = useState("");
  const [selectedWechatQrFile, setSelectedWechatQrFile] = useState(null);
  const [wechatQrUploading, setWechatQrUploading] = useState(false);
  const [wechatQrFileInputKey, setWechatQrFileInputKey] = useState(0);

  // =========================
  // LOAD STUDENTS
  // =========================

  const loadStudents = async () => {
    setStudentsLoading(true);
    setStudentsError("");

    const { data, error: databaseError } = await supabase
      .from("students")
      .select(`
        id,
        student_id,
        full_name,
        email,
        phone,
        course_or_program,
        intake,
        enrollment_status,
        payment_status
      `)
      .order("id", { ascending: true });

    if (databaseError) {
      console.error(databaseError);
      setStudentsError("Could not load students from the database.");
      setStudentsLoading(false);
      return;
    }

    const formattedStudents = data.map((student) => ({
      dbId: student.id,
      id: student.student_id,
      name: student.full_name,
      email: student.email || "",
      phone: student.phone || "",
      program: student.course_or_program || "",
      intake: student.intake || "",
      status: student.enrollment_status || "Active",
      payment: student.payment_status || "Pending",
    }));

    setStudents(formattedStudents);
    setStudentsLoading(false);
  };

  // =========================
  // LOAD PAYMENTS
  // =========================

  const loadPayments = async () => {
    setPaymentsLoading(true);
    setPaymentsError("");

    const { data, error: databaseError } = await supabase
      .from("payments")
      .select(`
        id,
        student_id,
        invoice_number,
        description,
        amount,
        payment_method,
        transaction_reference,
        payment_proof_url,
        verification_status,
        payment_date,
        receipt_reference,
        created_at
      `)
      .order("id", { ascending: false });

    if (databaseError) {
      console.error(databaseError);
      setPaymentsError("Could not load payment records.");
      setPaymentsLoading(false);
      return;
    }

    setPayments(data || []);
    setPaymentsLoading(false);
  };


  // =========================
  // LOAD DOCUMENTS
  // =========================

  const loadDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError("");

    const { data, error: databaseError } = await supabase
      .from("documents")
      .select(`
        id,
        student_id,
        document_name,
        document_type,
        file_path,
        uploaded_by,
        uploaded_at,
        is_active
      `)
      .eq("is_active", true)
      .order("uploaded_at", { ascending: false });

    if (databaseError) {
      console.error(databaseError);
      setDocumentsError("Could not load document records.");
      setDocumentsLoading(false);
      return;
    }

    setDocuments(data || []);
    setDocumentsLoading(false);
  };

  const loadWechatPaymentQr = async () => {
    const { data: setting, error: settingError } = await supabase
      .from("portal_settings")
      .select("setting_value")
      .eq("setting_key", "wechat_payment_qr")
      .maybeSingle();

    if (settingError) {
      console.error(settingError);
      setWechatQrPath("");
      setWechatQrUrl("");
      return;
    }

    const path = setting?.setting_value || "";
    setWechatQrPath(path);

    if (!path) {
      setWechatQrUrl("");
      return;
    }

    const { data: signedData, error: signedUrlError } =
      await supabase.storage
        .from("portal-assets")
        .createSignedUrl(path, 3600);

    if (signedUrlError || !signedData?.signedUrl) {
      console.error(signedUrlError);
      setWechatQrUrl("");
      return;
    }

    setWechatQrUrl(signedData.signedUrl);
  };

  const handleWechatQrFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedWechatQrFile(file);
  };

  const handleWechatQrUpload = async (event) => {
    event.preventDefault();

    if (!selectedWechatQrFile) {
      alert("Please choose a WeChat QR image first.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedWechatQrFile.type)) {
      alert("Only JPG, JPEG and PNG images are allowed for the WeChat QR.");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (selectedWechatQrFile.size > maxFileSize) {
      alert("The QR image is too large. Maximum allowed size is 5 MB.");
      return;
    }

    setWechatQrUploading(true);

    const filePath = "payments/wechat-payment-qr";

    const { error: uploadError } = await supabase.storage
      .from("portal-assets")
      .upload(filePath, selectedWechatQrFile, {
        upsert: true,
        cacheControl: "300",
        contentType: selectedWechatQrFile.type,
      });

    if (uploadError) {
      console.error(uploadError);
      alert(`Could not upload WeChat QR: ${uploadError.message}`);
      setWechatQrUploading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(userError);
      alert("Could not verify the signed-in administrator.");
      setWechatQrUploading(false);
      return;
    }

    const { error: settingsError } = await supabase
      .from("portal_settings")
      .update({
        setting_value: filePath,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq("setting_key", "wechat_payment_qr");

    if (settingsError) {
      console.error(settingsError);
      alert(`QR uploaded, but settings could not be updated: ${settingsError.message}`);
      setWechatQrUploading(false);
      return;
    }

    setSelectedWechatQrFile(null);
    setWechatQrFileInputKey((previous) => previous + 1);
    setWechatQrUploading(false);

    await loadWechatPaymentQr();

    alert("WeChat payment QR updated successfully for all student portals.");
  };

  const loadStudentPortalData = async () => {
    setStudentDataLoading(true);
    setStudentDataError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(userError);
      setStudentDataError("Could not verify the signed-in student.");
      setStudentDataLoading(false);
      return false;
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select(`
        id,
        student_id,
        full_name,
        nic_or_passport,
        email,
        phone,
        address,
        guardian_name,
        guardian_contact,
        course_or_program,
        intake,
        enrollment_status,
        payment_status,
        auth_user_id
      `)
      .eq("auth_user_id", user.id)
      .single();

    if (studentError || !student) {
      console.error(studentError);
      setStudentDataError(
        "This login is not linked to a student record. Please contact the administrator."
      );
      setStudentDataLoading(false);
      return false;
    }

    const { data: ownPayments, error: paymentError } = await supabase
      .from("payments")
      .select(`
        id,
        student_id,
        invoice_number,
        description,
        amount,
        payment_method,
        transaction_reference,
        payment_proof_url,
        verification_status,
        payment_date,
        receipt_reference,
        created_at
      `)
      .eq("student_id", student.student_id)
      .order("created_at", { ascending: false });

    if (paymentError) {
      console.error(paymentError);
      setStudentDataError("Could not load your payment records.");
      setStudentDataLoading(false);
      return false;
    }

    const { data: ownDocuments, error: documentError } = await supabase
      .from("documents")
      .select(`
        id,
        student_id,
        document_name,
        document_type,
        file_path,
        uploaded_at,
        is_active
      `)
      .eq("student_id", student.student_id)
      .eq("is_active", true)
      .order("uploaded_at", { ascending: false });

    if (documentError) {
      console.error(documentError);
      setStudentDataError("Could not load your documents.");
      setStudentDataLoading(false);
      return false;
    }

    setStudentRecord(student);
    setStudentPayments(ownPayments || []);
    setStudentDocuments(ownDocuments || []);
    setStudentDataLoading(false);
    return true;
  };

  const restoreUserFromSession = async (user) => {
    if (!user) {
      setLoggedIn(false);
      setUserRole("");
      setAuthReady(true);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.error(profileError);
      await supabase.auth.signOut();
      setLoggedIn(false);
      setUserRole("");
      setAuthReady(true);
      return;
    }

    setUsername(user.email || "");

    if (profile.role === "admin") {
      setLoggedIn(true);
      setUserRole("admin");
      setActivePage("admin-dashboard");
      setAuthReady(true);
      return;
    }

    if (profile.role === "student") {
      setLoggedIn(true);
      setUserRole("student");
      setActivePage("dashboard");
      setAuthReady(true);
      return;
    }

    await supabase.auth.signOut();
    setLoggedIn(false);
    setUserRole("");
    setAuthReady(true);
  };

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const searchParams = new URLSearchParams(window.location.search);

      const recoveryInUrl =
        window.location.hash.includes("type=recovery") ||
        searchParams.get("type") === "recovery" ||
        searchParams.get("recovery") === "1";

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (sessionError) {
        console.error(sessionError);
        setAuthReady(true);
        return;
      }

      if (recoveryInUrl) {
        setPasswordRecoveryMode(true);
        setLoggedIn(false);
        setUserRole("");
        setAuthReady(true);
        return;
      }

      await restoreUserFromSession(session?.user || null);
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecoveryMode(true);
        setLoggedIn(false);
        setUserRole("");
        setPasswordRecoveryError("");
        setAuthReady(true);
        return;
      }

      if (event === "SIGNED_OUT") {
        setLoggedIn(false);
        setUserRole("");
        setStudentRecord(null);
        setStudentPayments([]);
        setStudentDocuments([]);
        setAuthReady(true);
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        restoreUserFromSession(session?.user || null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loggedIn && userRole === "admin") {
      loadStudents();
      loadPayments();
      loadDocuments();
      loadWechatPaymentQr();
    }

    if (loggedIn && userRole === "student") {
      loadStudentPortalData();
      loadWechatPaymentQr();
    }
  }, [loggedIn, userRole]);

  // =========================
  // PASSWORD RECOVERY
  // =========================

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();

    setPasswordRecoveryError("");

    if (newPassword.length < 8) {
      setPasswordRecoveryError(
        "Your new password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordRecoveryError("The two passwords do not match.");
      return;
    }

    setPasswordUpdateLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error(updateError);
      setPasswordRecoveryError(
        `Could not update password: ${updateError.message}`
      );
      setPasswordUpdateLoading(false);
      return;
    }

    await supabase.auth.signOut();

    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordRecoveryMode(false);
    setPasswordRecoveryError("");
    setLoggedIn(false);
    setUserRole("");
    setUsername("");
    setPassword("");
    setAuthReady(true);
    setPasswordUpdateLoading(false);

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

    alert(
      "Password updated successfully. You can now sign in with your new password."
    );
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoginLoading(true);

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: username.trim(),
        password: password,
      });

    if (signInError) {
      console.error(signInError);
      setError("Invalid email or password.");
      setLoginLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setError("Your account does not have a valid portal role.");
      setLoginLoading(false);
      return;
    }

    if (profile.role === "admin") {
      setLoggedIn(true);
      setUserRole("admin");
      setActivePage("admin-dashboard");
      setAuthReady(true);
      setError("");
      setLoginLoading(false);
      return;
    }

    if (profile.role === "student") {
      const { data: linkedStudent, error: linkedStudentError } = await supabase
        .from("students")
        .select("student_id")
        .eq("auth_user_id", data.user.id)
        .single();

      if (linkedStudentError || !linkedStudent) {
        console.error(linkedStudentError);
        await supabase.auth.signOut();
        setError(
          "This student account is not linked to a student record. Please contact the administrator."
        );
        setLoginLoading(false);
        return;
      }

      setLoggedIn(true);
      setUserRole("student");
      setActivePage("dashboard");
      setAuthReady(true);
      setError("");
      setLoginLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setError("This account does not have access to this portal.");
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setLoggedIn(false);
    setUserRole("");
    setAuthReady(true);
    setUsername("");
    setPassword("");
    setActivePage("dashboard");

    setStudents([]);
    setPayments([]);
    setDocuments([]);
    setStudentRecord(null);
    setStudentPayments([]);
    setStudentDocuments([]);
    setStudentDataError("");
    setSelectedProofPaymentId(null);
    setPaymentProofReference("");
    setSelectedPaymentProofFile(null);
    setSearchTerm("");
  };

  // =========================
  // STUDENT MANAGEMENT
  // =========================

  const openAddStudent = () => {
    setEditingStudentId(null);

    setStudentForm({
      id: "",
      name: "",
      email: "",
      temporary_password: "",
      phone: "",
      program: "",
      intake: "",
      status: "Active",
      payment: "Pending",
    });

    setShowStudentForm(true);
  };

  const openEditStudent = (student) => {
    setEditingStudentId(student.dbId);

    setStudentForm({
      id: student.id,
      name: student.name,
      email: student.email,
      temporary_password: "",
      phone: student.phone,
      program: student.program,
      intake: student.intake,
      status: student.status,
      payment: student.payment,
    });

    setShowStudentForm(true);
  };

  const handleStudentFormChange = (event) => {
    const { name, value } = event.target;

    setStudentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleStudentSubmit = async (event) => {
    event.preventDefault();

    if (
      !studentForm.id ||
      !studentForm.name ||
      !studentForm.email ||
      !studentForm.program
    ) {
      alert("Please fill in Student ID, Name, Email and Program.");
      return;
    }

    if (!editingStudentId && studentForm.temporary_password.length < 8) {
      alert("Temporary password must be at least 8 characters.");
      return;
    }

    setStudentSaving(true);

    const databaseRecord = {
      student_id: studentForm.id.trim(),
      full_name: studentForm.name.trim(),
      email: studentForm.email.trim(),
      phone: studentForm.phone.trim(),
      course_or_program: studentForm.program.trim(),
      intake: studentForm.intake.trim(),
      enrollment_status: studentForm.status,
      payment_status: studentForm.payment,
      updated_at: new Date().toISOString(),
    };

    if (editingStudentId) {
      const { error: updateError } = await supabase
        .from("students")
        .update(databaseRecord)
        .eq("id", editingStudentId);

      if (updateError) {
        console.error(updateError);
        alert(`Could not update student: ${updateError.message}`);
        setStudentSaving(false);
        return;
      }

      alert("Student updated successfully.");
    } else {
      const { data: functionData, error: functionError } =
        await supabase.functions.invoke("create-student", {
          body: {
            ...databaseRecord,
            temporary_password: studentForm.temporary_password,
          },
        });

      if (functionError) {
        console.error(functionError);

        let message =
          functionError.message ||
          "Could not create the student account.";

        try {
          if (
            functionError.context &&
            typeof functionError.context.json === "function"
          ) {
            const errorBody = await functionError.context.json();

            if (errorBody?.error) {
              message = errorBody.error;
            }
          }
        } catch (contextError) {
          console.error(contextError);
        }

        alert(`Could not add student: ${message}`);
        setStudentSaving(false);
        return;
      }

      if (!functionData?.success) {
        alert(
          `Could not add student: ${
            functionData?.error || "Unknown server response."
          }`
        );
        setStudentSaving(false);
        return;
      }

      alert(
        "Student account created successfully. The student can now sign in with the email and temporary password."
      );
    }

    setShowStudentForm(false);
    setEditingStudentId(null);
    setStudentSaving(false);

    await loadStudents();
  };

  const openDeleteStudent = (student) => {
    setDeleteStudentTarget(student);
    setAdminDeletePassword("");
    setConfirmAdminDeletePassword("");
  };

  const closeDeleteStudent = () => {
    if (studentDeleting) return;

    setDeleteStudentTarget(null);
    setAdminDeletePassword("");
    setConfirmAdminDeletePassword("");
  };

  const handleDeleteStudent = async (event) => {
    event.preventDefault();

    if (!deleteStudentTarget) return;

    if (!adminDeletePassword || !confirmAdminDeletePassword) {
      alert("Please enter the administrator password twice.");
      return;
    }

    if (adminDeletePassword !== confirmAdminDeletePassword) {
      alert("The two administrator password entries do not match.");
      return;
    }

    setStudentDeleting(true);

    const { data: functionData, error: functionError } =
      await supabase.functions.invoke("delete-student", {
        body: {
          student_id: deleteStudentTarget.id,
          admin_password: adminDeletePassword,
        },
      });

    if (functionError) {
      console.error(functionError);

      let message =
        functionError.message ||
        "Could not delete the student.";

      try {
        if (
          functionError.context &&
          typeof functionError.context.json === "function"
        ) {
          const errorBody = await functionError.context.json();

          if (errorBody?.error) {
            message = errorBody.error;
          }
        }
      } catch (contextError) {
        console.error(contextError);
      }

      alert(`Could not delete student: ${message}`);
      setStudentDeleting(false);
      return;
    }

    if (!functionData?.success) {
      alert(
        `Could not delete student: ${
          functionData?.error || "Unknown server response."
        }`
      );
      setStudentDeleting(false);
      return;
    }

    alert(
      `${deleteStudentTarget.name} (${deleteStudentTarget.id}) was deleted successfully.`
    );

    setStudentDeleting(false);
    setDeleteStudentTarget(null);
    setAdminDeletePassword("");
    setConfirmAdminDeletePassword("");

    await Promise.all([
      loadStudents(),
      loadPayments(),
      loadDocuments(),
    ]);
  };

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();

    return (
      student.id.toLowerCase().includes(search) ||
      student.name.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      student.program.toLowerCase().includes(search)
    );
  });

  // =========================
  // ADMIN PAYMENT MANAGEMENT
  // =========================

  const openAddPayment = () => {
    setPaymentForm({
      student_id: "",
      invoice_number: "",
      description: "",
      amount: "",
    });

    setShowPaymentForm(true);
  };

  const handlePaymentFormChange = (event) => {
    const { name, value } = event.target;

    setPaymentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    if (
      !paymentForm.student_id ||
      !paymentForm.invoice_number ||
      !paymentForm.amount
    ) {
      alert("Please select a student and enter invoice number and amount.");
      return;
    }

    const amountNumber = Number(paymentForm.amount);

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setPaymentSaving(true);

    const { error: insertError } = await supabase
      .from("payments")
      .insert([
        {
          student_id: paymentForm.student_id,
          invoice_number: paymentForm.invoice_number.trim(),
          description:
            paymentForm.description.trim() || "Student Payment",
          amount: amountNumber,
          payment_method: "WeChat QR",
          verification_status: "Pending",
          updated_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error(insertError);

      if (insertError.code === "23505") {
        alert("That invoice number already exists.");
      } else {
        alert(`Could not create payment request: ${insertError.message}`);
      }

      setPaymentSaving(false);
      return;
    }

    setPaymentSaving(false);
    setShowPaymentForm(false);

    alert("Payment request created successfully.");

    await loadPayments();
  };

  const updatePaymentStatus = async (paymentId, newStatus) => {
    const updateData = {
      verification_status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "Verified") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      updateData.verified_at = new Date().toISOString();
      updateData.receipt_reference =
        `RCT-${String(paymentId).padStart(6, "0")}`;

      if (user) {
        updateData.verified_by = user.id;
      }
    }

    const { error: updateError } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", paymentId);

    if (updateError) {
      console.error(updateError);
      alert(`Could not update payment: ${updateError.message}`);
      return;
    }

    await loadPayments();
  };

  const viewPaymentProof = async (payment) => {
    if (!payment.payment_proof_url) {
      alert("No payment proof has been submitted for this payment.");
      return;
    }

    const { data, error: signedUrlError } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(payment.payment_proof_url, 60);

    if (signedUrlError || !data?.signedUrl) {
      console.error(signedUrlError);
      alert("Could not securely open the payment proof.");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const getStudentName = (studentId) => {
    const student = students.find(
      (studentItem) => studentItem.id === studentId
    );

    return student ? student.name : studentId;
  };

  const getStatusClass = (status) => {
    if (status === "Verified") return "paid";
    return "pending";
  };

  const totalVerified = payments
    .filter((payment) => payment.verification_status === "Verified")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const pendingPayments = payments.filter(
    (payment) =>
      payment.verification_status === "Pending" ||
      payment.verification_status === "Under Review"
  ).length;

  // =========================
  // ADMIN DOCUMENT MANAGEMENT
  // =========================

  const openAddDocument = () => {
    setDocumentForm({
      student_id: "",
      document_name: "",
      document_type: "",
    });

    setSelectedDocumentFile(null);
    setDocumentFileInputKey((previous) => previous + 1);
    setShowDocumentForm(true);
  };

  const handleDocumentFormChange = (event) => {
    const { name, value } = event.target;

    setDocumentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleDocumentFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedDocumentFile(file);
  };

  const handleDocumentUpload = async (event) => {
    event.preventDefault();

    if (
      !documentForm.student_id ||
      !documentForm.document_name.trim() ||
      !selectedDocumentFile
    ) {
      alert("Please select a student, enter a document name and choose a file.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedDocumentFile.type)) {
      alert("Only PDF, JPG, JPEG and PNG files are allowed.");
      return;
    }

    const maxFileSize = 10 * 1024 * 1024;

    if (selectedDocumentFile.size > maxFileSize) {
      alert("The file is too large. Maximum allowed size is 10 MB.");
      return;
    }

    setDocumentUploading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(userError);
      alert("Could not verify the signed-in administrator.");
      setDocumentUploading(false);
      return;
    }

    const safeFileName = selectedDocumentFile.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");

    const filePath =
      `${documentForm.student_id}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("student-documents")
      .upload(filePath, selectedDocumentFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: selectedDocumentFile.type,
      });

    if (uploadError) {
      console.error(uploadError);
      alert(`Could not upload file: ${uploadError.message}`);
      setDocumentUploading(false);
      return;
    }

    const documentType =
      documentForm.document_type.trim() ||
      (selectedDocumentFile.type === "application/pdf"
        ? "PDF"
        : "Image");

    const { error: insertError } = await supabase
      .from("documents")
      .insert([
        {
          student_id: documentForm.student_id,
          document_name: documentForm.document_name.trim(),
          document_type: documentType,
          file_path: filePath,
          uploaded_by: user.id,
          is_active: true,
        },
      ]);

    if (insertError) {
      console.error(insertError);

      await supabase.storage
        .from("student-documents")
        .remove([filePath]);

      alert(`Could not save document record: ${insertError.message}`);
      setDocumentUploading(false);
      return;
    }

    setDocumentUploading(false);
    setShowDocumentForm(false);
    setSelectedDocumentFile(null);
    setDocumentFileInputKey((previous) => previous + 1);

    alert("Document uploaded successfully.");

    await loadDocuments();
  };

  const viewAdminDocument = async (documentRecord) => {
    const { data, error: signedUrlError } = await supabase.storage
      .from("student-documents")
      .createSignedUrl(documentRecord.file_path, 60);

    if (signedUrlError || !data?.signedUrl) {
      console.error(signedUrlError);
      alert("Could not securely open this document.");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  // =========================
  // STUDENT PAYMENT PROOF
  // =========================

  const openPaymentProofForm = (payment) => {
    setSelectedProofPaymentId(payment.id);
    setPaymentProofReference(payment.transaction_reference || "");
    setSelectedPaymentProofFile(null);
    setPaymentProofFileInputKey((previous) => previous + 1);
  };

  const closePaymentProofForm = () => {
    setSelectedProofPaymentId(null);
    setPaymentProofReference("");
    setSelectedPaymentProofFile(null);
    setPaymentProofFileInputKey((previous) => previous + 1);
  };

  const handlePaymentProofSubmit = async (event, payment) => {
    event.preventDefault();

    if (!studentRecord) {
      alert("Could not identify the signed-in student.");
      return;
    }

    if (!paymentProofReference.trim()) {
      alert("Please enter the transaction/reference number.");
      return;
    }

    if (!selectedPaymentProofFile) {
      alert("Please choose a payment proof file.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedPaymentProofFile.type)) {
      alert("Only PDF, JPG, JPEG and PNG files are allowed.");
      return;
    }

    const maxFileSize = 10 * 1024 * 1024;

    if (selectedPaymentProofFile.size > maxFileSize) {
      alert("The file is too large. Maximum allowed size is 10 MB.");
      return;
    }

    setPaymentProofUploading(true);

    const safeFileName = selectedPaymentProofFile.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");

    const safeInvoiceNumber = String(payment.invoice_number || "invoice")
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    const filePath =
      `${studentRecord.student_id}/${safeInvoiceNumber}/` +
      `${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, selectedPaymentProofFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: selectedPaymentProofFile.type,
      });

    if (uploadError) {
      console.error(uploadError);
      alert(`Could not upload payment proof: ${uploadError.message}`);
      setPaymentProofUploading(false);
      return;
    }

    const { error: submitError } = await supabase.rpc(
      "submit_payment_proof",
      {
        p_payment_id: payment.id,
        p_transaction_reference: paymentProofReference.trim(),
        p_payment_proof_url: filePath,
      }
    );

    if (submitError) {
      console.error(submitError);
      alert(
        `The file uploaded, but the payment record could not be submitted: ${submitError.message}`
      );
      setPaymentProofUploading(false);
      return;
    }

    alert("Payment proof submitted successfully. It is now under review.");

    setPaymentProofUploading(false);
    closePaymentProofForm();
    await loadStudentPortalData();
  };

  // =========================
  // STUDENT PORTAL HELPERS
  // =========================

  const viewStudentDocument = async (documentRecord) => {
    const { data, error: signedUrlError } = await supabase.storage
      .from("student-documents")
      .createSignedUrl(documentRecord.file_path, 60);

    if (signedUrlError || !data?.signedUrl) {
      console.error(signedUrlError);
      alert("Could not securely open this document.");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const downloadReceipt = (payment) => {
    if (!studentRecord || payment.verification_status !== "Verified") {
      alert("A receipt is only available for a verified payment.");
      return;
    }

    const receiptReference =
      payment.receipt_reference ||
      `RCT-${String(payment.id).padStart(6, "0")}`;

    const paymentDate = payment.payment_date
      ? new Date(payment.payment_date).toLocaleDateString()
      : "Verified payment";

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 14;
    const cardX = 14;
    const cardY = 14;
    const cardW = pageWidth - 28;
    const cardH = pageHeight - 28;

    const navy = [11, 31, 58];
    const blue = [47, 107, 255];
    const lightBlue = [238, 244, 255];
    const lightGray = [247, 249, 252];
    const lineGray = [217, 226, 240];
    const muted = [107, 122, 144];
    const green = [30, 158, 98];
    const lightGreen = [234, 248, 241];

    doc.setFillColor(...lightGray);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX, cardY, cardW, cardH, 5, 5, "F");

    doc.setFillColor(...navy);
    doc.roundedRect(cardX, cardY, cardW, 37, 5, 5, "F");
    doc.rect(cardX, cardY + 27, cardW, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AVA Education Services", cardX + 9, cardY + 14);

    doc.setTextColor(191, 208, 255);
    doc.setFontSize(11);
    doc.text("Payment Receipt", cardX + 9, cardY + 23);

    doc.setFillColor(...lightGreen);
    doc.roundedRect(pageWidth - margin - 34, cardY + 10, 25, 9, 4, 4, "F");
    doc.setTextColor(...green);
    doc.setFontSize(8);
    doc.text("VERIFIED", pageWidth - margin - 21.5, cardY + 16, {
      align: "center",
    });

    const metaTop = cardY + 51;
    const colWidth = (cardW - 18) / 3;
    const metaRows = [
      ["RECEIPT REFERENCE", receiptReference],
      ["INVOICE NUMBER", payment.invoice_number || "-"],
      ["PAYMENT DATE", paymentDate],
    ];

    metaRows.forEach(([label, value], index) => {
      const x = cardX + 9 + index * colWidth;

      doc.setTextColor(...muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(label, x, metaTop);

      doc.setTextColor(...navy);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(String(value), x, metaTop + 6);
    });

    doc.setDrawColor(...lineGray);
    doc.line(cardX + 9, metaTop + 13, cardX + cardW - 9, metaTop + 13);

    const studentTitleY = metaTop + 24;

    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Student Details", cardX + 9, studentTitleY);

    const studentBoxY = studentTitleY + 7;
    doc.setFillColor(...lightBlue);
    doc.roundedRect(cardX + 9, studentBoxY, cardW - 18, 33, 3, 3, "F");

    const studentDetails = [
      ["Student Name", studentRecord.full_name || "-"],
      ["Student ID", studentRecord.student_id || "-"],
      ["Program", studentRecord.course_or_program || "-"],
      ["Intake", studentRecord.intake || "-"],
    ];

    studentDetails.forEach(([label, value], index) => {
      const leftColumn = index < 2;
      const x = leftColumn ? cardX + 14 : cardX + cardW / 2 + 4;
      const row = index % 2;
      const y = studentBoxY + 10 + row * 13;

      doc.setTextColor(...muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(label, x, y);

      doc.setTextColor(...navy);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      const wrapped = doc.splitTextToSize(String(value), 72);
      doc.text(wrapped, x, y + 5);
    });

    const paymentTitleY = studentBoxY + 46;

    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Payment Details", cardX + 9, paymentTitleY);

    const detailRows = [
      ["Description", payment.description || "Student Payment"],
      ["Amount", `RMB ${Number(payment.amount || 0).toLocaleString()}`],
      ["Payment Method", payment.payment_method || "WeChat QR"],
      ["Transaction Reference", payment.transaction_reference || "-"],
    ];

    let rowY = paymentTitleY + 8;

    detailRows.forEach(([label, value], index) => {
      if (index % 2 === 0) {
        doc.setFillColor(251, 252, 254);
        doc.rect(cardX + 9, rowY, cardW - 18, 11, "F");
      }

      doc.setTextColor(...muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(label, cardX + 13, rowY + 7);

      doc.setTextColor(...navy);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(
        String(value),
        cardX + cardW - 13,
        rowY + 7,
        { align: "right" }
      );

      rowY += 11;
    });

    const totalY = rowY + 7;

    doc.setFillColor(...navy);
    doc.roundedRect(cardX + 9, totalY, cardW - 18, 16, 3, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("TOTAL PAID", cardX + 14, totalY + 10);

    doc.setFontSize(14);
    doc.text(
      `RMB ${Number(payment.amount || 0).toLocaleString()}`,
      cardX + cardW - 14,
      totalY + 10,
      { align: "right" }
    );

    doc.setTextColor(...muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "This receipt was generated electronically after payment verification.",
      cardX + 9,
      totalY + 29
    );
    doc.text(
      "Keep this receipt for your records.",
      cardX + 9,
      totalY + 35
    );

    const footerY = pageHeight - 24;
    doc.setDrawColor(...lineGray);
    doc.line(cardX + 9, footerY - 7, cardX + cardW - 9, footerY - 7);

    doc.setTextColor(...muted);
    doc.setFontSize(7.5);
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      cardX + 9,
      footerY
    );
    doc.text(
      "AVA Education Services",
      cardX + cardW - 9,
      footerY,
      { align: "right" }
    );

    const safeInvoice = String(payment.invoice_number || "receipt")
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    doc.save(`${receiptReference}_${safeInvoice}.pdf`);
  };

  const getStudentDisplayName = (fullName) => {
    const parts = String(fullName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) return "Student";
    if (parts.length === 1) return parts[0];

    return `${parts[0]} ${parts[parts.length - 1]}`;
  };

  const studentTotalInvoiced = studentPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  const studentVerifiedAmount = studentPayments
    .filter((payment) => payment.verification_status === "Verified")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const studentOutstandingAmount = studentPayments
    .filter((payment) => payment.verification_status !== "Verified")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const studentVerifiedPayments = studentPayments.filter(
    (payment) => payment.verification_status === "Verified"
  );

  if (!authReady) {
    return (
      <div className="portal-page">
        <div className="login-card">
          <div className="portal-badge">AVA STUDENT PORTAL</div>
          <h1>Loading Portal</h1>
          <p className="subtitle">
            Restoring your secure session...
          </p>
        </div>
      </div>
    );
  }

  if (passwordRecoveryMode) {
    return (
      <div className="portal-page">
        <div className="login-card">
          <div className="portal-badge">AVA STUDENT PORTAL</div>

          <h1>Set New Password</h1>

          <p className="subtitle">
            Enter a new password for your portal account.
          </p>

          <form onSubmit={handlePasswordUpdate}>
            <label>New Password</label>

            <input
              type="password"
              placeholder="Enter at least 8 characters"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              autoComplete="new-password"
            />

            <label>Confirm New Password</label>

            <input
              type="password"
              placeholder="Enter the new password again"
              value={confirmNewPassword}
              onChange={(event) =>
                setConfirmNewPassword(event.target.value)
              }
              autoComplete="new-password"
            />

            {passwordRecoveryError && (
              <p
                style={{
                  color: "red",
                  fontSize: "14px",
                }}
              >
                {passwordRecoveryError}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordUpdateLoading}
            >
              {passwordUpdateLoading
                ? "Updating Password..."
                : "Update Password"}
            </button>
          </form>

          <p className="security-note">
            Your password will be updated securely through Supabase Authentication.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ADMIN PORTAL
  // ============================================================

  if (loggedIn && userRole === "admin") {
    return (
      <div className="dashboard-page">
        <aside className="sidebar">
          <div>
            <div className="portal-badge">ADMIN PORTAL</div>

            <div className="student-mini-profile">
              <h2>Administrator</h2>
              <p>{username}</p>
            </div>

            <nav className="sidebar-menu">
              <button
                className={`menu-item ${
                  activePage === "admin-dashboard" ? "active" : ""
                }`}
                onClick={() => setActivePage("admin-dashboard")}
              >
                Dashboard
              </button>

              <button
                className={`menu-item ${
                  activePage === "admin-students" ? "active" : ""
                }`}
                onClick={() => setActivePage("admin-students")}
              >
                Students
              </button>

              <button
                className={`menu-item ${
                  activePage === "admin-payments" ? "active" : ""
                }`}
                onClick={() => setActivePage("admin-payments")}
              >
                Payments
              </button>

              <button
                className={`menu-item ${
                  activePage === "admin-documents" ? "active" : ""
                }`}
                onClick={() => setActivePage("admin-documents")}
              >
                Documents
              </button>
            </nav>
          </div>

          <button
            className="signout-button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </aside>

        <main className="dashboard-content">

          {/* ================= ADMIN STUDENTS ================= */}

          {activePage === "admin-students" ? (
            <>
              <div className="dashboard-header">
                <div>
                  <p className="welcome-small">Administration</p>
                  <h1>Student Management</h1>
                </div>

                <button onClick={openAddStudent}>
                  Add Student
                </button>
              </div>

              <div className="dashboard-section">
                <p className="section-label">Student Records</p>
                <h2>Students</h2>

                <input
                  type="text"
                  placeholder="Search by ID, name, email or program..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  style={{
                    width: "100%",
                    marginBottom: "20px",
                  }}
                />

                {studentsLoading && (
                  <p>Loading students from database...</p>
                )}

                {studentsError && (
                  <p style={{ color: "red" }}>
                    {studentsError}
                  </p>
                )}

                {!studentsLoading &&
                  !studentsError &&
                  filteredStudents.length > 0 && (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Program</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredStudents.map((student) => (
                            <tr key={student.dbId}>
                              <td>{student.id}</td>
                              <td>{student.name}</td>
                              <td>{student.email}</td>
                              <td>{student.program}</td>

                              <td>
                                <span
                                  className={`status ${
                                    student.status === "Active"
                                      ? "paid"
                                      : "pending"
                                  }`}
                                >
                                  {student.status}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`status ${
                                    student.payment === "Paid"
                                      ? "paid"
                                      : "pending"
                                  }`}
                                >
                                  {student.payment}
                                </span>
                              </td>

                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <button
                                    className="small-button"
                                    onClick={() =>
                                      openEditStudent(student)
                                    }
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    className="small-button"
                                    onClick={() =>
                                      openDeleteStudent(student)
                                    }
                                    style={{
                                      background: "#b42318",
                                      color: "#ffffff",
                                      borderColor: "#b42318",
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                {!studentsLoading &&
                  !studentsError &&
                  filteredStudents.length === 0 && (
                    <p>No students found.</p>
                  )}
              </div>

              {showStudentForm && (
                <div className="dashboard-section">
                  <p className="section-label">
                    {editingStudentId
                      ? "Edit Student"
                      : "New Student"}
                  </p>

                  <h2>
                    {editingStudentId
                      ? "Update Student Details"
                      : "Add Student"}
                  </h2>

                  <form onSubmit={handleStudentSubmit}>
                    <label>Student ID</label>

                    <input
                      type="text"
                      name="id"
                      value={studentForm.id}
                      onChange={handleStudentFormChange}
                      disabled={Boolean(editingStudentId)}
                    />

                    <label>Full Name</label>

                    <input
                      type="text"
                      name="name"
                      value={studentForm.name}
                      onChange={handleStudentFormChange}
                    />

                    <label>Email</label>

                    <input
                      type="email"
                      name="email"
                      value={studentForm.email}
                      onChange={handleStudentFormChange}
                    />

                    {!editingStudentId && (
                      <>
                        <label>Temporary Password</label>

                        <input
                          type="password"
                          name="temporary_password"
                          value={studentForm.temporary_password}
                          onChange={handleStudentFormChange}
                          placeholder="Minimum 8 characters"
                          autoComplete="new-password"
                        />
                      </>
                    )}

                    <label>Phone Number</label>

                    <input
                      type="text"
                      name="phone"
                      value={studentForm.phone}
                      onChange={handleStudentFormChange}
                    />

                    <label>Program</label>

                    <input
                      type="text"
                      name="program"
                      value={studentForm.program}
                      onChange={handleStudentFormChange}
                    />

                    <label>Intake</label>

                    <input
                      type="text"
                      name="intake"
                      value={studentForm.intake}
                      onChange={handleStudentFormChange}
                    />

                    <label>Enrollment Status</label>

                    <select
                      name="status"
                      value={studentForm.status}
                      onChange={handleStudentFormChange}
                      style={{
                        padding: "14px",
                        marginBottom: "18px",
                        borderRadius: "12px",
                        border: "1px solid #d8deea",
                      }}
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>

                    <label>Payment Status</label>

                    <select
                      name="payment"
                      value={studentForm.payment}
                      onChange={handleStudentFormChange}
                      style={{
                        padding: "14px",
                        marginBottom: "18px",
                        borderRadius: "12px",
                        border: "1px solid #d8deea",
                      }}
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Paid">
                        Paid
                      </option>
                    </select>

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                      }}
                    >
                      <button
                        type="submit"
                        disabled={studentSaving}
                      >
                        {studentSaving
                          ? "Saving..."
                          : editingStudentId
                          ? "Save Changes"
                          : "Add Student"}
                      </button>

                      <button
                        type="button"
                        className="signout-button"
                        onClick={() =>
                          setShowStudentForm(false)
                        }
                        disabled={studentSaving}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {deleteStudentTarget && (
                <div className="dashboard-section">
                  <p className="section-label">
                    Permanent Student Deletion
                  </p>

                  <h2>Delete Student</h2>

                  <p>
                    You are about to permanently delete{" "}
                    <strong>{deleteStudentTarget.name}</strong>{" "}
                    ({deleteStudentTarget.id}).
                  </p>

                  <p
                    style={{
                      color: "#b42318",
                      fontWeight: "600",
                      marginBottom: "20px",
                    }}
                  >
                    This action cannot be undone. The student account and linked
                    portal records will be removed.
                  </p>

                  <form onSubmit={handleDeleteStudent}>
                    <label>Administrator Password</label>

                    <input
                      type="password"
                      value={adminDeletePassword}
                      onChange={(event) =>
                        setAdminDeletePassword(event.target.value)
                      }
                      placeholder="Enter your admin password"
                      autoComplete="current-password"
                      disabled={studentDeleting}
                    />

                    <label>Confirm Administrator Password</label>

                    <input
                      type="password"
                      value={confirmAdminDeletePassword}
                      onChange={(event) =>
                        setConfirmAdminDeletePassword(event.target.value)
                      }
                      placeholder="Enter the same admin password again"
                      autoComplete="current-password"
                      disabled={studentDeleting}
                    />

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="submit"
                        disabled={studentDeleting}
                        style={{
                          background: "#b42318",
                          borderColor: "#b42318",
                        }}
                      >
                        {studentDeleting
                          ? "Deleting..."
                          : "Permanently Delete Student"}
                      </button>

                      <button
                        type="button"
                        className="signout-button"
                        onClick={closeDeleteStudent}
                        disabled={studentDeleting}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>

          /* ================= ADMIN PAYMENTS ================= */

          ) : activePage === "admin-payments" ? (
            <>
              <div className="dashboard-header">
                <div>
                  <p className="welcome-small">
                    Financial Administration
                  </p>

                  <h1>Payments</h1>
                </div>

                <button onClick={openAddPayment}>
                  Create Payment Request
                </button>
              </div>

              <div className="summary-grid">
                <div className="summary-card">
                  <p className="card-label">
                    Total Payment Records
                  </p>

                  <h3>{payments.length}</h3>

                  <p className="card-note">
                    All invoices
                  </p>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Pending Review
                  </p>

                  <h3>{pendingPayments}</h3>

                  <p className="card-note">
                    Awaiting confirmation
                  </p>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Verified Payments
                  </p>

                  <h3>
                    {
                      payments.filter(
                        (payment) =>
                          payment.verification_status ===
                          "Verified"
                      ).length
                    }
                  </h3>

                  <p className="card-note">
                    Confirmed transactions
                  </p>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Verified Amount
                  </p>

                  <h3>
                    RMB{" "}
                    {totalVerified.toLocaleString()}
                  </h3>

                  <p className="card-note">
                    Confirmed total
                  </p>
                </div>
              </div>

              {showPaymentForm && (
                <div className="dashboard-section">
                  <p className="section-label">
                    New Payment Request
                  </p>

                  <h2>Create Invoice</h2>

                  <form onSubmit={handlePaymentSubmit}>
                    <label>Student</label>

                    <select
                      name="student_id"
                      value={paymentForm.student_id}
                      onChange={handlePaymentFormChange}
                      style={{
                        padding: "14px",
                        marginBottom: "18px",
                        borderRadius: "12px",
                        border: "1px solid #d8deea",
                      }}
                    >
                      <option value="">
                        Select Student
                      </option>

                      {students.map((student) => (
                        <option
                          key={student.dbId}
                          value={student.id}
                        >
                          {student.id} - {student.name}
                        </option>
                      ))}
                    </select>

                    <label>Invoice Number</label>

                    <input
                      type="text"
                      name="invoice_number"
                      value={paymentForm.invoice_number}
                      onChange={handlePaymentFormChange}
                      placeholder="Example: INV-1005"
                    />

                    <label>Description</label>

                    <input
                      type="text"
                      name="description"
                      value={paymentForm.description}
                      onChange={handlePaymentFormChange}
                      placeholder="Example: Course Fee"
                    />

                    <label>Amount (RMB)</label>

                    <input
                      type="text"
                      name="amount"
                      value={paymentForm.amount}
                      onChange={handlePaymentFormChange}
                      placeholder="Example: 120000"
                    />

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                      }}
                    >
                      <button
                        type="submit"
                        disabled={paymentSaving}
                      >
                        {paymentSaving
                          ? "Creating..."
                          : "Create Payment Request"}
                      </button>

                      <button
                        type="button"
                        className="signout-button"
                        onClick={() =>
                          setShowPaymentForm(false)
                        }
                        disabled={paymentSaving}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="dashboard-section">
                <p className="section-label">
                  QR Payment Records
                </p>

                <h2>Invoices & Payments</h2>

                {paymentsLoading && (
                  <p>Loading payment records...</p>
                )}

                {paymentsError && (
                  <p style={{ color: "red" }}>
                    {paymentsError}
                  </p>
                )}

                {!paymentsLoading &&
                  !paymentsError &&
                  payments.length === 0 && (
                    <p>
                      No payment records have been
                      created yet.
                    </p>
                  )}

                {!paymentsLoading &&
                  !paymentsError &&
                  payments.length > 0 && (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Invoice</th>
                            <th>Student</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Reference</th>
                            <th>Proof</th>
                            <th>Status</th>
                            <th>Verification</th>
                          </tr>
                        </thead>

                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td>
                                {payment.invoice_number}
                              </td>

                              <td>
                                <strong>
                                  {getStudentName(
                                    payment.student_id
                                  )}
                                </strong>

                                <br />

                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#8a94a8",
                                  }}
                                >
                                  {payment.student_id}
                                </span>
                              </td>

                              <td>
                                RMB{" "}
                                {Number(
                                  payment.amount
                                ).toLocaleString()}
                              </td>

                              <td>
                                {payment.payment_method}
                              </td>

                              <td>
                                {payment.transaction_reference ||
                                  "Not submitted"}
                              </td>

                              <td>
                                {payment.payment_proof_url ? (
                                  <button
                                    className="small-button"
                                    onClick={() =>
                                      viewPaymentProof(payment)
                                    }
                                  >
                                    View Proof
                                  </button>
                                ) : (
                                  "Not submitted"
                                )}
                              </td>

                              <td>
                                <span
                                  className={`status ${getStatusClass(
                                    payment.verification_status
                                  )}`}
                                >
                                  {
                                    payment.verification_status
                                  }
                                </span>
                              </td>

                              <td>
                                <select
                                  value={
                                    payment.verification_status
                                  }
                                  onChange={(event) =>
                                    updatePaymentStatus(
                                      payment.id,
                                      event.target.value
                                    )
                                  }
                                  style={{
                                    padding: "8px",
                                    borderRadius: "8px",
                                    border:
                                      "1px solid #d8deea",
                                  }}
                                >
                                  <option value="Pending">
                                    Pending
                                  </option>

                                  <option value="Under Review">
                                    Under Review
                                  </option>

                                  <option value="Verified">
                                    Verified
                                  </option>

                                  <option value="Rejected">
                                    Rejected
                                  </option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>

              <div className="dashboard-section">
                <p className="section-label">
                  Payment QR Settings
                </p>

                <h2>WeChat Payment QR</h2>

                <p
                  style={{
                    color: "#6b7280",
                    marginBottom: "18px",
                  }}
                >
                  Upload or replace the QR shown to every student. Changes here
                  are shared automatically across all student payment pages.
                </p>

                {wechatQrUrl && (
                  <div
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <img
                      src={wechatQrUrl}
                      alt="Current WeChat payment QR"
                      style={{
                        width: "220px",
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "16px",
                        border: "1px solid #d8deea",
                        background: "#ffffff",
                        padding: "10px",
                      }}
                    />
                  </div>
                )}

                <form onSubmit={handleWechatQrUpload}>
                  <label>
                    {wechatQrPath
                      ? "Replace WeChat QR"
                      : "Upload WeChat QR"}
                  </label>

                  <input
                    key={wechatQrFileInputKey}
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleWechatQrFileChange}
                    disabled={wechatQrUploading}
                  />

                  <p
                    style={{
                      fontSize: "13px",
                      color: "#8a94a8",
                      marginTop: "-8px",
                      marginBottom: "18px",
                    }}
                  >
                    JPG, JPEG or PNG. Maximum size: 5 MB.
                  </p>

                  <button
                    type="submit"
                    disabled={wechatQrUploading}
                  >
                    {wechatQrUploading
                      ? "Updating QR..."
                      : wechatQrPath
                      ? "Replace QR"
                      : "Upload QR"}
                  </button>
                </form>
              </div>

              <div className="dashboard-section">
                <p className="section-label">
                  Payment Method
                </p>

                <h2>WeChat QR Workflow</h2>

                <div className="detail-row">
                  <span>Payment Method</span>
                  <strong>WeChat QR</strong>
                </div>

                <div className="detail-row">
                  <span>Payment Processing</span>
                  <strong>
                    External to this portal
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Verification</span>
                  <strong>
                    Manual admin confirmation
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Receipt</span>
                  <strong>
                    Generated after verification
                  </strong>
                </div>
              </div>
            </>

          /* ================= ADMIN DOCUMENTS ================= */

          ) : activePage === "admin-documents" ? (
            <>
              <div className="dashboard-header">
                <div>
                  <p className="welcome-small">
                    Student File Administration
                  </p>

                  <h1>Documents</h1>
                </div>

                <button onClick={openAddDocument}>
                  Upload Document
                </button>
              </div>

              <div className="summary-grid">
                <div className="summary-card">
                  <p className="card-label">
                    Total Documents
                  </p>

                  <h3>{documents.length}</h3>

                  <p className="card-note">
                    Active private files
                  </p>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Students With Files
                  </p>

                  <h3>
                    {
                      new Set(
                        documents.map(
                          (documentRecord) =>
                            documentRecord.student_id
                        )
                      ).size
                    }
                  </h3>

                  <p className="card-note">
                    Student records
                  </p>
                </div>
              </div>

              {showDocumentForm && (
                <div className="dashboard-section">
                  <p className="section-label">
                    Private Student Document
                  </p>

                  <h2>Upload Document</h2>

                  <form onSubmit={handleDocumentUpload}>
                    <label>Student</label>

                    <select
                      name="student_id"
                      value={documentForm.student_id}
                      onChange={handleDocumentFormChange}
                      style={{
                        padding: "14px",
                        marginBottom: "18px",
                        borderRadius: "12px",
                        border: "1px solid #d8deea",
                      }}
                    >
                      <option value="">
                        Select Student
                      </option>

                      {students.map((student) => (
                        <option
                          key={student.dbId}
                          value={student.id}
                        >
                          {student.id} - {student.name}
                        </option>
                      ))}
                    </select>

                    <label>Document Name</label>

                    <input
                      type="text"
                      name="document_name"
                      value={documentForm.document_name}
                      onChange={handleDocumentFormChange}
                      placeholder="Example: Admission Letter"
                    />

                    <label>Document Type</label>

                    <input
                      type="text"
                      name="document_type"
                      value={documentForm.document_type}
                      onChange={handleDocumentFormChange}
                      placeholder="Example: Academic"
                    />

                    <label>File</label>

                    <input
                      key={documentFileInputKey}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={handleDocumentFileChange}
                    />

                    <p
                      style={{
                        fontSize: "13px",
                        color: "#8a94a8",
                        marginTop: "-8px",
                        marginBottom: "18px",
                      }}
                    >
                      Allowed: PDF, JPG, JPEG and PNG. Maximum size: 10 MB.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                      }}
                    >
                      <button
                        type="submit"
                        disabled={documentUploading}
                      >
                        {documentUploading
                          ? "Uploading..."
                          : "Upload Document"}
                      </button>

                      <button
                        type="button"
                        className="signout-button"
                        onClick={() => {
                          setShowDocumentForm(false);
                          setSelectedDocumentFile(null);
                          setDocumentFileInputKey(
                            (previous) => previous + 1
                          );
                        }}
                        disabled={documentUploading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="dashboard-section">
                <p className="section-label">
                  Private Storage
                </p>

                <h2>Student Documents</h2>

                {documentsLoading && (
                  <p>Loading documents...</p>
                )}

                {documentsError && (
                  <p style={{ color: "red" }}>
                    {documentsError}
                  </p>
                )}

                {!documentsLoading &&
                  !documentsError &&
                  documents.length === 0 && (
                    <p>No documents have been uploaded yet.</p>
                  )}

                {!documentsLoading &&
                  !documentsError &&
                  documents.length > 0 && (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Document</th>
                            <th>Type</th>
                            <th>Uploaded</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {documents.map((documentRecord) => (
                            <tr key={documentRecord.id}>
                              <td>
                                <strong>
                                  {getStudentName(
                                    documentRecord.student_id
                                  )}
                                </strong>

                                <br />

                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#8a94a8",
                                  }}
                                >
                                  {documentRecord.student_id}
                                </span>
                              </td>

                              <td>
                                {documentRecord.document_name}
                              </td>

                              <td>
                                {documentRecord.document_type ||
                                  "Document"}
                              </td>

                              <td>
                                {documentRecord.uploaded_at
                                  ? new Date(
                                      documentRecord.uploaded_at
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>

                              <td>
                                <button
                                  className="small-button"
                                  onClick={() =>
                                    viewAdminDocument(
                                      documentRecord
                                    )
                                  }
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            </>

          /* ================= ADMIN DASHBOARD ================= */

          ) : (
            <>
              <div className="dashboard-header">
                <div>
                  <p className="welcome-small">
                    Administration
                  </p>

                  <h1>Admin Dashboard</h1>
                </div>

                <div className="student-id-box">
                  Secure Admin Account
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-card">
                  <p className="card-label">
                    Total Students
                  </p>

                  <h3>{students.length}</h3>

                  <p className="card-note">
                    Database records
                  </p>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Active Students
                  </p>

                  <h3>
                    {
                      students.filter(
                        (student) =>
                          student.status === "Active"
                      ).length
                    }
                  </h3>

                  <p className="card-note">
                    Currently active
                  </p>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Pending Payments
                  </p>

                  <h3>{pendingPayments}</h3>

                  <p className="card-note">
                    Payment records awaiting review
                  </p>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Total Collected
                  </p>

                  <h3>
                    RMB {totalVerified.toLocaleString()}
                  </h3>

                  <p className="card-note">
                    Verified payment total
                  </p>
                </div>
              </div>

              <div className="dashboard-section">
                <p className="section-label">
                  Student Management
                </p>

                <h2>Recent Students</h2>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Program</th>
                        <th>Status</th>
                        <th>Payment</th>
                      </tr>
                    </thead>

                    <tbody>
                      {students.map((student) => (
                        <tr key={student.dbId}>
                          <td>{student.id}</td>
                          <td>{student.name}</td>
                          <td>{student.program}</td>

                          <td>
                            <span
                              className={`status ${
                                student.status === "Active"
                                  ? "paid"
                                  : "pending"
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status ${
                                student.payment === "Paid"
                                  ? "paid"
                                  : "pending"
                              }`}
                            >
                              {student.payment}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // ============================================================
  // STUDENT PORTAL
  // ============================================================

  if (loggedIn && userRole === "student") {
    if (studentDataLoading || !studentRecord) {
      return (
        <div className="portal-page">
          <div className="login-card">
            <div className="portal-badge">AVA STUDENT PORTAL</div>
            <h1>
              {studentDataError ? "Unable to Load Account" : "Loading Portal"}
            </h1>

            <p className="subtitle">
              {studentDataError ||
                "Loading your student information securely..."}
            </p>

            {studentDataError && (
              <button onClick={handleLogout}>
                Sign Out
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-page">
        <aside className="sidebar">
          <div>
            <div className="portal-badge">
              AVA STUDENT PORTAL
            </div>

            <div className="student-mini-profile">
              <h2>{getStudentDisplayName(studentRecord.full_name)}</h2>
              <p>{studentRecord.student_id}</p>
            </div>

            <nav className="sidebar-menu">
              <button
                className={`menu-item ${
                  activePage === "dashboard" ? "active" : ""
                }`}
                onClick={() => setActivePage("dashboard")}
              >
                Dashboard
              </button>

              <button
                className={`menu-item ${
                  activePage === "profile" ? "active" : ""
                }`}
                onClick={() => setActivePage("profile")}
              >
                Profile
              </button>

              <button
                className={`menu-item ${
                  activePage === "course" ? "active" : ""
                }`}
                onClick={() => setActivePage("course")}
              >
                Course Details
              </button>

              <button
                className={`menu-item ${
                  activePage === "payments" ? "active" : ""
                }`}
                onClick={() => setActivePage("payments")}
              >
                Payments
              </button>

              <button
                className={`menu-item ${
                  activePage === "receipts" ? "active" : ""
                }`}
                onClick={() => setActivePage("receipts")}
              >
                Receipts
              </button>

              <button
                className={`menu-item ${
                  activePage === "documents" ? "active" : ""
                }`}
                onClick={() => setActivePage("documents")}
              >
                Documents
              </button>
            </nav>
          </div>

          <button
            className="signout-button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </aside>

        <main className="dashboard-content student-dashboard-content">

          {activePage === "profile" ? (
            <>
              <div className="dashboard-header">
                <div>
                  <p className="welcome-small">
                    Student Information
                  </p>

                  <h1>My Profile</h1>
                </div>

                <div className="student-id-box">
                  Student ID: {studentRecord.student_id}
                </div>
              </div>

              <div className="dashboard-section">
                <p className="section-label">
                  Personal Details
                </p>

                <h2>Student Profile</h2>

                <div className="detail-row">
                  <span>Full Name</span>
                  <strong>{studentRecord.full_name || "-"}</strong>
                </div>

                <div className="detail-row">
                  <span>Student ID</span>
                  <strong>{studentRecord.student_id}</strong>
                </div>

                <div className="detail-row">
                  <span>Email</span>
                  <strong>{studentRecord.email || "-"}</strong>
                </div>

                <div className="detail-row">
                  <span>Phone</span>
                  <strong>{studentRecord.phone || "-"}</strong>
                </div>

                <div className="detail-row">
                  <span>NIC / Passport</span>
                  <strong>{studentRecord.nic_or_passport || "-"}</strong>
                </div>

                <div className="detail-row">
                  <span>Address</span>
                  <strong>{studentRecord.address || "-"}</strong>
                </div>
              </div>

              <div className="dashboard-section">
                <p className="section-label">
                  Guardian Information
                </p>

                <h2>Guardian Details</h2>

                <div className="detail-row">
                  <span>Guardian Name</span>
                  <strong>{studentRecord.guardian_name || "-"}</strong>
                </div>

                <div className="detail-row">
                  <span>Guardian Contact</span>
                  <strong>{studentRecord.guardian_contact || "-"}</strong>
                </div>
              </div>
            </>
          ) : activePage === "course" ? (
            <>
              <div className="dashboard-header">
                <div>
                  <p className="welcome-small">
                    Academic Information
                  </p>

                  <h1>Course Details</h1>
                </div>

                <div className="student-id-box">
                  Student ID: {studentRecord.student_id}
                </div>
              </div>

              <div className="dashboard-section">
                <p className="section-label">Program</p>

                <h2>Current Enrollment</h2>

                <div className="detail-row">
                  <span>Program Name</span>
                  <strong>
                    {studentRecord.course_or_program || "-"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Intake</span>
                  <strong>{studentRecord.intake || "-"}</strong>
                </div>

                <div className="detail-row">
                  <span>Enrollment Status</span>
                  <strong>
                    {studentRecord.enrollment_status || "-"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Payment Status</span>
                  <strong>
                    {studentRecord.payment_status || "-"}
                  </strong>
                </div>
              </div>
            </>
          ) : activePage === "payments" ? (
            <>
              <div className="dashboard-header">
                <div>
                  <p className="welcome-small">
                    Financial Information
                  </p>

                  <h1>Payments</h1>
                </div>

                <div className="student-id-box">
                  Student ID: {studentRecord.student_id}
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-card">
                  <p className="card-label">
                    Total Invoiced
                  </p>

                  <h3>
                    RMB {studentTotalInvoiced.toLocaleString()}
                  </h3>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Verified Amount
                  </p>

                  <h3>
                    RMB {studentVerifiedAmount.toLocaleString()}
                  </h3>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Outstanding
                  </p>

                  <h3>
                    RMB {studentOutstandingAmount.toLocaleString()}
                  </h3>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Payment Status
                  </p>

                  <h3>
                    {studentOutstandingAmount > 0
                      ? "Pending"
                      : studentPayments.length > 0
                      ? "Paid"
                      : "No Invoices"}
                  </h3>
                </div>
              </div>

              <div className="dashboard-section">
                <p className="section-label">
                  WeChat Payment
                </p>

                <h2>Scan to Pay</h2>

                {wechatQrUrl ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "24px",
                      flexWrap: "wrap",
                    }}
                  >
                    <img
                      src={wechatQrUrl}
                      alt="WeChat payment QR"
                      style={{
                        width: "240px",
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "18px",
                        border: "1px solid #d8deea",
                        background: "#ffffff",
                        padding: "12px",
                      }}
                    />

                    <div>
                      <h3 style={{ marginTop: 0 }}>
                        Pay using WeChat
                      </h3>

                      <p>
                        Scan this QR in WeChat to complete your payment.
                      </p>

                      <p
                        style={{
                          color: "#8a94a8",
                          fontSize: "13px",
                        }}
                      >
                        After paying, submit the transaction reference and
                        payment proof for administrator verification.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>
                    The payment QR has not been added by the administrator yet.
                  </p>
                )}
              </div>

              <div className="dashboard-section">
                <p className="section-label">
                  Payment Requests
                </p>

                <h2>Invoices</h2>

                {studentPayments.length === 0 ? (
                  <p>No payment requests are available.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Invoice</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Reference</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {studentPayments.map((payment) => (
                          <Fragment key={payment.id}>
                            <tr>
                              <td>{payment.invoice_number}</td>
                              <td>
                                {payment.description || "Student Payment"}
                              </td>
                              <td>
                                RMB{" "}
                                {Number(payment.amount || 0).toLocaleString()}
                              </td>
                              <td>{payment.payment_method || "-"}</td>
                              <td>
                                {payment.transaction_reference ||
                                  "Not submitted"}
                              </td>
                              <td>
                                <span
                                  className={`status ${getStatusClass(
                                    payment.verification_status
                                  )}`}
                                >
                                  {payment.verification_status}
                                </span>
                              </td>
                              <td>
                                {payment.verification_status === "Verified" ? (
                                  <span>Completed</span>
                                ) : (
                                  <button
                                    className="small-button"
                                    onClick={() =>
                                      openPaymentProofForm(payment)
                                    }
                                  >
                                    {payment.payment_proof_url
                                      ? "Resubmit Proof"
                                      : "Submit Proof"}
                                  </button>
                                )}
                              </td>
                            </tr>

                            {selectedProofPaymentId === payment.id && (
                              <tr key={`${payment.id}-proof-form`}>
                                <td colSpan="7">
                                  <form
                                    onSubmit={(event) =>
                                      handlePaymentProofSubmit(
                                        event,
                                        payment
                                      )
                                    }
                                    style={{
                                      padding: "18px 0",
                                    }}
                                  >
                                    <p className="section-label">
                                      Payment Confirmation
                                    </p>

                                    <h3>
                                      {payment.invoice_number} • RMB{" "}
                                      {Number(
                                        payment.amount || 0
                                      ).toLocaleString()}
                                    </h3>

                                    <label>
                                      Transaction / Reference Number
                                    </label>

                                    <input
                                      type="text"
                                      value={paymentProofReference}
                                      onChange={(event) =>
                                        setPaymentProofReference(
                                          event.target.value
                                        )
                                      }
                                      placeholder="Enter the payment reference number"
                                    />

                                    <label>Payment Proof</label>

                                    <input
                                      key={paymentProofFileInputKey}
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                      onChange={(event) =>
                                        setSelectedPaymentProofFile(
                                          event.target.files?.[0] ||
                                            null
                                        )
                                      }
                                    />

                                    <p
                                      style={{
                                        color: "#8a94a8",
                                        fontSize: "13px",
                                        marginTop: "-8px",
                                        marginBottom: "18px",
                                      }}
                                    >
                                      Upload a clear PDF, JPG, JPEG or PNG.
                                      Maximum file size: 10 MB.
                                    </p>

                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "12px",
                                      }}
                                    >
                                      <button
                                        type="submit"
                                        disabled={paymentProofUploading}
                                      >
                                        {paymentProofUploading
                                          ? "Submitting..."
                                          : "Submit for Review"}
                                      </button>

                                      <button
                                        type="button"
                                        className="signout-button"
                                        onClick={closePaymentProofForm}
                                        disabled={paymentProofUploading}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <p
                  style={{
                    marginTop: "18px",
                    color: "#8a94a8",
                    fontSize: "13px",
                  }}
                >
                  After paying through the external QR method, submit the transaction reference and payment proof here. The actual QR image can be added later.
                </p>
              </div>
            </>
          ) : activePage === "receipts" ? (
            <>
              <div className="dashboard-header">
                <div>
                  <p className="welcome-small">
                    Payment Records
                  </p>

                  <h1>Receipts</h1>
                </div>

                <div className="student-id-box">
                  Student ID: {studentRecord.student_id}
                </div>
              </div>

              <div className="dashboard-section">
                <h2>Verified Payment History</h2>

                {studentVerifiedPayments.length === 0 ? (
                  <p>No verified payment receipts are available yet.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Receipt</th>
                          <th>Invoice</th>
                          <th>Amount</th>
                          <th>Payment Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {studentVerifiedPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td>
                              {payment.receipt_reference ||
                                `Receipt for ${payment.invoice_number}`}
                            </td>
                            <td>{payment.invoice_number}</td>
                            <td>
                              RMB{" "}
                              {Number(payment.amount || 0).toLocaleString()}
                            </td>
                            <td>
                              {payment.payment_date
                                ? new Date(
                                    payment.payment_date
                                  ).toLocaleDateString()
                                : "Verified"}
                            </td>
                            <td>
                              <button
                                className="small-button"
                                onClick={() => downloadReceipt(payment)}
                              >
                                Download Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : activePage === "documents" ? (
            <>
              <div className="dashboard-header">
                <div>
                  <p className="welcome-small">
                    Student Files
                  </p>

                  <h1>Documents</h1>
                </div>

                <div className="student-id-box">
                  Student ID: {studentRecord.student_id}
                </div>
              </div>

              <div className="dashboard-section">
                <h2>Available Files</h2>

                {studentDocuments.length === 0 ? (
                  <p>No documents are available.</p>
                ) : (
                  studentDocuments.map((documentRecord) => (
                    <div
                      className="document-item"
                      key={documentRecord.id}
                    >
                      <div>
                        <strong>
                          {documentRecord.document_name}
                        </strong>

                        <p>
                          {documentRecord.document_type || "Document"}
                          {documentRecord.uploaded_at
                            ? ` • ${new Date(
                                documentRecord.uploaded_at
                              ).toLocaleDateString()}`
                            : ""}
                        </p>
                      </div>

                      <button
                        className="small-button"
                        onClick={() =>
                          viewStudentDocument(documentRecord)
                        }
                      >
                        View
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="dashboard-header">
                <div>
                  <p className="welcome-small">
                    Welcome back
                  </p>

                  <h1>{getStudentDisplayName(studentRecord.full_name)}</h1>
                </div>

                <div className="student-id-box">
                  Student ID: {studentRecord.student_id}
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-card">
                  <p className="card-label">Program</p>

                  <h3>
                    {studentRecord.course_or_program || "-"}
                  </h3>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Enrollment Status
                  </p>

                  <h3>
                    {studentRecord.enrollment_status || "-"}
                  </h3>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Outstanding Fees
                  </p>

                  <h3>
                    RMB {studentOutstandingAmount.toLocaleString()}
                  </h3>
                </div>

                <div className="summary-card">
                  <p className="card-label">
                    Documents
                  </p>

                  <h3>{studentDocuments.length} Files</h3>
                </div>
              </div>

              {studentDataError && (
                <div className="dashboard-section">
                  <p style={{ color: "red" }}>
                    {studentDataError}
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    );
  }

  // ============================================================
  // LOGIN PAGE
  // ============================================================

  return (
    <div className="portal-page">
      <div className="login-card">
        <div className="portal-badge">
          AVA STUDENT PORTAL
        </div>

        <h1>Welcome Back</h1>

        <p className="subtitle">
          Sign in using your registered email address.
        </p>

        <form onSubmit={handleLogin}>
          <label>
            Email Address
          </label>

          <input
            type="text"
            placeholder="Enter your registered email"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

          <div className="form-options">
            <label className="remember">
              <input type="checkbox" />
              Remember me
            </label>

            <button
  type="button"
  className="forgot-password-link"
  onClick={async () => {
    const email = username.trim();

    if (!email) {
      alert("Please enter your email address first.");
      return;
    }

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?recovery=1`,
      });

    if (resetError) {
      console.error(resetError);
      alert(`Could not send reset email: ${resetError.message}`);
      return;
    }

    alert(
      "Password reset email sent. Please check your inbox."
    );
  }}
>
  Forgot password?
</button>
            
            
          </div>

          {error && (
            <p
              style={{
                color: "red",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
          >
            {loginLoading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        <p className="security-note">
          Secure access for students and authorized staff only.
        </p>
      </div>
    </div>
  );
}

export default App;