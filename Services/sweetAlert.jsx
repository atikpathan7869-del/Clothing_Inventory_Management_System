import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/* ================= SUCCESS ALERT ================= */
export const showSuccess = (title = "Success", text = "") => {
  return MySwal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#28a745",
  });
};

/* ================= ERROR ALERT ================= */
export const showError = (title = "Error", text = "") => {
  return MySwal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#dc3545",
  });
};

/* ================= WARNING ALERT ================= */
export const showWarning = (title = "Warning", text = "") => {
  return MySwal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: "#ffc107",
  });
};
// ✅ 'export' keyword hona zaroori hai
export const confirmDelete = () => {
    return Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    });
};

/* ================= INFO ALERT ================= */
export const showInfo = (title = "Info", text = "") => {
  return MySwal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: "#17a2b8",
  });
};

/* ================= CONFIRM ALERT ================= */
export const showConfirm = (
  title = "Are you sure?",
  text = "You won't be able to revert this!"
) => {
  return MySwal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Confirm",
  });
};

/* ================= DELETE CONFIRM ================= */
export const showDeleteConfirm = () => {
  return MySwal.fire({
    title: "Are you sure?",
    text: "This record will be deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, Delete it!",
  });
};

/* ================= TOAST ALERT ================= */
export const showToast = (
  icon = "success",
  title = "Done!",
  timer = 2000
) => {
  return MySwal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
  });
};

/* ================= LOADING ALERT ================= */
export const showLoading = (title = "Please wait...") => {
  return MySwal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/* ================= CLOSE ALERT ================= */
export const closeAlert = () => {
  Swal.close();
};