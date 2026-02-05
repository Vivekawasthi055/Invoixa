import "./styles/UserManual.css";

function UserManual() {
  return (
    <main className="um-main">
      <h1 className="um-title">Invoixa Hotel User Manual</h1>
      <p className="um-intro">
        Welcome to your Invoixa hotel dashboard! This guide will walk you
        through each page and functionality, step by step.
      </p>

      {/* ================= DASHBOARD ================= */}
      <section className="um-section">
        <h2 className="um-section-title">1️⃣ Dashboard</h2>
        <p>
          After logging in, you will land on the Dashboard. Here you can see
          your hotel information and quick action cards:
        </p>
        <ul className="um-list">
          <li>
            <span className="um-bullet">🏨</span>
            <strong>Hotel Info:</strong> View your hotel logo, name, and hotel
            code.
          </li>
          <li>
            <span className="um-bullet">🧾</span>
            <strong>Create Invoice:</strong> Click the card to generate a new
            invoice for a guest.
          </li>
          <li>
            <span className="um-bullet">📄</span>
            <strong>All Invoices:</strong> Manage previously created invoices.
          </li>
          <li>
            <span className="um-bullet">🛏️</span>
            <strong>Rooms:</strong> Add new rooms or manage existing rooms.
          </li>
          <li>
            <span className="um-bullet">⚙️</span>
            <strong>Profile & Settings:</strong> Update hotel info, logo, GST,
            and preferences.
          </li>
          <li>
            <span className="um-bullet">📖</span>
            <strong>User Manual:</strong> Quick link to open this manual
            anytime.
          </li>
        </ul>
      </section>

      {/* ================= CREATE INVOICE ================= */}
      <section className="um-section">
        <h2 className="um-section-title">2️⃣ Create Invoice</h2>
        <p>This page allows you to generate a new invoice for your guests:</p>
        <ul className="um-list">
          <li>
            <span className="um-bullet">➕</span>
            <strong>Create Invoice:</strong> Click this button to start a new
            invoice. Draft is saved automatically.
          </li>
          <li>
            <span className="um-bullet">🗑️</span>
            <strong>Invoice Deletion Rule:</strong> Only Draft invoices can be
            deleted.
          </li>
          <li>
            <span className="um-bullet">⚠️</span>
            <strong>Final Submission:</strong> After "Save & Next", invoice is
            locked.
          </li>
          <li>
            <span className="um-bullet">👤</span>
            <strong>Guest Details:</strong> Name & phone required, email
            optional.
          </li>
          <li>
            <span className="um-bullet">🏢</span>
            <strong>Additional Guest / Company / GST:</strong> Optional fields.
          </li>
          <li>
            <span className="um-bullet">🛎️</span>
            <strong>Rooms & Food:</strong> Add room charges, food, etc.
          </li>
          <li>
            <span className="um-bullet">💾</span>
            <strong>Save & Next:</strong> Saves invoice and navigates to Final
            Invoice.
          </li>
        </ul>
      </section>

      {/* ================= FINAL INVOICE ================= */}
      <section className="um-section">
        <h2 className="um-section-title">3️⃣ Final Invoice</h2>
        <p>After creating the invoice, you can finalize it here:</p>
        <ul className="um-list">
          <li>
            <span className="um-bullet">🔙</span>
            <strong>Back to Invoices:</strong> Return to invoice list page.
          </li>
          <li>
            <span className="um-bullet">🖨️</span>
            <strong>Print / Download PDF:</strong> Save invoice as PDF.
          </li>
          <li>
            <span className="um-bullet">🗑️</span>
            <strong>Delete Invoice:</strong> Only Draft invoices. Permanently
            removes.
          </li>
          <li>
            <span className="um-bullet">🚫</span>
            <strong>Void Invoice:</strong> Marks invoice as void; irreversible.
          </li>
          <li>
            <span className="um-bullet">🧾</span>
            <strong>Invoice Details:</strong> Invoice number, date, hotel &
            guest info.
          </li>
          <li>
            <span className="um-bullet">💰</span>
            <strong>Room Charges & Food:</strong> Shows rates, food, subtotal.
          </li>
          <li>
            <span className="um-bullet">💸</span>
            <strong>Discount & GST:</strong> Flat/% discount + GST
            auto-calculated.
          </li>
          <li>
            <span className="um-bullet">🏦</span>
            <strong>Payment Mode:</strong> Select multiple options & mark as
            Paid.
          </li>
          <li>
            <span className="um-bullet">📌</span>
            <strong>Status Indicators:</strong> DRAFT / PAID / VOID watermarks.
          </li>
          <li>
            <span className="um-bullet">✍️</span>
            <strong>Authorized Signature:</strong> Hotel signature displayed.
          </li>
        </ul>
      </section>

      {/* ================= ROOMS ================= */}
      <section className="um-section">
        <h2 className="um-section-title">4️⃣ Rooms</h2>
        <p>Manage hotel rooms here:</p>
        <ul className="um-list">
          <li>
            <span className="um-bullet">➕</span>
            <strong>Add Room:</strong> Enter number & name, then click "Add
            Room".
          </li>
          <li>
            <span className="um-bullet">✏️</span>
            <strong>Edit Room:</strong> Modify room number/name, save or cancel.
          </li>
          <li>
            <span className="um-bullet">🔄</span>
            <strong>Activate / Deactivate:</strong> Toggle switch to activate
            room.
          </li>
          <li>
            <span className="um-bullet">⚠️</span>
            <strong>Validation:</strong> Errors for conflicts or missing fields.
          </li>
          <li>
            <span className="um-bullet">📋</span>
            <strong>Room List:</strong> All rooms displayed with status &
            options.
          </li>
        </ul>
      </section>

      {/* ================= PROFILE & SETTINGS ================= */}
      <section className="um-section">
        <h2 className="um-section-title">5️⃣ Hotel Profile & Settings</h2>
        <p>Manage hotel info, GST, branding, and security:</p>
        <ul className="um-list">
          <li>
            <span className="um-bullet">🏨</span>
            <strong>Hotel Info:</strong> Edit hotel name/address. Email/phone
            view-only.
          </li>
          <li>
            <span className="um-bullet">🖼️</span>
            <strong>Brand Assets:</strong> Upload logo & signature.
          </li>
          <li>
            <span className="um-bullet">💳</span>
            <strong>GST Settings:</strong> Enable GST, enter GST number/%,
            select type.
          </li>
          <li>
            <span className="um-bullet">🔑</span>
            <strong>Security:</strong> Change password. Show/hide passwords.
          </li>
          <li>
            <span className="um-bullet">🗑️</span>
            <strong>Delete Account:</strong> Requires password & admin approval.
          </li>
          <li>
            <span className="um-bullet">🚪</span>
            <strong>Logout:</strong> Sign out safely.
          </li>
        </ul>
      </section>

      {/* ================= NOTES & TIPS ================= */}
      <section className="um-section">
        <h2 className="um-section-title">💡 Notes & Tips</h2>
        <ul className="um-list">
          <li>Save changes after editing hotel info, GST, or brand assets.</li>
          <li>
            Draft invoices auto-saved; avoid relying on browser refresh/back.
          </li>
          <li>Check all fields before marking invoice Paid or Void.</li>
          <li>Guest Name & Phone required; Email optional.</li>
          <li>Check GST/Company info carefully for compliance.</li>
          <li>Use "+ Add Room/Food" carefully; remove duplicates.</li>
          <li>Paid/Void invoices cannot be edited/deleted.</li>
          <li>Signature must be uploaded to appear on invoices.</li>
          <li>Use print preview to check formatting.</li>
          <li>
            Two active rooms cannot share same number; conflicts trigger errors.
          </li>
          <li>
            Passwords min 8 characters, include letters & numbers; use eye icon
            to verify.
          </li>
          <li>GST type critical: CGST+SGST same-state, IGST inter-state.</li>
        </ul>
      </section>
    </main>
  );
}

export default UserManual;
