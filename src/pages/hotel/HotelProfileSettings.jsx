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

  // ✅ NEW: reset status messages
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
    setLoading(false);
  };

  /* ================= IMAGE BACKGROUND REMOVE ================= */

  const removeBackground = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      };

      reader.readAsDataURL(file);
    });
  };

  /* ================= LOGO UPLOAD ================= */

  const uploadLogo = async (file) => {
    setUploading(true);

    const filePath = `logo-${hotel.id}.png`;

    await supabase.storage
      .from("hotel-logos")
      .upload(filePath, file, { upsert: true });

    const { data } = supabase.storage
      .from("hotel-logos")
      .getPublicUrl(filePath);

    await supabase
      .from("hotels")
      .update({ logo_url: data.publicUrl })
      .eq("id", hotel.id);

    await loadHotel();
    setUploading(false);
  };

  /* ================= SIGNATURE UPLOAD ================= */

  const uploadSignature = async (file) => {
    setUploading(true);

    const transparentBlob = await removeBackground(file);

    const filePath = `signature-${hotel.id}.png`;

    await supabase.storage
      .from("hotel-signatures")
      .upload(filePath, transparentBlob, { upsert: true });

    const { data } = supabase.storage
      .from("hotel-signatures")
      .getPublicUrl(filePath);

    await supabase
      .from("hotels")
      .update({ signature_url: data.publicUrl })
      .eq("id", hotel.id);

    await loadHotel();
    setUploading(false);
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

      {hotel.logo_url && (
        <>
          <p>Current Logo</p>
          <img src={hotel.logo_url} alt="Logo" height="80" />
        </>
      )}

      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => uploadLogo(e.target.files[0])}
      />

      <hr />

      {hotel.signature_url && (
        <>
          <p>Current Signature</p>
          <img src={hotel.signature_url} alt="Signature" height="60" />
        </>
      )}

      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => uploadSignature(e.target.files[0])}
      />

      <hr />

      <h3>GST Settings</h3>

      <label>
        <input
          type="checkbox"
          checked={hotel.has_gst}
          onChange={async (e) => {
            await supabase
              .from("hotels")
              .update({ has_gst: e.target.checked })
              .eq("id", hotel.id);
            loadHotel();
          }}
        />{" "}
        GST Enabled
      </label>

      {hotel.has_gst && (
        <>
          <p>
            <strong>GST Number:</strong> {hotel.gst_number}
          </p>
          <p>
            <strong>GST Percentage:</strong> {hotel.gst_percentage}%
          </p>
        </>
      )}

      <hr />

      <h3>Account Security</h3>

      <button
        onClick={async () => {
          setResetMessage("");
          setResetError("");

          const { error } = await supabase.auth.resetPasswordForEmail(
            hotel.email
          );

          if (error) {
            setResetError("Something went wrong. Please try again later.");
          } else {
            setResetMessage(
              "Password reset link sent to your registered email."
            );
          }
        }}
      >
        Forgot Password
      </button>

      {/* ✅ SUCCESS MESSAGE */}
      {resetMessage && (
        <p style={{ marginTop: 8, color: "green" }}>{resetMessage}</p>
      )}

      {/* ❌ ERROR MESSAGE */}
      {resetError && <p style={{ marginTop: 8, color: "red" }}>{resetError}</p>}
    </main>
  );
}

export default HotelProfileSettings;
