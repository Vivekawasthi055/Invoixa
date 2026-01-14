import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import "../../styles/completeProfile.css";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploadLogoNow, setUploadLogoNow] = useState(false);
  const [hotelCode, setHotelCode] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [uploadSignatureNow, setUploadSignatureNow] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);

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

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  /* ================= LOGO → REAL PNG CONVERSION ================= */

  const convertLogoToPng = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          resolve(new File([blob], "logo.png", { type: "image/png" }));
        }, "image/png");
      };
    });

  const uploadLogo = async () => {
    if (!logoFile || !hotelCode) return null;

    const pngLogo = await convertLogoToPng(logoFile);
    const filePath = `${hotelCode}/logo.png`;

    const { error } = await supabase.storage
      .from("hotel-logos")
      .upload(filePath, pngLogo, { upsert: true });

    if (error) {
      alert(error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("hotel-logos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  /* ================= SIGNATURE (UNCHANGED) ================= */

  const removeBackground = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          resolve(new File([blob], "signature.png", { type: "image/png" }));
        });
      };
    });

  const uploadSignature = async () => {
    if (!signatureFile || !hotelCode) return null;

    const processedFile = await removeBackground(signatureFile);
    const filePath = `${hotelCode}/signature.png`;

    const { error } = await supabase.storage
      .from("hotel-signatures")
      .upload(filePath, processedFile, { upsert: true });

    if (error) {
      alert(error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("hotel-signatures")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!PASSWORD_REGEX.test(form.password)) {
      alert("Password must be at least 8 characters with letter & number");
      return;
    }

    if (form.password !== form.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.auth.updateUser({ password: form.password });

    const logoUrl = uploadLogoNow ? await uploadLogo() : null;
    const signatureUrl = uploadSignatureNow ? await uploadSignature() : null;

    await supabase
      .from("profiles")
      .update({
        hotel_name: form.hotel_name,
        address: form.address,
        has_gst: form.has_gst,
        gst_number: form.has_gst ? form.gst_number : null,
        gst_percentage: form.has_gst ? form.gst_percentage : null,
        logo_url: logoUrl,
        signature_url: signatureUrl,
        profile_completed: true,
        password_set: true,
      })
      .eq("id", user.id);

    navigate("/dashboard");
  };

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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSignatureFile(e.target.files[0])}
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
