import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { addInvoiceFoodServices } from "../../services/invoiceFoodService";
import "../../styles/CreateInvoice.css";

function InvoiceRoomFood({ room, resetTrigger, onFoodValidationChange }) {
  const [food, setFood] = useState({});
  const [values, setValues] = useState({});
  const [items, setItems] = useState([]);
  const [foodTouched, setFoodTouched] = useState(false);

  const toggle = (k) => {
    setFood({ ...food, [k]: !food[k] });
    setFoodTouched(true);
  };

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

  useEffect(() => {
    setFood({});
    setValues({});
    setFoodTouched(false);
  }, [resetTrigger]);

  useEffect(() => {
    const hasCheckboxSelected = Object.values(food).some(Boolean);
    const hasAnyInput =
      values.bQty ||
      values.bRate ||
      values.lQty ||
      values.lRate ||
      values.dQty ||
      values.dRate ||
      values.sName ||
      values.sRate ||
      values.oName ||
      values.oRate;

    const hasSavedItems = items.length > 0;

    const pending = hasCheckboxSelected;
    if (typeof onFoodValidationChange === "function") {
      onFoodValidationChange(pending);
    }
  }, [food, values, items, onFoodValidationChange]);

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

    setFood({}); // checkbox untick
    setValues({}); // input fields clear
    setFoodTouched(false);
  };

  const deleteItem = async (id) => {
    await supabase.from("invoice_food_services").delete().eq("id", id);
    loadItems();
  };
  return (
    <div className="ci-food-box">
      <h5>Food & Services</h5>

      {["breakfast", "lunch", "dinner"].map((f) => (
        <div key={f} className="ci-food-row">
          <label className="ci-checkbox">
            <input
              type="checkbox"
              checked={!!food[f]}
              onChange={() => toggle(f)}
            />{" "}
            {f}
          </label>

          {food[f] && (
            <div className="ci-food-inputs">
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
            </div>
          )}
        </div>
      ))}

      <div className="ci-food-row">
        <label className="ci-checkbox">
          <input
            type="checkbox"
            checked={!!food.service}
            onChange={() => toggle("service")}
          />{" "}
          Service
        </label>
        {food.service && (
          <div className="ci-food-inputs">
            <input
              placeholder="Service name"
              onChange={(e) => setValues({ ...values, sName: e.target.value })}
            />
            <input
              placeholder="Rate"
              onChange={(e) => setValues({ ...values, sRate: +e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="ci-food-row">
        <label className="ci-checkbox">
          <input
            type="checkbox"
            checked={!!food.other}
            onChange={() => toggle("other")}
          />{" "}
          Other
        </label>
        {food.other && (
          <div className="ci-food-inputs">
            <input
              placeholder="Name"
              onChange={(e) => setValues({ ...values, oName: e.target.value })}
            />
            <input
              placeholder="Rate"
              onChange={(e) => setValues({ ...values, oRate: +e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="ci-btn-row">
        <button onClick={saveFood} className="ci-primary-btn">
          Save Food
        </button>
        <button
          type="button"
          className="ci-secondary-btn"
          onClick={() => {
            setFood({});
            setValues({});
            setFoodTouched(false);
          }}
        >
          Clear
        </button>
      </div>

      {items.length > 0 && (
        <ul className="ci-food-list">
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
