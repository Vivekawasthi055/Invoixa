import { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import "./logo-sign.css";

function Logo({ hotelCode, logoUrl, onUploaded }) {
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  // 🔽 COMPRESS + CONVERT TO PNG
  const convertToPng = (file, outputName) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const MAX_SIZE = 600;
        let { width, height } = img;

        if (width > height && width > MAX_SIZE) {
          height = (height * MAX_SIZE) / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = (width * MAX_SIZE) / height;
          height = MAX_SIZE;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], outputName, { type: "image/png" }));
          },
          "image/png",
          0.8,
        );
      };
    });

  const uploadLogo = async () => {
    if (!logoFile || !hotelCode) return;

    if (!logoFile.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);

    try {
      const pngFile = await convertToPng(logoFile, "logo.png");
      const path = `${hotelCode}/logo.png`;

      await supabase.storage.from("hotel-logos").upload(path, pngFile, {
        upsert: true,
      });

      const { data } = supabase.storage.from("hotel-logos").getPublicUrl(path);

      const finalUrl = `${data.publicUrl}?v=${Date.now()}`;

      await supabase
        .from("profiles")
        .update({ logo_url: finalUrl })
        .eq("id", (await supabase.auth.getUser()).data.user.id);

      if (typeof onUploaded === "function") {
        onUploaded(finalUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    if (!hotelCode) return;
    const confirm = window.confirm("Remove logo permanently?");
    if (!confirm) return;

    setRemoving(true);

    try {
      const path = `${hotelCode}/logo.png`;
      await supabase.storage.from("hotel-logos").remove([path]);

      await supabase
        .from("profiles")
        .update({ logo_url: null })
        .eq("id", (await supabase.auth.getUser()).data.user.id);

      if (typeof onUploaded === "function") {
        onUploaded(null);
      }
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="asset-row">
      {logoUrl && <img src={logoUrl} alt="Logo" />}

      {!logoUrl ? (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files[0])}
          />
          <button
            className="asset-btn"
            disabled={!logoFile || uploading}
            onClick={uploadLogo}
          >
            {uploading ? "Uploading..." : "Upload Logo"}
          </button>
        </>
      ) : (
        <button
          className="asset-btn danger-btn"
          disabled={removing}
          onClick={removeLogo}
        >
          {removing ? "Removing..." : "Remove Logo"}
        </button>
      )}
    </div>
  );
}

export default Logo;
