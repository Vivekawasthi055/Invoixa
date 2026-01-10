// import { useEffect, useState } from "react";
// import { addInvoiceFoodServices } from "../../services/invoiceFoodService";
// import { supabase } from "../../services/supabaseClient";

// function InvoiceRoomFood({ room }) {
//   const [food, setFood] = useState({});
//   const [values, setValues] = useState({});
//   const [items, setItems] = useState([]);

//   const toggle = (k) => setFood({ ...food, [k]: !food[k] });

//   // 🔹 LOAD FOOD & SERVICES FOR ROOM
//   const loadItems = async () => {
//     const { data } = await supabase
//       .from("invoice_food_services")
//       .select("*")
//       .eq("invoice_room_id", room.id)
//       .order("id");

//     setItems(data || []);
//   };

//   useEffect(() => {
//     loadItems();
//   }, [room.id]);

//   const saveFood = async () => {
//     const rows = [];

//     const add = (type, name, qty, rate) => {
//       rows.push({
//         invoice_room_id: room.id,
//         type,
//         name,
//         quantity: qty,
//         price: rate,
//         total_amount: qty ? qty * rate : rate,
//         hotel_code: room.hotel_code,
//       });
//     };

//     const deleteItem = async (id) => {
//       await supabase.from("invoice_food_services").delete().eq("id", id);

//       loadItems();
//     };

//     if (food.breakfast)
//       add("breakfast", "Breakfast", values.bQty, values.bRate);

//     if (food.lunch) add("lunch", "Lunch", values.lQty, values.lRate);

//     if (food.dinner) add("dinner", "Dinner", values.dQty, values.dRate);

//     if (food.service) add("service", values.sName, null, values.sRate);

//     if (food.other) add("other", values.oName, null, values.oRate);

//     if (rows.length === 0) return alert("Nothing selected");

//     await addInvoiceFoodServices(rows);
//     await loadItems(); // 🔥 REFRESH UI

//     alert("Food & services added");
//   };

//   return (
//     <div style={{ marginTop: 10 }}>
//       <h5>Food & Services</h5>

//       {/* ADD FOOD */}
//       {["breakfast", "lunch", "dinner"].map((f) => (
//         <div key={f}>
//           <label>
//             <input type="checkbox" onChange={() => toggle(f)} /> {f}
//           </label>

//           {food[f] && (
//             <>
//               <input
//                 placeholder="Qty"
//                 onChange={(e) =>
//                   setValues({ ...values, [`${f[0]}Qty`]: +e.target.value })
//                 }
//               />
//               <input
//                 placeholder="Rate"
//                 onChange={(e) =>
//                   setValues({ ...values, [`${f[0]}Rate`]: +e.target.value })
//                 }
//               />
//             </>
//           )}
//         </div>
//       ))}

//       {/* SERVICE */}
//       <label>
//         <input type="checkbox" onChange={() => toggle("service")} /> Service
//       </label>
//       {food.service && (
//         <>
//           <input
//             placeholder="Service name"
//             onChange={(e) => setValues({ ...values, sName: e.target.value })}
//           />
//           <input
//             placeholder="Rate"
//             onChange={(e) => setValues({ ...values, sRate: +e.target.value })}
//           />
//         </>
//       )}

//       {/* OTHER */}
//       <label>
//         <input type="checkbox" onChange={() => toggle("other")} /> Other
//       </label>
//       {food.other && (
//         <>
//           <input
//             placeholder="Name"
//             onChange={(e) => setValues({ ...values, oName: e.target.value })}
//           />
//           <input
//             placeholder="Rate"
//             onChange={(e) => setValues({ ...values, oRate: +e.target.value })}
//           />
//         </>
//       )}

//       <br />
//       <button onClick={saveFood}>Save Food</button>

