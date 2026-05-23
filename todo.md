# Healthcare Platform TODO

## Phase 1: Database Schema & Migrations
- [x] Design and write full database schema (survey, products, orders, users, settings)
- [x] Run migrations via webdev_execute_sql

## Phase 2: Backend tRPC Routers
- [x] Survey router (CRUD questions/pages, submit answers, get recommendations)
- [x] Products router (list, get, admin CRUD, segment filtering)
- [x] Orders router (create, update status, list for admin/user)
- [x] Payment settings router (bank transfer config, shipping rates)
- [x] Midtrans router (create transaction, webhook handler)
- [x] Admin router (dashboard stats, user management)
- [x] User profile router

## Phase 3: Global Layout & Shared Components
- [x] Global CSS theme (elegant, premium health brand palette)
- [x] Back to Home button component (global, on every page)
- [x] Top navigation bar (logo, nav links, auth state)
- [x] Footer component
- [x] Error boundary with Back to Home
- [x] 404 page with Back to Home
- [x] Loading/skeleton states

## Phase 4: Customer-Facing Pages
- [x] Landing page (hero section + survey entry CTA)
- [x] Health survey page (dynamic questions from DB, multi-step)
- [x] Product recommendations page (survey results → matched products)
- [x] Sign In / Sign Up integrated at recommendation step
- [x] Product catalog page with search and category filtering
- [x] Checkout page (Name, Email, Phone, User Address, Shipping Address with auto-fill toggle)
- [x] Payment page (Bank Transfer / Midtrans Snap)
- [x] Bank transfer instructions page
- [x] Order confirmation / detail page
- [x] Order status tracking page
- [x] My Orders page for authenticated users

## Phase 5: Admin Dashboard
- [x] Admin dashboard layout with sidebar navigation
- [x] Survey management: list/create/edit/delete survey pages and questions
- [x] Product management: list/create/edit/delete products with images, segments, stock
- [x] Payment settings: bank transfer account, shipping rates (national/international)
- [x] Order management: list all orders, view details, update status
- [x] Admin stats overview (total orders, revenue, pending payments)
- [x] User management: update segments and roles

## Phase 6: Midtrans Integration
- [x] Server-side Midtrans transaction creation (credit card, VA, QRIS)
- [x] Midtrans webhook endpoint for payment status updates with SHA512 signature verification
- [x] Payment status polling for frontend
- [x] Handle all Midtrans payment methods (capture, settlement, cancel, deny, expire, refund)

## Phase 7: Polish, Tests & Checkpoint
- [x] Admin notification on new order placement
- [x] Admin notification on payment confirmation via Midtrans webhook
- [x] Vitest unit tests (29 tests passing across auth, survey, products, orders, settings, admin)
- [x] Final UI polish and responsive design
- [x] Route mismatch fix (/orders → /my-orders)
- [x] CSS @import order fix
- [x] TypeScript errors resolved
- [x] Save checkpoint and deliver to user
