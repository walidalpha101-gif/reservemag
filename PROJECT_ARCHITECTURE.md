# The Reserve Magazine - Project Architecture

## 🏛 Architectural Philosophy
This application is built as a **Deterministic Production System**. Fragility is eliminated by enforcing strict schema integrity between Firestore and the React frontend.

## 🛡 System Guardrails

### 1. Data Integrity Layer
- **Schema Centralization**: All data structures originate from `src/lib/schemas.ts`. 
- **Normalization**: Every document fetched from Firestore MUST pass through a `normalizeX()` helper. This ensures the frontend never encounters `undefined` or malformed fields, even if the database contains legacy or corrupted data.
- **Sanitization**: Every write to Firestore MUST pass through `sanitizeForFirestore()`. This prevents "Unsupported field value: undefined" errors and ensures clean serialization.

### 2. Deterministic Rendering
- No keyword-based UI logic. Rendering is driven by explicit properties in the `ContentBlock` schema.
- Polymorphic components (like `RichTextRenderer`) must handle legacy data gracefully but prioritize the structured block system.

### 3. Responsive Architecture
- **Mobile-First**: Styles are applied mobile-first using Tailwind's default breakpoints.
- **Ultrawide Protection**: The global `.container` utility is constrained to `1600px` to prevent layout stretching on high-resolution displays.
- **Touch-Safe UI**: Interactive elements follow the `44px` touch-target rule on mobile devices.

## 📦 Directory Structure
- `src/lib/`: Core architecture helpers (schemas, firebase config).
- `src/services/`: Persistence logic. No UI code allowed here.
- `src/context/`: Global state (Auth, Site Settings).
- `src/components/admin/`: Isolated back-office UI.
- `src/components/ui/`: Reusable primitive components.

## 🚀 Deployment & Operational Rules
- **Schema Migrations**: When adding a field, update the default object in `schemas.ts` simultaneously.
- **Zero Hardcoding**: Global strings (Title, CTA, Social) MUST be sourced from `siteSettings`.
- **Forbidden Patterns**:
    - ❌ Direct `setDoc` calls from components.
    - ❌ Hardcoded 1280px+ widths outside the container.
    - ❌ Hover-only functionality for critical paths.
    - ❌ Using `any` in service signatures.

## 🛠 Rollback & Recovery
- In case of data corruption, use the "Restore Demo Data" feature in the Admin panel to re-initialize core editorial collections safely.
