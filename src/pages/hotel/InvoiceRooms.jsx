import { useEffect, useState } from "react";
import { getRooms } from "../../services/roomService";
import { supabase } from "../../services/supabaseClient";
import "../../styles/CreateInvoice.css";

import {
  addInvoiceRoom,
  addInvoiceRoomRates,
  getInvoiceRooms,
} from "../../services/invoiceRoomService";
import InvoiceRoomFood from "./InvoiceRoomFood";

function InvoiceRooms({ invoice, onValidationChange }) {
  const [rooms, setRooms] = useState([]);
  const [invoiceRooms, setInvoiceRooms] = useState([]);
  const [roomTouched, setRoomTouched] = useState(false);

  const [roomId, setRoomId] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");

  const [sameRate, setSameRate] = useState(true);
  const [rate, setRate] = useState("");
  const [nightRates, setNightRates] = useState([]);
  const [resetFood, setResetFood] = useState(false);
  const [foodPending, setFoodPending] = useState(false);

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

  useEffect(() => {
    const roomsOk = invoiceRooms.length > 0;
    const foodOk = !foodPending;

    if (typeof onValidationChange === "function") {
      onValidationChange(roomsOk && foodOk);
    }
  }, [invoiceRooms, foodPending, onValidationChange]);

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

    // 🔒 STEP-1: ADD ROOM & GET ID
    const { data: invoiceRoom, error } = await addInvoiceRoom({
      invoice_id: invoice.id,
      room_id: room.id,
      room_number: room.room_number,
      room_name: room.room_name,
      checkin_date: checkin,
      checkout_date: checkout,
      total_nights: nights,
      same_rate_all_nights: sameRate,
      per_night_rate: sameRate ? rate : null,
      total_room_amount: totalAmount,
      hotel_code: invoice.hotel_code,
    });

    if (error || !invoiceRoom) {
      alert("Failed to add room");
      return;
    }

    // 🔒 STEP-2: ADD PER-NIGHT RATES (ONLY IF DIFFERENT)
    if (!sameRate) {
      let date = new Date(checkin);

      const rows = nightRates.map((r) => {
        const row = {
          invoice_room_id: invoiceRoom.id, // ✅ FIXED
          hotel_code: invoice.hotel_code, // ✅ FIX: REQUIRED
          date: date.toISOString().split("T")[0],
          rate: Number(r || 0),
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
    setCheckin("");
    setCheckout("");
    setSameRate(true);
    setRoomTouched(false);
  };
  const handleDeleteRoom = async (invoiceRoomId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room? All food & services will also be removed.",
    );

    if (!confirmDelete) return;

    // 1️⃣ Delete food & services first
    await supabase
      .from("invoice_food_services")
      .delete()
      .eq("invoice_room_id", invoiceRoomId);

    // 2️⃣ Delete room rates (if any)
    await supabase
      .from("invoice_room_rates")
      .delete()
      .eq("invoice_room_id", invoiceRoomId);

    // 3️⃣ Delete the room itself
    await supabase.from("invoice_rooms").delete().eq("id", invoiceRoomId);

    // 4️⃣ Refresh UI
    loadInvoiceRooms();
  };

  return (
    <section className="ci-card ci-room-card">
      <h3 className="ci-section-title">Add Rooms</h3>

      <div className="ci-form-grid">
        <div>
          <label>Select Room</label>
          <select
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
              setRoomTouched(true);
            }}
          >
            <option value="">Select Room</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_number} {r.room_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Check-in</label>
          <input
            type="date"
            value={checkin}
            onChange={(e) => {
              setCheckin(e.target.value);
              setRoomTouched(true);
            }}
          />
        </div>

        <div>
          <label>Check-out</label>
          <input
            type="date"
            value={checkout}
            onChange={(e) => {
              setCheckout(e.target.value);
              setRoomTouched(true);
            }}
          />
        </div>
      </div>

      <p className="ci-info-text">Total Nights: {nights}</p>

      <label className="ci-checkbox">
        <input
          type="checkbox"
          checked={sameRate}
          onChange={() => setSameRate(!sameRate)}
        />
        Same rate for all nights
      </label>

      <div className="ci-rate-box">
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
      </div>

      <p className="ci-total">Total: ₹{totalAmount}</p>

      <div className="ci-btn-row">
        <button onClick={handleAddRoom} className="ci-primary-btn">
          + Add Room
        </button>

        <button
          type="button"
          className="ci-secondary-btn"
          onClick={() => {
            setRoomId("");
            setCheckin("");
            setCheckout("");
            setRate("");
            setNightRates([]);
            setSameRate(true);
            setRoomTouched(false);

            setResetFood((prev) => !prev); // ✅ FORCE reset food checkboxes
          }}
        >
          Clear
        </button>
      </div>

      <h4 className="ci-sub-title">Rooms in Invoice</h4>

      <ul className="ci-room-list">
        {invoiceRooms.map((r) => (
          <li key={r.id} className="ci-room-item">
            <div className="ci-room-head">
              <strong>
                {r.room_number} {r.room_name}
              </strong>
              <span>₹{r.total_room_amount}</span>
            </div>

            <button
              className="ci-danger-btn"
              onClick={() => handleDeleteRoom(r.id)}
            >
              ❌ Remove Room
            </button>

            <InvoiceRoomFood
              room={r}
              resetTrigger={resetFood}
              onFoodValidationChange={(hasPending) =>
                setFoodPending(hasPending)
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default InvoiceRooms;
