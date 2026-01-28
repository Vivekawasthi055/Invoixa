import { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import "./logo-sign.css";

function Signature({ hotelCode, signatureUrl, onUploaded }) {
  const [signatureFile, setSignatureFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  // 🔽 REMOVE BG + COMPRESS
  const removeBackground = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const MAX_WIDTH = 500;
        let { width, height } = img;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], "signature.png", { type: "image/png" }));
          },
          "image/png",
          0.75,
        );
      };
    });

  const uploadSignature = async () => {
    if (!signatureFile || !hotelCode) return;

    if (!signatureFile.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);

    try {
      const processedFile = await removeBackground(signatureFile);
      const path = `${hotelCode}/signature.png`;

      await supabase.storage
        .from("hotel-signatures")
        .upload(path, processedFile, { upsert: true });

      const { data } = supabase.storage
        .from("hotel-signatures")
        .getPublicUrl(path);

      const finalUrl = `${data.publicUrl}?v=${Date.now()}`;

      await supabase
        .from("profiles")
        .update({ signature_url: finalUrl })
        .eq("id", (await supabase.auth.getUser()).data.user.id);

      if (typeof onUploaded === "function") {
        onUploaded(finalUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeSignature = async () => {
    if (!hotelCode) return;
    const confirm = window.confirm("Remove signature permanently?");
    if (!confirm) return;

    setRemoving(true);

    try {
      const path = `${hotelCode}/signature.png`;
      await supabase.storage.from("hotel-signatures").remove([path]);

      await supabase
        .from("profiles")
        .update({ signature_url: null })
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
      {signatureUrl && <img src={signatureUrl} alt="Signature" />}

      {!signatureUrl ? (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSignatureFile(e.target.files[0])}
          />
          <button
            className="asset-btn"
            disabled={!signatureFile || uploading}
            onClick={uploadSignature}
          >
            {uploading ? "Uploading..." : "Upload Signature"}
          </button>
        </>
      ) : (
        <button
          className="asset-btn danger-btn"
          disabled={removing}
          onClick={removeSignature}
        >
          {removing ? "Removing..." : "Remove Signature"}
        </button>
      )}
    </div>
  );
}

export default Signature;
