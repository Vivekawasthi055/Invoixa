import { useEffect, useState } from "react";
import { useAuth } from "../../components/common/AuthContext";
import { getRooms, addRoom, updateRoom } from "../../services/roomService";
import { supabase } from "../../services/supabaseClient";
import "../../styles/rooms.css";

function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRooms = async () => {
    const { data: hotel } = await supabase
      .from("hotels")
      .select("hotel_code")
      .eq("user_id", user.id)
      .single();

    const { data } = await getRooms(hotel.hotel_code, false);
    setRooms(data || []);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleAdd = async () => {
    if (!roomNumber) return;

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

    setRoomNumber("");
    setRoomName("");
    await loadRooms();
    setLoading(false);
  };

  const toggleRoom = async (room) => {
    await updateRoom(room.id, { is_active: !room.is_active });
    loadRooms();
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
        {rooms.length === 0 ? (
          <p className="rooms-empty-text">No rooms added yet</p>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="rooms-item">
              <div className="rooms-item-info">
                <strong>Room {room.room_number}</strong>
                <span>{room.room_name || "—"}</span>
              </div>

              <label className="rooms-switch">
                <input
                  type="checkbox"
                  checked={room.is_active}
                  onChange={() => toggleRoom(room)}
                />
                <span className="rooms-slider"></span>
              </label>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default Rooms;
