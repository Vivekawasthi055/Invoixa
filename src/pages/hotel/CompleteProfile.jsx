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
  });

  // 🔹 Load profile + hotel_code
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

  // 🔹 Upload logo (BY HOTEL CODE)
  const uploadLogo = async () => {
    if (!logoFile || !hotelCode) return null;

    const ext = logoFile.name.split(".").pop();
    const filePath = `${hotelCode}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("hotel-logos")
      .upload(filePath, logoFile, { upsert: true });

    if (uploadError) {
      alert(uploadError.message);
      return null;
    }

    const { data } = supabase.storage
      .from("hotel-logos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // 🔹 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!PASSWORD_REGEX.test(form.password)) {
      alert(
        "Password must be at least 8 characters and contain at least 1 letter and 1 number"
      );
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

    // 🔐 Update password
    await supabase.auth.updateUser({ password: form.password });

    // 🖼 Upload logo (optional)
    const logoUrl = uploadLogoNow ? await uploadLogo() : null;

    // 👤 UPDATE PROFILE
    await supabase
      .from("profiles")
      .update({
        hotel_name: form.hotel_name,
        address: form.address,
        has_gst: form.has_gst,
        gst_number: form.has_gst ? form.gst_number : null,
        gst_percentage: form.has_gst ? form.gst_percentage : null,
        logo_url: logoUrl,
        profile_completed: true,
        password_set: true,
      })
      .eq("id", user.id);

    navigate("/dashboard");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main className="cp-container">
      <h1>Complete Hotel Profile</h1>

      <form onSubmit={handleSubmit} className="cp-form">
        <input
          name="hotel_name"
          placeholder="Enter your hotel name"
          value={form.hotel_name}
          onChange={handleChange}
          required
        />

        <input value={form.email} disabled />
        <input value={form.phone} disabled />

        <label>
          <input
            type="checkbox"
            name="has_gst"
            checked={form.has_gst}
            onChange={handleChange}
          />
          Do you have GST?
        </label>

        {form.has_gst && (
          <>
            <input
              name="gst_number"
              placeholder="GST number"
              value={form.gst_number}
              onChange={handleChange}
              required
            />
            <input
              name="gst_percentage"
              type="number"
              placeholder="Tax %"
              value={form.gst_percentage}
              onChange={handleChange}
              required
            />
          </>
        )}

        <textarea
          name="address"
          placeholder="Enter your full address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <label>
          <input
            type="checkbox"
            checked={uploadLogoNow}
            onChange={(e) => setUploadLogoNow(e.target.checked)}
          />
          Want to upload your logo now?
        </label>

        {uploadLogoNow && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files[0])}
          />
        )}

        <hr />

        <input
          type="password"
          name="password"
          placeholder="New Password"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          onChange={handleChange}
          required
        />

        <p className="cp-password-hint">
          Password must be at least 8 characters. <br /> Contain at least 1
          letter (a–z / A–Z) and 1 number (0–9).
          <br />
          Special characters are optional (@ # $ % ! etc.).
        </p>

        <button type="submit">Save & Continue</button>
      </form>
    </main>
  );
}

export default CompleteProfile;
