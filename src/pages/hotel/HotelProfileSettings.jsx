import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import Logo from "../../components/common/Logo";
import Signature from "../../components/common/Signature";
import "../../styles/HotelProfileSettings.css";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function HotelProfileSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hotelCode, setHotelCode] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  /* ================= PROFILE DATA ================= */

  const [form, setForm] = useState({
    hotel_name: "",
    email: "",
    phone: "",
    address: "",
    has_gst: false,
    gst_type: "cgst_sgst",
    gst_number: "",
    gst_percentage: "",
    logo_url: "",
    signature_url: "",
  });

  // ✅ FIX: original data backup for Cancel buttons
  const [originalForm, setOriginalForm] = useState(null);

  /* ================= EDIT MODES ================= */

  const [editName, setEditName] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [editGST, setEditGST] = useState(false);

  const [msg, setMsg] = useState("");

  /* ================= PASSWORD ================= */

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  /* ================= DELETE ACCOUNT ================= */

  const [showDeleteStep1, setShowDeleteStep1] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: hotel } = await supabase
        .from("hotels")
        .select("hotel_code")
        .eq("user_id", user.id)
        .single();

      setHotelCode(hotel?.hotel_code || null);

      // ✅ FIX: store loaded data once & reuse
      const loadedForm = {
        hotel_code: hotel.hotel_code,
        hotel_name: profile.hotel_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        has_gst: !!profile.gst_number,
        gst_number: profile.gst_number || "",
        gst_percentage: profile.gst_percentage || "",
        gst_type: profile.gst_type || "cgst_sgst",
        logo_url: profile.logo_url || "",
        signature_url: profile.signature_url || "",
      };

      setForm(loadedForm);
      setOriginalForm(loadedForm); // ✅ FIX: backup original values

      setLoading(false);
    };

    loadData();
  }, []);

  /* ================= COMMON ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  /* ================= UPDATE FIELDS ================= */

  const updateProfileField = async (data) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("profiles").update(data).eq("id", user.id);

    setMsg("Updated successfully");
    setTimeout(() => {
      setMsg("");
    }, 2000);
    setEditName(false);
    setEditAddress(false);
    setEditGST(false);

    // ✅ FIX: update original backup after successful update
    setOriginalForm((prev) => ({ ...prev, ...data }));
  };

  /* ================= PASSWORD CHANGE ================= */

  const changePassword = async () => {
    setPasswordErr("");
    setPasswordMsg("");

    if (!PASSWORD_REGEX.test(newPassword)) {
      setPasswordErr("Password must be at least 8 chars with letter & number.");

      setTimeout(() => {
        setPasswordErr("");
      }, 2000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErr("Passwords do not match.");

      setTimeout(() => {
        setPasswordErr("");
      }, 2000);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: currentPassword,
    });

    if (error) {
      setPasswordErr("Current password is incorrect.");

      setTimeout(() => {
        setPasswordErr("");
      }, 2000);
      return;
    }

    await supabase.auth.updateUser({ password: newPassword });
    setPasswordMsg("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      setPasswordMsg("");
    }, 2000);
  };

  /* ================= FORGOT PASSWORD ================= */

  const forgotPassword = async () => {
    setPasswordErr("");
    setPasswordMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(form.email);

    if (error) {
      setPasswordErr("Something went wrong. Try again later.");
      setTimeout(() => {
        setPasswordErr("");
      }, 2000);
    } else {
      setPasswordMsg("Password reset link sent to your email.");
      setTimeout(() => {
        setPasswordMsg("");
      }, 2000);
    }
  };

  /* ================= DELETE ACCOUNT ================= */

  const verifyDeletePassword = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: deletePassword,
    });

    if (error) {
      setDeleteMsg("Please enter your correct password");
      setTimeout(() => {
        setDeleteMsg("");
      }, 2000);
      return;
    }

    setShowDeleteConfirm(true);
  };

  const confirmDeleteRequest = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("profiles")
      .update({ delete_requested: true })
      .eq("id", user.id);

    setShowDeleteConfirm(false);
    setShowDeleteStep1(false);
    setDeletePassword("");

    setMsg("Delete request sent to admin");

    setTimeout(() => {
      setMsg("");
    }, 2000);

    setShowDeleteConfirm(false);
  };

  if (loading)
    return (
      <main className="all-pages">
        <div className="all-pages-loading-card">
          <div className="all-pages-spinner"></div>
          <p className="loading-title">Opening your Profile & Settings</p>
          <p className="loading-sub">Please wait a moment</p>
        </div>
      </main>
    );

  return (
    <main className="settings-page">
      <h2 className="settings-page-title">Hotel Profile & Settings</h2>

      {/* HOTEL INFO */}
      <section className="settings-card">
        <h3 className="settings-card-title">Hotel Information</h3>

        <div className="settings-info-row">
          <span>Hotel Code</span>
          <strong>{form.hotel_code}</strong>
        </div>

        <div className="settings-info-row">
          <span>Hotel Name</span>
          {!editName ? (
            <>
              <strong>{form.hotel_name}</strong>
              <button
                className="settings-btn"
                onClick={() => setEditName(true)}
              >
                Edit
              </button>
            </>
          ) : (
            <>
              <input
                className="settings-input"
                name="hotel_name"
                value={form.hotel_name}
                onChange={handleChange}
              />
              <button
                className="settings-btn"
                onClick={() =>
                  updateProfileField({ hotel_name: form.hotel_name })
                }
              >
                Save
              </button>
              <button
                className="settings-btn secondary"
                onClick={() => {
                  setForm((p) => ({
                    ...p,
                    hotel_name: originalForm.hotel_name,
                  }));
                  setEditName(false);
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <div className="settings-info-row">
          <span>Email</span>
          <strong>{form.email}</strong>
        </div>

        <div className="settings-info-row">
          <span>Phone</span>
          <strong>{form.phone}</strong>
        </div>

        <div className="settings-info-row column">
          <span>Address</span>
          {!editAddress ? (
            <>
              <p>{form.address || "—"}</p>
              <button
                className="settings-btn"
                onClick={() => setEditAddress(true)}
              >
                Edit
              </button>
            </>
          ) : (
            <>
              <textarea
                className="settings-textarea"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
              <button
                className="settings-btn"
                onClick={() => updateProfileField({ address: form.address })}
              >
                Save
              </button>
              <button
                className="settings-btn secondary"
                onClick={() => {
                  setForm((p) => ({
                    ...p,
                    address: originalForm.address,
                  }));
                  setEditAddress(false);
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </section>

      <hr className="settings-divider" />

      {/* BRAND */}
      <section className="settings-card">
        <h3 className="settings-card-title">Brand Assets</h3>
        <Logo
          hotelCode={hotelCode}
          logoUrl={form.logo_url}
          onUploaded={(url) => setForm((p) => ({ ...p, logo_url: url }))}
        />

        <Signature
          hotelCode={hotelCode}
          signatureUrl={form.signature_url}
          onUploaded={(url) => setForm((p) => ({ ...p, signature_url: url }))}
        />
      </section>

      <hr className="settings-divider" />

      {/* GST */}
      <section className="settings-card">
        <h3 className="settings-card-title">GST Settings</h3>

        {!editGST ? (
          <>
            <p className="settings-muted-text">
              {form.has_gst
                ? `GST Enabled • ${form.gst_number} • ${form.gst_percentage}%`
                : "GST Not Enabled"}
            </p>
            <button className="settings-btn" onClick={() => setEditGST(true)}>
              Edit GST
            </button>
          </>
        ) : (
          <>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={form.has_gst}
                onChange={(e) =>
                  setForm({ ...form, has_gst: e.target.checked })
                }
              />
              <span>Enable GST</span>
            </label>

            {form.has_gst && (
              <>
                <input
                  className="settings-input"
                  placeholder="GST Number"
                  value={form.gst_number}
                  onChange={(e) =>
                    setForm({ ...form, gst_number: e.target.value })
                  }
                />
                <input
                  className="settings-input"
                  placeholder="GST %"
                  value={form.gst_percentage}
                  onChange={(e) =>
                    setForm({ ...form, gst_percentage: e.target.value })
                  }
                />
                <div className="settings-radio-group">
                  <label className="gst-label-with-tooltip">
                    <input
                      type="radio"
                      name="gst_type"
                      value="cgst_sgst"
                      checked={form.gst_type === "cgst_sgst"}
                      onChange={(e) =>
                        setForm({ ...form, gst_type: e.target.value })
                      }
                    />
                    CGST + SGST (Default)
                    <span className="gst-tooltip-wrapper">
                      ℹ️
                      <span className="gst-tooltip">
                        Same state transaction ke liye applicable.
                      </span>
                    </span>
                  </label>

                  <label className="gst-label-with-tooltip">
                    <input
                      type="radio"
                      name="gst_type"
                      value="igst"
                      checked={form.gst_type === "igst"}
                      onChange={(e) =>
                        setForm({ ...form, gst_type: e.target.value })
                      }
                    />
                    IGST
                    <span className="gst-tooltip-wrapper">
                      ℹ️
                      <span className="gst-tooltip">
                        Inter-state (different state) transaction ke liye
                        applicable.
                      </span>
                    </span>
                  </label>
                </div>
              </>
            )}

            <button
              className="settings-btn"
              onClick={() =>
                updateProfileField({
                  has_gst: form.has_gst,
                  gst_number: form.has_gst ? form.gst_number : null,
                  gst_percentage: form.has_gst ? form.gst_percentage : null,
                  gst_type: form.has_gst ? form.gst_type : null,
                })
              }
            >
              Save
            </button>

            <button
              className="settings-btn secondary"
              onClick={() => {
                setForm((p) => ({
                  ...p,
                  has_gst: originalForm.has_gst,
                  gst_number: originalForm.gst_number,
                  gst_percentage: originalForm.gst_percentage,
                  gst_type: originalForm.gst_type,
                }));
                setEditGST(false);
              }}
            >
              Cancel
            </button>
          </>
        )}
      </section>

      {/* SECURITY */}
      <section className="settings-card">
        <h3 className="settings-card-title">Security</h3>

        <div className="settings-password-field">
          <input
            className="settings-input"
            type={showCurrentPassword ? "text" : "password"}
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            minLength={8}
            required
          />

          <button
            type="button"
            className="settings-password-toggle"
            onClick={() => setShowCurrentPassword((p) => !p)}
          >
            {showCurrentPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="settings-password-field">
          <input
            className="settings-input"
            type={showNewPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />

          <button
            type="button"
            className="settings-password-toggle"
            onClick={() => setShowNewPassword((p) => !p)}
          >
            {showNewPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="settings-password-field">
          <input
            className="settings-input"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />

          <button
            type="button"
            className="settings-password-toggle"
            onClick={() => setShowConfirmPassword((p) => !p)}
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button className="settings-btn" onClick={changePassword}>
          Update Password
        </button>
        <button className="settings-btn secondary" onClick={forgotPassword}>
          Forgot Password
        </button>

        {passwordMsg && <p className="settings-success">{passwordMsg}</p>}
        {passwordErr && <p className="settings-error">{passwordErr}</p>}
      </section>

      <hr className="settings-divider" />

      {/* DELETE */}
      <section className="settings-card danger">
        <h3 className="settings-card-title">Delete Account</h3>

        <button
          className="settings-btn danger-btn"
          onClick={() => setShowDeleteStep1(true)}
        >
          Request Delete Account
        </button>

        {showDeleteStep1 && (
          <div className="settings-modal-overlay">
            <div className="settings-modal-box">
              {!showDeleteConfirm ? (
                <>
                  <h4>Confirm Your Password</h4>
                  <div className="settings-password-field">
                    <input
                      className="settings-input"
                      type={showDeletePassword ? "text" : "password"}
                      placeholder="Enter Current Password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                    />

                    <button
                      type="button"
                      className="settings-password-toggle"
                      onClick={() => setShowDeletePassword((p) => !p)}
                    >
                      {showDeletePassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  <button
                    className="settings-btn"
                    onClick={verifyDeletePassword}
                  >
                    Next
                  </button>
                  <button
                    className="settings-btn secondary"
                    onClick={() => {
                      setShowDeleteStep1(false);
                      setDeletePassword("");
                      setDeleteMsg("");
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h4>Confirm Delete Account</h4>
                  <p>
                    Are you sure you want to delete your account?
                    <br />
                    This action is irreversible.
                  </p>
                  <button
                    className="settings-btn danger-btn"
                    onClick={confirmDeleteRequest}
                  >
                    Confirm
                  </button>
                  <button
                    className="settings-btn secondary"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setShowDeleteStep1(false);
                      setDeletePassword("");
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {msg && <div className="settings-toast success">{msg}</div>}
      <div className="settings-logout">
        <button className="settings-btn secondary" onClick={logoutUser}>
          Logout
        </button>
      </div>
    </main>
  );
}

export default HotelProfileSettings;
