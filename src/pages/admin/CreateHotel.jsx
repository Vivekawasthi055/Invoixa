import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { createHotel } from "../../services/adminService";
import { Link } from "react-router-dom";

function CreateHotel() {
  const [email, setEmail] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    setResult("");
    setLoading(true);

    const { data, error } = await createHotel({
      email,
      hotel_name: hotelName,
      phone,
    });

    setLoading(false);

    if (error) {
      setResult(error.message);
    } else {
      setResult(
        `Hotel created successfully. Temporary Password: ${data.tempPassword}`
      );
      setEmail("");
      setHotelName("");
      setPhone("");
    }
  };

  return (
    <>
      <Helmet>
        <title>Create New Hotel – Invoixa</title>
      </Helmet>

      <main>
        <h1>Create New Hotel</h1>

        <form onSubmit={handleCreateHotel}>
          <input
            type="text"
            placeholder="Hotel Name"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Hotel Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Hotel"}
          </button>
        </form>

        {result && <p>{result}</p>}
        <br />
        
      </main>
    </>
  );
}

export default CreateHotel;
