import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../components/common/AuthContext";

/*
====================================================
 HOTEL PROFILE + SETTINGS (READ + LIMITED EDIT)
 Path   : /dashboard/profilesettings
 File   : src/hotel/HotelProfileSettings.jsx
====================================================
*/

function HotelProfileSettings() {
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // upload selections
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);

  // success messages
  const [logoSuccess, setLogoSuccess] = useState("");
  const [signatureSuccess, setSignatureSuccess] = useState("");

  // GST editable states
  const [hasGst, setHasGst] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [gstPercentage, setGstPercentage] = useState("");

  // password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  // reset password
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  /* ================= LOAD HOTEL ================= */

  useEffect(() => {
    loadHotel();
  }, [user]);

  const loadHotel = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("hotels")
      .select("*")
      .eq("user_id", user.id)
      .single();

    setHotel(data);
    setHasGst(data.has_gst);
    setGstNumber(data.gst_number || "");
    setGstPercentage(data.gst_percentage || "");
    setLoading(false);
  };

  /* ================= IMAGE BACKGROUND REMOVE ================= */

  const removeBackground = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => (img.src = reader.result);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        canvas.toBlob((blob) => resolve(blob), "image/png");
      };

      reader.readAsDataURL(file);
    });
  };
  /* ================= LOGO UPLOAD ================= */

  const handleLogoUpload = async () => {
    if (!selectedLogo || !hotel.hotel_code) return;

    setUploading(true);
    setLogoSuccess("");

    const ext = selectedLogo.name.split(".").pop();
    const filePath = `${hotel.hotel_code}/logo.${ext}`;

    // ✅ FIX 1: SINGLE upload only
    const { error } = await supabase.storage
      .from("hotel-logos")
      .upload(filePath, selectedLogo, { upsert: true });

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("hotel-logos")
      .getPublicUrl(filePath);

    // ✅ FIX 2: cache-busting
    const freshUrl = `${data.publicUrl}?v=${Date.now()}`;

    await supabase
      .from("hotels")
      .update({ logo_url: freshUrl })
      .eq("id", hotel.id);

    await loadHotel();
    setLogoSuccess("Logo uploaded successfully.");
    setSelectedLogo(null);
    setUploading(false);
  };

  /* ================= SIGNATURE UPLOAD ================= */

  const handleSignatureUpload = async () => {
    if (!selectedSignature || !hotel.hotel_code) return;

    setUploading(true);
    setSignatureSuccess("");

    const transparentBlob = await removeBackground(selectedSignature);
    const filePath = `${hotel.hotel_code}/signature.png`;

    // ✅ FIX 1: SINGLE upload only
    const { error } = await supabase.storage
      .from("hotel-signatures")
      .upload(filePath, transparentBlob, { upsert: true });

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("hotel-signatures")
      .getPublicUrl(filePath);

    // ✅ FIX 2: cache-busting
    const freshUrl = `${data.publicUrl}?v=${Date.now()}`;

    await supabase
      .from("hotels")
      .update({ signature_url: freshUrl })
      .eq("id", hotel.id);

    await loadHotel();
    setSignatureSuccess("Signature uploaded successfully.");
    setSelectedSignature(null);
    setUploading(false);
  };

  /* ================= GST UPDATE ================= */

  /* ================= GST UPDATE ================= */

  const saveGstSettings = async () => {
    await supabase
      .from("hotels")
      .update({
        has_gst: hasGst,
        gst_number: hasGst ? gstNumber : null,
        gst_percentage: hasGst ? gstPercentage : null,
      })
      .eq("id", hotel.id);

    // ✅ FIX: sync local state immediately
    setHotel((prev) => ({
      ...prev,
      has_gst: hasGst,
      gst_number: hasGst ? gstNumber : null,
      gst_percentage: hasGst ? gstPercentage : null,
    }));
  };

  /* ================= PASSWORD CHANGE ================= */

  const changePassword = async () => {
    setPasswordErr("");
    setPasswordMsg("");

    if (newPassword !== confirmPassword) {
      setPasswordErr("New password and confirm password do not match.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: hotel.email,
      password: currentPassword,
    });

    if (error) {
      setPasswordErr("Current password is incorrect.");
      return;
    }

    await supabase.auth.updateUser({ password: newPassword });
    setPasswordMsg("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h2>Hotel Profile & Settings</h2>

      <h3>Hotel Information</h3>
      <p>
        <strong>Hotel Name:</strong> {hotel.hotel_name}
      </p>
      <p>
        <strong>Email:</strong> {hotel.email}
      </p>
      <p>
        <strong>Phone:</strong> {hotel.phone}
      </p>
      <p>
        <strong>Address:</strong> {hotel.address}
      </p>

      <hr />

      <h3>Brand Assets</h3>

      {hotel.logo_url && <img src={hotel.logo_url} alt="Logo" height="80" />}
      <input type="file" onChange={(e) => setSelectedLogo(e.target.files[0])} />
      <button disabled={uploading} onClick={handleLogoUpload}>
        Upload Logo
      </button>
      {logoSuccess && <p style={{ color: "green" }}>{logoSuccess}</p>}

      <hr />

      {hotel.signature_url && (
        <img src={hotel.signature_url} alt="Signature" height="60" />
      )}
      <input
        type="file"
        onChange={(e) => setSelectedSignature(e.target.files[0])}
      />
      <button disabled={uploading} onClick={handleSignatureUpload}>
        Upload Signature
      </button>
      {signatureSuccess && <p style={{ color: "green" }}>{signatureSuccess}</p>}

      <hr />

      <h3>GST Settings</h3>

      <label>
        <input
          type="checkbox"
          checked={hasGst}
          onChange={(e) => setHasGst(e.target.checked)}
        />{" "}
        GST Enabled
      </label>

      {hasGst && (
        <>
          <input
            placeholder="GST Number"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
          />
          <input
            placeholder="GST Percentage"
            value={gstPercentage}
            onChange={(e) => setGstPercentage(e.target.value)}
          />
        </>
      )}

      <button onClick={saveGstSettings}>Save GST Settings</button>

      <hr />

      <h3>Change Password</h3>

      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={changePassword}>Update Password</button>

      {passwordMsg && <p style={{ color: "green" }}>{passwordMsg}</p>}
      {passwordErr && <p style={{ color: "red" }}>{passwordErr}</p>}

      <hr />

      <button
        onClick={async () => {
          setResetMessage("");
          setResetError("");
          const { error } = await supabase.auth.resetPasswordForEmail(
            hotel.email
          );
          if (error) setResetError("Something went wrong.");
          else setResetMessage("Password reset link sent to your email.");
        }}
      >
        Forgot Password
      </button>

      {resetMessage && <p style={{ color: "green" }}>{resetMessage}</p>}
      {resetError && <p style={{ color: "red" }}>{resetError}</p>}
    </main>
  );
}

export default HotelProfileSettings;
