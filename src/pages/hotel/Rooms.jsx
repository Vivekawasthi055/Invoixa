import { useEffect, useState } from "react";
import { useAuth } from "../../components/common/AuthContext";
import { getRooms, addRoom, updateRoom } from "../../services/roomService";
import { supabase } from "../../services/supabaseClient";
import "../../styles/rooms.css";

function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const [roomNumber, setRoomNumber] = useState("");
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editRoomId, setEditRoomId] = useState(null);
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editRoomName, setEditRoomName] = useState("");
  const [formError, setFormError] = useState("");
  const [roomErrors, setRoomErrors] = useState({});

  const loadRooms = async () => {
    setRoomsLoading(true); // ✅ ADD (start)

    const { data: hotel } = await supabase
      .from("hotels")
      .select("hotel_code")
      .eq("user_id", user.id)
      .single();

    const { data } = await getRooms(hotel.hotel_code, false);
    setRooms(data || []);

    setRoomsLoading(false); // ✅ ADD (end)
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleAdd = async () => {
    if (!roomNumber) {
      setFormError("Room number is required.");
      setTimeout(() => {
        setFormError("");
      }, 2000);
      return;
    }

    // 🔒 Check active room number conflict
    const activeRoomExists = rooms.find(
      (r) => r.room_number === roomNumber && r.is_active === true,
    );

    if (activeRoomExists) {
      setFormError(
        "Room number already exists. Please use a different room number.",
      );
      setTimeout(() => {
        setFormError("");
      }, 3000);
      return;
    }

    setLoading(true);

    const { data: hotel, error } = await supabase
      .from("hotels")
      .select("hotel_code, hotel_name")
      .eq("user_id", user.id)
      .single();

    if (error) {
      alert("Hotel not found");
      setLoading(false);
      return;
    }

    await addRoom({
      hotel_code: hotel.hotel_code,
      hotel_name: hotel.hotel_name,
      room_number: roomNumber,
      room_name: roomName,
    });

    setFormError("");

    setRoomNumber("");
    setRoomName("");
    await loadRooms();
    setLoading(false);
  };

  const toggleRoom = async (room) => {
    // If enabling → check conflict
    if (!room.is_active) {
      const conflict = rooms.find(
        (r) =>
          r.room_number === room.room_number &&
          r.is_active === true &&
          r.id !== room.id,
      );

      if (conflict) {
        setRoomErrors((prev) => ({
          ...prev,
          [room.id]:
            "Another active room already exists with this room number.",
        }));

        setTimeout(() => {
          setRoomErrors((prev) => {
            const copy = { ...prev };
            delete copy[room.id];
            return copy;
          });
        }, 3000);
        return;
      }
    }

    await updateRoom(room.id, { is_active: !room.is_active });

    setRoomErrors((prev) => {
      const copy = { ...prev };
      delete copy[room.id];
      return copy;
    });

    loadRooms();
  };
  const startEdit = (room) => {
    setEditRoomId(room.id);
    setEditRoomNumber(room.room_number);
    setEditRoomName(room.room_name || "");
  };

  const saveEdit = async (room) => {
    if (!editRoomNumber) {
      setRoomErrors((prev) => ({
        ...prev,
        [room.id]: "Room number is required.",
      }));

      setTimeout(() => {
        setRoomErrors((prev) => {
          const copy = { ...prev };
          delete copy[room.id];
          return copy;
        });
      }, 2000);
      return;
    }

    // 🔒 Conflict check only if room will be active
    if (room.is_active) {
      const conflict = rooms.find(
        (r) =>
          r.room_number === editRoomNumber &&
          r.is_active === true &&
          r.id !== room.id,
      );

      if (conflict) {
        setRoomErrors((prev) => ({
          ...prev,
          [room.id]:
            "Room number already exists. Please use a different room number.",
        }));

        setTimeout(() => {
          setRoomErrors((prev) => {
            const copy = { ...prev };
            delete copy[room.id];
            return copy;
          });
        }, 3000);
        return;
      }
    }

    await updateRoom(room.id, {
      room_number: editRoomNumber,
      room_name: editRoomName,
    });

    setRoomErrors((prev) => {
      const copy = { ...prev };
      delete copy[room.id];
      return copy;
    });

    setEditRoomId(null);
    loadRooms();
  };

  const cancelEdit = () => {
    setEditRoomId(null);
  };

  return (
    <main className="rooms-page">
      <div className="rooms-header">
        <h1 className="rooms-title">Rooms</h1>
        <p className="rooms-subtitle">Manage hotel rooms & availability</p>
      </div>

      {/* Add Room Card */}
      <div className="rooms-card">
        <h3 className="rooms-card-title">Add New Room</h3>
        {formError && <p className="rooms-error-text">{formError}</p>}

        <div className="rooms-form">
          <input
            className="rooms-input"
            placeholder="Room Number *"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />
          <input
            className="rooms-input"
            placeholder="Room Name (optional)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button className="rooms-btn" onClick={handleAdd} disabled={loading}>
            {loading ? "Adding..." : "Add Room"}
          </button>
        </div>
      </div>
      {/* Rooms List */}
      <div className="rooms-list">
        {roomsLoading ? (
          <p className="rooms-empty-text loading">Loading…</p>
        ) : rooms.length === 0 ? (
          <p className="rooms-empty-text">No rooms added yet</p>
        ) : (
          rooms.map((room) => {
            const hasError = !!roomErrors[room.id];

            return (
              <div
                key={room.id}
                className={`rooms-item ${hasError ? "has-error" : ""}`}
              >
                {editRoomId === room.id ? (
                  <div className="rooms-edit-box">
                    <input
                      className="rooms-input"
                      value={editRoomNumber}
                      onChange={(e) => setEditRoomNumber(e.target.value)}
                    />
                    <input
                      className="rooms-input"
                      value={editRoomName}
                      onChange={(e) => setEditRoomName(e.target.value)}
                    />
                    <div className="rooms-edit-actions">
                      <button
                        className="rooms-btn small"
                        onClick={() => saveEdit(room)}
                      >
                        Save
                      </button>
                      <button className="rooms-btn ghost" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rooms-item-info">
                    <strong>Room {room.room_number}</strong>
                    <span>{room.room_name || "—"}</span>
                  </div>
                )}

                <div className="rooms-item-actions">
                  <button
                    className="rooms-edit-btn"
                    onClick={() => startEdit(room)}
                  >
                    ✏️ Edit
                  </button>

                  <label className="rooms-switch">
                    <input
                      type="checkbox"
                      checked={room.is_active}
                      onChange={() => toggleRoom(room)}
                    />
                    <span className="rooms-slider"></span>
                  </label>
                </div>

                {hasError && (
                  <p className="rooms-error-text small">
                    {roomErrors[room.id]}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

export default Rooms;
