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

## Chatbot Feature
- [x] Extend DB schema: chatbot_conversations, chatbot_messages, chatbot_knowledge, meeting_slots, meeting_bookings
- [x] Backend router: chatbot (AI chat with LLM, order lookup, meeting booking)
- [x] Backend router: knowledge base CRUD (admin)
- [x] Backend router: meeting slots CRUD (admin) and booking (customer)
- [x] Customer floating chatbot widget (order management + meeting booking + product Q&A)
- [x] Admin: Knowledge Base editor page
- [x] Admin: Meeting Slots management page
- [x] Admin: Chatbot Conversations history page
- [x] Wire new routes into App.tsx and admin sidebar

## Payment Flow Maintenance
- [x] Standardize checkout and payment settings around the existing Midtrans payment methods, with no Stripe dependency

## Customer Experience & Order Reporting
- [x] Create a product detail page with a detailed multi-image gallery, purchase controls, and related products
- [x] Add translated order-status filters to the My Orders page
- [x] Add a protected CSV export action to the admin Orders page

## Checkout & Reporting Enhancements
- [x] Add an admin-only Test Midtrans Connection action with clear success and failure feedback
- [x] Persist product quantities from product detail through checkout and order creation
- [x] Add date-range and product-category filters to the admin Orders CSV export

## Admin Sidebar Cleanup
- [x] Remove the duplicate X button from the admin sidebar while preserving required navigation controls
- [x] Remove the duplicate X button from the mobile navigation drawer while retaining its required close control

## Mobile Cart Access
- [x] Show a non-empty cart summary and direct Checkout action in the mobile navigation drawer
- [x] Add direct item-removal controls to the mobile cart summary and synchronize persisted cart state
- [x] Add a Clear Cart action that removes all persisted mobile cart items and quantities at once
- [x] Add a confirmation dialog before the mobile Clear Cart action removes all items
- [x] Add stock-aware plus and minus quantity controls for each item in the mobile cart summary
- [x] Show a translated toast when a mobile cart increase reaches available stock

## Stock Safeguards
- [x] Show remaining stock beside each mobile cart item
- [x] Show a translated success toast after a mobile cart quantity update
- [x] Validate current stock server-side before order creation and payment initiation

## Payment Stock Reservations
- [x] Implement temporary stock reservation with expiry while a payment is in progress
- [x] Release expired reservations during all customer-facing stock reads
- [x] Finalize or release reservations when bank-transfer payment status is changed by admin
- [x] Prove production product-read module triggers cleanup before returning stock availability
- [x] Prove a refunded bank-transfer payment releases its active reservation

## Payment Reservation Experience
- [x] Show a real-time reservation countdown and expiry guidance on the Payment page
- [x] Add an accessible visual progress indicator for the remaining reservation time
- [x] Add a reduced-motion-safe near-expiry visual alert to the reservation timer
- [x] Add a stock-aware customer option to extend an active payment reservation
- [x] Disable the extension action with an accessible unavailable-stock tooltip

## Product Stock Visibility
- [x] Show a translated low-stock indicator on product cards when available stock is five units or fewer
- [x] Add a translated low-stock-only filter to the product catalog
- [x] Show in-stock similar-product recommendations when a product detail is out of stock
- [x] Add need-based filters to in-stock alternative product recommendations
- [x] Keep translated alternative search available even when alternatives have no tags
- [x] Cover text filtering of untagged alternatives in tests
