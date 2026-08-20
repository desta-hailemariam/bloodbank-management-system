# Implementation Plan - Blood Bank Hub Dashboard Redesign

Improve the existing frontend user dashboards and sidebar layout to match the provided dashboard reference design, establishing a clean, unified visual experience while preserving all React routes, state transitions, API calls, and business logic.

## User Review Required

> [!IMPORTANT]
> **No Loss of Workstation Logic:** All existing dashboard logic (Prisma clients queries, WebSocket sync, IndexedDB, FAYDA lookup) will remain untouched. This redesign modifies the component layout containers and CSS parameters.
> 
> **Dynamic CSS Accent Themes:** We will introduce role-specific class toggles on the main body container in the format `.theme-[role]`. This allows the CSS theme parameters (`--primary` and `--sidebar-bg`) to change dynamically depending on the logged-in user's role.

---

## Proposed Changes

### Global Styling

#### [MODIFY] [index.css](file:///c:/Users/dagid/OneDrive/Documents/BloodBankSystem_ProjectDetails/frontend/src/index.css)
*   Define role-specific CSS variables to switch the primary active highlight and sidebar background colors based on active actor:
    ```css
    .theme-admin {
      --primary: #ef233c;
      --primary-hover: #d90429;
      --sidebar-bg: #0f172a;
    }
    .theme-donor {
      --primary: #ef233c;
      --primary-hover: #b30010;
      --sidebar-bg: #7a151b;
    }
    .theme-station {
      --primary: #3a86ff;
      --primary-hover: #1d4ed8;
      --sidebar-bg: #1e3a8a;
    }
    .theme-laboratory {
      --primary: #8338ec;
      --primary-hover: #5b21b6;
      --sidebar-bg: #4c1d95;
    }
    .theme-warehouse {
      --primary: #06d6a0;
      --primary-hover: #0f766e;
      --sidebar-bg: #064e3b;
    }
    .theme-hospital {
      --primary: #118ab2;
      --primary-hover: #115e59;
      --sidebar-bg: #134e5e;
    }
    ```
*   Implement custom card classes `.dashboard-card` with white/light-gray backgrounds, rounded corners (12px), and subtle borders/shadows to match the reference images.
*   Establish clean grid layouts `.dashboard-grid` and tables styling with row highlights and borders.

---

### Layout Wrapper & Navigation

#### [MODIFY] [App.jsx](file:///c:/Users/dagid/OneDrive/Documents/BloodBankSystem_ProjectDetails/frontend/src/App.jsx)
*   Add a `.theme-[role]` wrapper class dynamically around the workspace view container.
*   Update sidebar menus to match the requested navigation listing for each role:
    *   **Admin:** Dashboard (shows overview), Workstation Registry, Users, Audit Logs, Resets, Analytics, Reminders.
    *   **Donor:** Dashboard, My Profile, Campaigns, My Points, Eligibility Status, Donation History, Appointments.
    *   **Station:** Dashboard, Donor Check-in, Eligibility Check, Collect Sample, Today's Collections, Donors List.
    *   **Lab:** Dashboard, Pending Samples, Screen Samples, Lab Records, Donor Points.
    *   **Warehouse:** Dashboard, Inventory, Incoming Stock, Dispatch Requests, Campaigns, SMS Alerts.
    *   **Hospital:** Dashboard, Request Blood, My Requests, Patients, Available Stock.
*   Refactor top header to include search fields, user information profile blocks, notifications icon, and collapse/menu options.

---

### Dashboards Content

#### [MODIFY] [AdminDashboard.jsx](file:///c:/Users/dagid/OneDrive/Documents/BloodBankSystem_ProjectDetails/frontend/src/pages/dashboards/AdminDashboard.jsx)
*   Add a default `dashboard` view when the active sub-tab is `dashboard`.
*   Draw overview stats: Total Workstations (128), Total Donors (24,568), Blood Units in Stock (3,256), and Pending Requests (18).
*   Add cards containing workstation registration lists, analytics chart rendering using the existing `Analytics` component, and recent audit logs logs list.

#### [MODIFY] [DonorDashboard.jsx](file:///c:/Users/dagid/OneDrive/Documents/BloodBankSystem_ProjectDetails/frontend/src/pages/dashboards/DonorDashboard.jsx)
*   Add default `dashboard` overview view.
*   Draw stats cards (Loyalty Points, Total Donations, Next Eligible Date, Blood Type) and upcoming campaigns cards.
*   Add eligibility check status card and donation history overview, with a bottom alert notification container ("❤️ You have saved 24 lives so far. Thank you!").

#### [MODIFY] [StationDashboard.jsx](file:///c:/Users/dagid/OneDrive/Documents/BloodBankSystem_ProjectDetails/frontend/src/pages/dashboards/StationDashboard.jsx)
*   Add default `dashboard` tab view and map custom navigation sub-tabs (Donor Check-in, Eligibility Check, Collect Sample, Collections, Donors List).
*   Draw Today's Check-ins, Samples Collected, Pending Lab, and Total Donors (This Month) statistics.
*   Implement quick actions mapping buttons that trigger sub-tab view transitions.
*   Draw recent check-in list and a visual SVG donut chart for sample collection status (Collected, Pending, Rejected).

#### [MODIFY] [LabDashboard.jsx](file:///c:/Users/dagid/OneDrive/Documents/BloodBankSystem_ProjectDetails/frontend/src/pages/dashboards/LabDashboard.jsx)
*   Add default `dashboard` overview view.
*   Draw Pending Samples count, Processed count, Negative results, and Positive results.
*   Implement list of pending samples table, results distribution donut chart, and recent lab records.

#### [MODIFY] [WarehouseDashboard.jsx](file:///c:/Users/dagid/OneDrive/Documents/BloodBankSystem_ProjectDetails/frontend/src/pages/dashboards/WarehouseDashboard.jsx)
*   Add default `dashboard` overview view.
*   Draw Total Stock units, Low Stock alerts count, Incoming Stock today, and Pending Dispatch Requests.
*   Implement stock level bar chart grouped by blood type using SVG elements, recent dispatches list, and green action triggers.

#### [MODIFY] [HospitalDashboard.jsx](file:///c:/Users/dagid/OneDrive/Documents/BloodBankSystem_ProjectDetails/frontend/src/pages/dashboards/HospitalDashboard.jsx)
*   Add default `dashboard` overview view.
*   Draw Available Stock count, Pending Requests, Fulfilled Requests, and Registered Patients.
*   Implement local stock availability table, recent requests list, and teal action buttons.

---

## Verification Plan

### Manual Verification
1.  Run the application locally.
2.  Log in as each of the 6 roles and verify:
    *   Dynamic sidebar color changes matching the target color definitions.
    *   Overview cards layout, SVG charts, and buttons alignment.
    *   Top header profile items and search components.
    *   Collapsible sidebar interactions on mobile widths.
