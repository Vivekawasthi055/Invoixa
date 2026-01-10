import { useEffect, useState } from "react";
import { getRooms } from "../../services/roomService";
import {
  addInvoiceRoom,
  addInvoiceRoomRates,
  getInvoiceRooms,
} from "../../services/invoiceRoomService";
import InvoiceRoomFood from "./InvoiceRoomFood";

function InvoiceRooms({ invoice }) {
  const [rooms, setRooms] = useState([]);
  const [invoiceRooms, setInvoiceRooms] = useState([]);

  const [roomId, setRoomId] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");

  const [sameRate, setSameRate] = useState(true);
  const [rate, setRate] = useState("");
  const [nightRates, setNightRates] = useState([]);

  useEffect(() => {
    loadRooms();
    loadInvoiceRooms();
  }, [invoice.id]);

  const loadRooms = async () => {
    const { data } = await getRooms(invoice.hotel_code);
    setRooms(data || []);
  };

  const loadInvoiceRooms = async () => {
    const { data } = await getInvoiceRooms(invoice.id);
    setInvoiceRooms(data || []);
  };

  const nightsBetween = (start, end) => {
    if (!start || !end) return 0;
    return Math.ceil((new Date(end) - new Date(start)) / 86400000);
  };

  const nights = nightsBetween(checkin, checkout);

  useEffect(() => {
    if (!sameRate && nights > 0) {
      setNightRates(Array.from({ length: nights }, () => ""));
    }
  }, [sameRate, nights]);

  const totalAmount = sameRate
    ? nights * Number(rate || 0)
    : nightRates.reduce((s, r) => s + Number(r || 0), 0);

  const handleAddRoom = async () => {
    if (!roomId || nights <= 0) return alert("Invalid data");

    const room = rooms.find((r) => r.id === roomId);

    const { error } = await addInvoiceRoom({
      invoice_id: invoice.id,
      room_id: room.id,
      room_number: room.room_number, // ✅ FIX
      room_name: room.room_name,
      checkin_date: checkin,
      checkout_date: checkout,
      total_nights: nights,
      same_rate_all_nights: sameRate,
      per_night_rate: sameRate ? rate : null,
      total_room_amount: totalAmount,
      hotel_code: invoice.hotel_code,
    });

    if (error) {
      alert("Failed to add room");
      return;
    }

    if (!sameRate) {
      let date = new Date(checkin);
      const rows = nightRates.map((r) => {
        const row = {
          invoice_room_id: invoice.id,
          date: date.toISOString().split("T")[0],
          rate: r,
          // hotel_code: invoice.hotel_code,
        };
        date.setDate(date.getDate() + 1);
        return row;
      });
      await addInvoiceRoomRates(rows);
    }

    setRoomId("");
    setRate("");
    setNightRates([]);
    loadInvoiceRooms();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Add Rooms</h3>

      <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
        <option value="">Select Room</option>
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {r.room_number} {r.room_name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={checkin}
        onChange={(e) => setCheckin(e.target.value)}
      />
      <input
        type="date"
        value={checkout}
        onChange={(e) => setCheckout(e.target.value)}
      />

      <p>Total Nights: {nights}</p>

      <label>
        <input
          type="checkbox"
          checked={sameRate}
          onChange={() => setSameRate(!sameRate)}
        />
        Same rate all nights
      </label>

      {sameRate ? (
        <input
          type="number"
          placeholder="Per night rate"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
      ) : (
        nightRates.map((r, i) => (
          <input
            key={i}
            type="number"
            placeholder={`Night ${i + 1} rate`}
            onChange={(e) => {
              const copy = [...nightRates];
              copy[i] = e.target.value;
              setNightRates(copy);
            }}
          />
        ))
      )}

      <p>
        <strong>Total: ₹{totalAmount}</strong>
      </p>
      <button onClick={handleAddRoom}>Add Room</button>

      <hr />

      <h4>Rooms in Invoice</h4>
      <ul>
        {invoiceRooms.map((r) => (
          <li key={r.id}>
            <strong>
              {r.room_number} {r.room_name}
            </strong>{" "}
            | ₹{r.total_room_amount}
            <InvoiceRoomFood room={r} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InvoiceRooms;
