import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router-dom";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function HotelProfileSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hotelCode, setHotelCode] = useState(null);

  /* ================= PROFILE DATA ================= */

  const [form, setForm] = useState({
    hotel_name: "",
    email: "",
    phone: "",
    address: "",
    has_gst: false,
    gst_number: "",
    gst_percentage: "",
    logo_url: "",
    signature_url: "",
  });

  /* ================= EDIT MODES ================= */

  const [editName, setEditName] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [editGST, setEditGST] = useState(false);

  const [msg, setMsg] = useState("");

  /* ================= UPLOADS ================= */

  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

      setForm({
        hotel_code: hotel.hotel_code,
        hotel_name: profile.hotel_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        has_gst: !!profile.gst_number,
        gst_number: profile.gst_number || "",
        gst_percentage: profile.gst_percentage || "",
        logo_url: profile.logo_url || "",
        signature_url: profile.signature_url || "",
      });

      setLoading(false);
    };

    loadData();
  }, []);

  /* ================= COMMON ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  /* ================= LOGO → ALL FORMAT TO PNG ================= */

  const convertToPng = (file, outputName) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          resolve(new File([blob], outputName, { type: "image/png" }));
        });
      };
    });

  const uploadLogo = async () => {
    if (!logoFile || !hotelCode) return;
    setUploading(true);

    const pngFile = await convertToPng(logoFile, "logo.png");
    const path = `${hotelCode}/logo.png`;

    await supabase.storage.from("hotel-logos").upload(path, pngFile, {
      upsert: true,
    });

    const { data } = supabase.storage.from("hotel-logos").getPublicUrl(path);

    await supabase
      .from("profiles")
      .update({ logo_url: `${data.publicUrl}?v=${Date.now()}` })
      .eq("id", (await supabase.auth.getUser()).data.user.id);

    setForm((p) => ({ ...p, logo_url: `${data.publicUrl}?v=${Date.now()}` }));
    setUploading(false);
  };

  /* ================= SIGNATURE ================= */

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
    if (!signatureFile || !hotelCode) return;
    setUploading(true);

    const processedFile = await removeBackground(signatureFile);
    const path = `${hotelCode}/signature.png`;

    await supabase.storage
      .from("hotel-signatures")
      .upload(path, processedFile, { upsert: true });

    const { data } = supabase.storage
      .from("hotel-signatures")
      .getPublicUrl(path);

    await supabase
      .from("profiles")
      .update({ signature_url: `${data.publicUrl}?v=${Date.now()}` })
      .eq("id", (await supabase.auth.getUser()).data.user.id);

    setForm((p) => ({
      ...p,
      signature_url: `${data.publicUrl}?v=${Date.now()}`,
    }));
    setUploading(false);
  };

  /* ================= UPDATE FIELDS ================= */

  const updateProfileField = async (data) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("profiles").update(data).eq("id", user.id);
    setMsg("Updated successfully");
    setEditName(false);
    setEditAddress(false);
    setEditGST(false);
  };

  /* ================= PASSWORD CHANGE ================= */

  const changePassword = async () => {
    setPasswordErr("");
    setPasswordMsg("");

    if (!PASSWORD_REGEX.test(newPassword)) {
      setPasswordErr("Password must be at least 8 chars with letter & number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErr("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: currentPassword,
    });

    if (error) {
      setPasswordErr("Current password is incorrect.");
      return;
    }

    await supabase.auth.updateUser({ password: newPassword });
    setPasswordMsg("Password updated successfully.");
  };

  /* ================= FORGOT PASSWORD ================= */

  const forgotPassword = async () => {
    setPasswordErr("");
    setPasswordMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(form.email);

    if (error) {
      setPasswordErr("Something went wrong. Try again later.");
    } else {
      setPasswordMsg("Password reset link sent to your email.");
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

    setDeleteMsg("Delete request sent to admin.");
    setShowDeleteConfirm(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>Hotel Profile & Settings</h2>

      <h3>Hotel Information</h3>
      <p>
        <strong>Hotel Code:</strong> {form.hotel_code}
      </p>
      <p>
        <strong>Hotel Name:</strong> {form.hotel_name}
      </p>
      {!editName ? (
        <button onClick={() => setEditName(true)}>Update Name</button>
      ) : (
        <>
          <input
            name="hotel_name"
            value={form.hotel_name}
            onChange={handleChange}
          />
          <button
            onClick={() => updateProfileField({ hotel_name: form.hotel_name })}
          >
            Update
          </button>
          <button onClick={() => setEditName(false)}>Cancel</button>
        </>
      )}

      <p>
        <strong>Email:</strong> {form.email}
      </p>
      <p>
        <strong>Phone:</strong> {form.phone}
      </p>

      <p>
        <strong>Address:</strong> {form.address}
      </p>
      {!editAddress ? (
        <button onClick={() => setEditAddress(true)}>Update Address</button>
      ) : (
        <>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
          />
          <button onClick={() => updateProfileField({ address: form.address })}>
            Update
          </button>
          <button onClick={() => setEditAddress(false)}>Cancel</button>
        </>
      )}

      <hr />

      <h3>Brand Assets</h3>

      {form.logo_url && <img src={form.logo_url} height="80" />}
      <input type="file" onChange={(e) => setLogoFile(e.target.files[0])} />
      <button disabled={uploading} onClick={uploadLogo}>
        Upload Logo
      </button>

      {form.signature_url && <img src={form.signature_url} height="60" />}
      <input
        type="file"
        onChange={(e) => setSignatureFile(e.target.files[0])}
      />
      <button disabled={uploading} onClick={uploadSignature}>
        Upload Signature
      </button>

      <hr />

      <h3>GST</h3>
      {form.has_gst ? (
        <p>
          <strong>Yes</strong> | GST Number: {form.gst_number} | GST
          Percentage(%): {form.gst_percentage}%
        </p>
      ) : (
        <p>
          <strong>No</strong>
        </p>
      )}

      {!editGST ? (
        <button onClick={() => setEditGST(true)}>Update GST Settings</button>
      ) : (
        <>
          <label>
            <input
              type="checkbox"
              checked={form.has_gst}
              onChange={(e) => setForm({ ...form, has_gst: e.target.checked })}
            />{" "}
            GST Enabled
          </label>

          {form.has_gst && (
            <>
              <input
                placeholder="GST Number"
                value={form.gst_number}
                onChange={(e) =>
                  setForm({ ...form, gst_number: e.target.value })
                }
              />
              <input
                placeholder="GST %"
                value={form.gst_percentage}
                onChange={(e) =>
                  setForm({ ...form, gst_percentage: e.target.value })
                }
              />
            </>
          )}

          <button
            onClick={() =>
              updateProfileField({
                has_gst: form.has_gst,
                gst_number: form.has_gst ? form.gst_number : null,
                gst_percentage: form.has_gst ? form.gst_percentage : null,
              })
            }
          >
            Update
          </button>
          <button onClick={() => setEditGST(false)}>Cancel</button>
        </>
      )}

      <hr />
      <h3>Change Password</h3>
      <input
        type="password"
        placeholder="Current Password"
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={changePassword}>Update Password</button>

      <button onClick={forgotPassword}>Forgot Password</button>

      {passwordMsg && <p style={{ color: "green" }}>{passwordMsg}</p>}
      {passwordErr && <p style={{ color: "red" }}>{passwordErr}</p>}

      <hr />

      <h3>Delete Account</h3>

      {!showDeleteStep1 && (
        <button onClick={() => setShowDeleteStep1(true)}>
          Request Delete Account
        </button>
      )}

      {showDeleteStep1 && !showDeleteConfirm && (
        <>
          <input
            type="password"
            placeholder="Enter Current Password"
            onChange={(e) => setDeletePassword(e.target.value)}
          />
          <button onClick={verifyDeletePassword}>Next</button>
        </>
      )}

      {showDeleteConfirm && (
        <>
          <p>
            Are you sure, you want delete your account?
            <br />
            You cannot change this after confirmation.
          </p>
          <button onClick={confirmDeleteRequest}>Confirm</button>
          <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
        </>
      )}

      {deleteMsg && <p>{deleteMsg}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}
    </main>
  );
}

export default HotelProfileSettings;
