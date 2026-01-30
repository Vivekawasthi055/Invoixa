import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import Logo from "../../components/common/Logo";
import Signature from "../../components/common/Signature";
import "../../styles/completeProfile.css";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [hotelCode, setHotelCode] = useState(null);
  const [uploadLogoNow, setUploadLogoNow] = useState(false);
  const [uploadSignatureNow, setUploadSignatureNow] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    hotel_name: "",
    email: "",
    phone: "",
    address: "",
    has_gst: false,
    gst_number: "",
    gst_percentage: "",
    password: "",
    confirm_password: "",
    logo_url: "",
    signature_url: "",
  });

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

      if (profile?.profile_completed) {
        navigate("/dashboard", { replace: true });
        return;
      }

      const { data: hotel } = await supabase
        .from("hotels")
        .select("hotel_code")
        .eq("user_id", user.id)
        .single();

      setHotelCode(hotel?.hotel_code || null);

      setForm((prev) => ({
        ...prev,
        hotel_name: profile?.hotel_name || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        address: profile?.address || "",
        has_gst: !!profile?.gst_number,
        gst_number: profile?.gst_number || "",
        gst_percentage: profile?.gst_percentage || "",
      }));
      setLogoUrl(profile?.logo_url || null);
      setSignatureUrl(profile?.signature_url || null);

      setUploadLogoNow(!!profile?.logo_url);
      setUploadSignatureNow(!!profile?.signature_url);

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!PASSWORD_REGEX.test(form.password)) {
      setFormError(
        "Password must be at least 8 characters and include a letter and a number.",
      );

      setTimeout(() => {
        setFormError("");
      }, 3000);

      return;
    }

    if (form.password !== form.confirm_password) {
      setFormError("Passwords do not match.");

      setTimeout(() => {
        setFormError("");
      }, 3000);

      return;
    }

    setLoading(true);
    setFormError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.auth.updateUser({ password: form.password });

    await supabase
      .from("profiles")
      .update({
        hotel_name: form.hotel_name,
        address: form.address,
        has_gst: form.has_gst,
        gst_number: form.has_gst ? form.gst_number : null,
        gst_percentage: form.has_gst ? form.gst_percentage : null,
        profile_completed: true,
        password_set: true,
      })
      .eq("id", user.id);

    navigate("/dashboard");
  };

  /* ================= LOADING ================= */

  if (loading)
    return (
      <main className="all-pages">
        <div className="all-pages-loading-card">
          <div className="all-pages-spinner"></div>
          <p className="loading-title">Preparing your profile setup…</p>
          <p className="loading-sub">Please wait a moment</p>
        </div>
      </main>
    );

  return (
    <main className="cp-page">
      <div className="cp-container">
        {/* Header */}
        <div className="cp-header">
          <h1>Complete Your Hotel Profile</h1>
          <p>
            Just a few more details to unlock your dashboard and start billing
            🚀
          </p>
        </div>

        <form onSubmit={handleSubmit} className="cp-form">
          {/* ================= HOTEL DETAILS ================= */}
          <div className="cp-section">
            <h3>🏨 Hotel Details</h3>

            <h3 className="cp-section-title">Hotel Name</h3>
            <input
              name="hotel_name"
              placeholder="Hotel Name"
              value={form.hotel_name}
              onChange={handleChange}
              required
            />

            <div className="cp-row">
              <div>
                <h3 className="cp-section-title">Email</h3>
                <input value={form.email} disabled />
              </div>

              <div>
                <h3 className="cp-section-title">Phone</h3>
                <input value={form.phone} disabled />
              </div>
            </div>

            <h3 className="cp-section-title">Your Full Address</h3>
            <textarea
              name="address"
              placeholder="Full hotel address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* ================= GST SETTINGS ================= */}
          <div className="cp-section">
            <h3>GST Settings</h3>

            <label className="cp-checkbox">
              <input
                type="checkbox"
                name="has_gst"
                checked={form.has_gst}
                onChange={handleChange}
              />
              I have GST registration
            </label>

            {form.has_gst && (
              <div className="cp-row">
                <div>
                  <h3 className="cp-section-title">GST Number</h3>
                  <input
                    name="gst_number"
                    placeholder="GST Number"
                    value={form.gst_number}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <h3 className="cp-section-title">GST Percentage (%)</h3>
                  <input
                    name="gst_percentage"
                    type="number"
                    placeholder="GST %"
                    value={form.gst_percentage}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================= BRANDING ================= */}
          <div className="cp-section">
            <h3>🎨 Branding</h3>

            <label className="cp-checkbox">
              <input
                type="checkbox"
                checked={uploadLogoNow}
                onChange={(e) => setUploadLogoNow(e.target.checked)}
              />
              Upload hotel logo now
            </label>

            {uploadLogoNow && (
              <Logo
                hotelCode={hotelCode}
                logoUrl={logoUrl}
                onUploaded={setLogoUrl}
              />
            )}

            <label className="cp-checkbox">
              <input
                type="checkbox"
                checked={uploadSignatureNow}
                onChange={(e) => setUploadSignatureNow(e.target.checked)}
              />
              Upload authorized signature
            </label>

            {uploadSignatureNow && (
              <Signature
                hotelCode={hotelCode}
                signatureUrl={signatureUrl}
                onUploaded={setSignatureUrl}
              />
            )}
          </div>

          {/* ================= SECURITY ================= */}
          <div className="cp-section">
            <h3>🔐 Secure Your Account</h3>

            <h3 className="cp-section-title">New Password</h3>
            <input
              type="password"
              name="password"
              placeholder="Create new password"
              onChange={handleChange}
              required
            />

            <h3 className="cp-section-title">Confirm Password</h3>
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm password"
              onChange={handleChange}
              required
            />
            {formError && <p className="rooms-error-text">{formError}</p>}
            <p className="cp-password-hint">
              • Minimum 8 characters <br />• At least 1 letter and 1 number
            </p>
          </div>

          {/* ================= CTA ================= */}
          <button type="submit" className="cp-submit-btn">
            Save Profile & Enter Dashboard →
          </button>
        </form>
      </div>
    </main>
  );
}

export default CompleteProfile;