//       {/* 🔽 SHOW ADDED FOOD */}
//       {items.length > 0 && (
//         <ul>
//           {items.map((i) => (
//             <li key={i.id}>
//               {i.name} – ₹{i.total_amount}
//             </li>
//           ))}
//         </ul>
//       )}
//       <li key={i.id}>
//         {i.name} – ₹{i.total_amount}
//         <button onClick={() => deleteItem(i.id)}>❌</button>
//       </li>
//     </div>
//   );
// }

// export default InvoiceRoomFood;

import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { addInvoiceFoodServices } from "../../services/invoiceFoodService";

function InvoiceRoomFood({ room }) {
  const [food, setFood] = useState({});
  const [values, setValues] = useState({});
  const [items, setItems] = useState([]);

  const toggle = (k) => setFood({ ...food, [k]: !food[k] });

  const loadItems = async () => {
    const { data } = await supabase
      .from("invoice_food_services")
      .select("*")
      .eq("invoice_room_id", room.id)
      .order("id");

    setItems(data || []);
  };

  useEffect(() => {
    loadItems();
  }, [room.id]);

  const saveFood = async () => {
    const rows = [];

    const add = (type, name, qty, rate) => {
      rows.push({
        invoice_room_id: room.id,
        type,
        name,
        quantity: qty,
        price: rate,
        total_amount: qty ? qty * rate : rate,
        hotel_code: room.hotel_code,
      });
    };

    if (food.breakfast)
      add("breakfast", "Breakfast", values.bQty, values.bRate);
    if (food.lunch) add("lunch", "Lunch", values.lQty, values.lRate);
    if (food.dinner) add("dinner", "Dinner", values.dQty, values.dRate);
    if (food.service) add("service", values.sName, null, values.sRate);
    if (food.other) add("other", values.oName, null, values.oRate);

    if (rows.length === 0) return alert("Nothing selected");

    await addInvoiceFoodServices(rows);
    await loadItems(); // ✅ refresh UI
    alert("Food & services added");
  };

  const deleteItem = async (id) => {
    await supabase.from("invoice_food_services").delete().eq("id", id);
    loadItems();
  };

  return (
    <div style={{ marginTop: 10 }}>
      <h5>Food & Services</h5>

      {/* ADD FOOD */}
      {["breakfast", "lunch", "dinner"].map((f) => (
        <div key={f}>
          <label>
            <input type="checkbox" onChange={() => toggle(f)} /> {f}
          </label>

          {food[f] && (
            <>
              <input
                placeholder="Qty"
                onChange={(e) =>
                  setValues({ ...values, [`${f[0]}Qty`]: +e.target.value })
                }
              />
              <input
                placeholder="Rate"
                onChange={(e) =>
                  setValues({ ...values, [`${f[0]}Rate`]: +e.target.value })
                }
              />
            </>
          )}
        </div>
      ))}

      {/* SERVICE */}
      <label>
        <input type="checkbox" onChange={() => toggle("service")} /> Service
      </label>
      {food.service && (
        <>
          <input
            placeholder="Service name"
            onChange={(e) => setValues({ ...values, sName: e.target.value })}
          />
          <input
            placeholder="Rate"
            onChange={(e) => setValues({ ...values, sRate: +e.target.value })}
          />
        </>
      )}

      {/* OTHER */}
      <label>
        <input type="checkbox" onChange={() => toggle("other")} /> Other
      </label>
      {food.other && (
        <>
          <input
            placeholder="Name"
            onChange={(e) => setValues({ ...values, oName: e.target.value })}
          />
          <input
            placeholder="Rate"
            onChange={(e) => setValues({ ...values, oRate: +e.target.value })}
          />
        </>
      )}

      <br />
      <button onClick={saveFood}>Save Food</button>

      {items.length > 0 && (
        <ul>
          {items.map((i) => (
            <li key={i.id}>
              {i.name} – ₹{i.total_amount}
              <button onClick={() => deleteItem(i.id)}>❌</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default InvoiceRoomFood;
