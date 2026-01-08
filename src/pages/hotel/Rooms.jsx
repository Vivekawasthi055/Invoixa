import { useEffect, useState } from "react";
import { useAuth } from "../../components/common/AuthContext";
import { getRooms, addRoom, updateRoom } from "../../services/roomService";
import { supabase } from "../../services/supabaseClient";

function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [roomName, setRoomName] = useState("");

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

    const { data: hotel, error } = await supabase
      .from("hotels")
      .select("hotel_code, hotel_name")
      .eq("user_id", user.id)
      .single();

    if (error) {
      alert("Hotel not found");
      return;
    }

    await addRoom({
      hotel_code: hotel.hotel_code, // 🔑 REQUIRED
      hotel_name: hotel.hotel_name,
      room_number: roomNumber,
      room_name: roomName,
    });

    setRoomNumber("");
    setRoomName("");
    loadRooms();
  };

  const toggleRoom = async (room) => {
    await updateRoom(room.id, { is_active: !room.is_active });
    loadRooms();
  };

  return (
    <main>
      <h1>Rooms</h1>

      <div>
        <input
          placeholder="Room Number"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
        />
        <input
          placeholder="Room Name (optional)"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button onClick={handleAdd}>Add Room</button>
      </div>

      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            {room.room_number} – {room.room_name || "—"}
            <label>
              <input
                type="checkbox"
                checked={room.is_active}
                onChange={() => toggleRoom(room)}
              />
              Active
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default Rooms;
