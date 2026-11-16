# RELIA — MASTER FRONTEND REDESIGN SPECIFICATION

## ROLE AND OBJECTIVE

Act as a Senior Frontend Architect, Product Designer, Motion Designer, Next.js Engineer, and 3D Web Experience Developer.

You are working inside an EXISTING, FUNCTIONAL Next.js real-time chat application.

This is NOT a greenfield project.

The application already has:
- A functional backend.
- Working WebSocket-based real-time communication.
- Existing registered or seeded users.
- A database and existing data models.
- Existing authentication or session functionality.
- A frontend built with DaisyUI and Tailwind CSS.
- Existing colors, themes, and design resources.
- Working chat-related functionality that must be preserved.

Your responsibility is to redesign and improve the frontend to the standard of a professional, modern SaaS messaging product.

The redesign must deliver a meaningful improvement in visual quality, user experience, responsiveness, accessibility, and perceived performance.

**Primary principle: Preserve functionality. Improve presentation. Add only necessary features.**

Do not rewrite working application logic merely to conform to a new architecture.

---

# 01. PROJECT DISCOVERY — MANDATORY FIRST STEP

Before making changes, inspect the existing project.

Review:

1. package.json and installed dependencies.
2. Next.js version and current routing architecture.
3. App Router or Pages Router structure.
4. Current frontend pages, layouts, and reusable components.
5. Tailwind configuration and design tokens.
6. DaisyUI configuration and usage.
7. Existing themes, colors, and typography.
8. WebSocket client/server integration.
9. Message sending and receiving flow.
10. Authentication and session handling.
11. Existing login and signup endpoints.
12. Existing password recovery implementation, if any.
13. User models and seeded account handling.
14. Existing notification implementation, if any.
15. Profile, conversation, and message state management.
16. Environment variables.
17. Current loading and error states.

Produce a concise internal implementation map describing:

- Components that can be reused.
- Components that need a visual redesign.
- Features that already work and should remain untouched.
- Missing features requiring implementation.
- Any unavoidable backend changes.

Do not start by replacing files or installing multiple UI libraries.

Do not change working backend routes, database schemas, or WebSocket contracts unless a specific requested feature requires it.

Never reset, delete, or recreate seeded users.

---

# 02. PRODUCT IDENTITY

Application name: RELIA

Suggested tagline: "Every conversation, connected."

Brand personality:

- Professional
- Trustworthy
- Approachable
- Contemporary
- Minimal
- Technically sophisticated
- Calm and visually balanced

The application should feel like a mature messaging product, not a student demonstration project.

Avoid copying WhatsApp, Discord, Telegram, Slack, or other messaging products directly.

Use those products only as references for established usability conventions.

Create a recognizable, independent visual identity.

Store the product name, tagline, and brand-related assets in a central configuration rather than repeating hardcoded strings.

Ensure the application metadata, favicon, authentication headings, and visible product labels use the new identity.

Do not change the database name, service identifiers, API names, or infrastructure merely to accommodate the new branding.

---

# 03. TECHNOLOGY REQUIREMENTS

Preserve Next.js and React versions already used by the repository unless a clearly justified compatibility issue requires a change.

Preferred technologies:

- Next.js — existing application framework.
- Tailwind CSS — primary styling system.
- Motion for React / Framer Motion — component transitions and micro-interactions.
- GSAP — selected complex entrance or timeline animations.
- React Three Fiber — one meaningful 3D authentication scene, if compatible with the repository.
- Three.js — supporting 3D rendering.
- Zustand — only if existing state management is insufficient and additional shared state is genuinely necessary.
- Existing icon package, preferably Lucide if already installed.
- Existing toast library if appropriate; otherwise use one small, accessible toast solution.

Lenis may be used selectively for a public marketing page, if one exists.

Avoid Locomotive Scroll unless an existing implementation genuinely requires it.

Do not use smooth-scroll interception inside message lists, chat panels, or other independently scrolling application regions.

Do not combine multiple animation engines to animate the same element or property.

Avoid unnecessary libraries, wrapper components, abstraction layers, animation frameworks, state stores, and utility functions.

Use native CSS transitions for straightforward hover, focus, and color changes.

Use client components only where interactive functionality requires them.

Preserve the existing rendering architecture and avoid unnecessary conversion of server components to client components.

---

# 04. DESIGN SYSTEM

## 4.1 Existing Colors

Inspect the existing project color palette BEFORE introducing new colors.

Reuse the established brand colors as the foundation.

Create a small semantic design-token layer, using existing CSS variables where possible.

Suggested token categories:

- background
- foreground
- surface
- surface-elevated
- border
- muted
- primary
- primary-foreground
- secondary
- accent
- success
- warning
- destructive
- focus-ring

If the existing colors are incomplete, introduce restrained supplementary colors that harmonize with them.

Avoid overusing saturated accents.

Use primary colors primarily for:

- Active navigation.
- Primary CTAs.
- Selected conversations.
- Focus indicators.
- Message ownership differentiation.
- Important application states.

Use neutrals to create visual hierarchy and comfortable reading surfaces.

Do not apply gradients to every panel.

Do not use neon colors, decorative glows, or excessive glassmorphism.

Support existing light and dark themes if present.

If theme switching is already available, preserve it.

## 4.2 Typography

Preferred font pairing:

Headings: Sora
Body and interface: Plus Jakarta Sans

Use next/font where appropriate.

Configure typography centrally.

Avoid generic browser-default typography.

Use a clear hierarchy:

- Product headings.
- Screen headings.
- Conversation titles.
- Message body.
- Metadata.
- Timestamps.
- Helper and validation text.

Message text must prioritize readability over decorative style.

Use responsive font sizing, consistent line height, restrained letter spacing, and appropriate font weights.

## 4.3 Layout Language

Create a spacious, refined interface.

Design characteristics:

- Strong alignment.
- Clear information hierarchy.
- Consistent spacing.
- Subtle separators.
- Soft but controlled border radii.
- Comfortable touch targets.
- Restrained shadows.
- Visually consistent buttons and inputs.
- Well-designed empty states.
- Reduced visual clutter.
- Excellent contrast.

Do not redesign every element as a floating glass card.

Maintain coherence across all application screens.

---

# 05. APPLICATION STRUCTURE

Preserve the project's existing routing conventions.

Redesign the following screens when they exist, and add requested missing screens using the current architecture.

## A. Authentication

- Login
- Create account
- Forgot password
- Reset password
- Authentication loading/error states

## B. Messaging

- Main messaging layout
- Conversation sidebar
- Chat list
- Conversation header
- Message history
- Message composer
- User profile
- Existing search or filtering
- Existing messaging settings

## C. Additional Existing Screens

Identify additional pages in the repository.

Preserve their routes and business functionality.

Apply consistent styling without expanding product scope unnecessarily.

---

# 06. AUTHENTICATION EXPERIENCE

Create a premium, unified authentication design.

## 6.1 Login Page

Desktop layout:

- Balanced two-column composition.
- One side contains the authentication form.
- The other contains the product identity and a distinctive 3D scene.
- Elegant typography.
- Concise supporting copy.
- Clear field labels.
- Visible input focus.
- Password visibility toggle.
- Remember-me control only if supported by existing session behavior.
- Forgot password link.
- Create account link.

Avoid unnecessary background effects or decorative cards.

Authentication must use the existing backend contract.

Do not introduce fake authentication.

## 6.2 Create Account

Match the visual style of the login page.

Use only fields supported by the current backend unless a necessary extension is approved by the implementation plan.

Provide:

- Appropriate validation.
- Clear error messages.
- Password visibility controls.
- Accessible form labels.
- Submission loading state.
- Existing login navigation.
- Success or failure feedback.

Never assume signup is complete before the backend confirms it.

## 6.3 Forgot Password

Provide a polished recovery flow.

Screen 1: User requests a password reset.

Screen 2: User receives a confirmation message.

Screen 3: User opens a valid password-reset link.

Screen 4: User sets and confirms a new password.

Screen 5: User receives confirmation and can return to login.

First inspect whether password recovery already exists.

If a secure recovery endpoint exists, reuse it.

If it is missing, implement the smallest necessary backend extension with approval from the implementation plan.

A working recovery flow normally requires:

- A short-lived, single-use reset token.
- Secure token handling.
- Expiration validation.
- A password-reset email delivery mechanism.
- Password update using the existing password hashing conventions.
- Invalidation of the consumed token.

Use a neutral confirmation response for reset requests so the application does not reveal whether an email address belongs to a user.

Do not log recovery tokens or expose credentials.

Do not create frontend-only password recovery that pretends to work.

If email infrastructure is unavailable, implement the frontend and identify the precise missing backend dependency.

Do not introduce OTP, CAPTCHA, third-party authentication, or multi-factor authentication unless the existing project requires them.

---

# 07. SIGNATURE 3D AUTHENTICATION EXPERIENCE

## Concept: Connected Conversations

Replace the existing generic blob with ONE original 3D object that communicates the idea of messaging and connection.

### Model Design

Create a sculptural arrangement of connected message forms.

The model should consist of:

- Two or three recognizable message-inspired forms.
- A balanced asymmetrical composition.
- Rounded, carefully beveled speech-bubble geometry.
- A small number of restrained connecting elements.
- Soft matte or satin materials.
- Subtle depth and ambient shading.
- A cohesive silhouette.

The entire arrangement should read as ONE designed sculptural object, rather than several unrelated decorative models.

Avoid:

- Torus knots.
- Generic abstract spheres.
- Random geometric blobs.
- Orbiting planets.
- Spinning rings.
- NFT-style objects.
- Floating emojis.
- Unrelated particles.
- Excessive glass effects.
- Neon sci-fi styling.

### Motion Behavior

The sculpture should:

- Float slowly within a constrained area.
- Have subtle vertical movement.
- Perform a very slight rotational drift.
- Maintain a recognizable front-facing silhouette.
- Use smooth, continuous motion.
- Remain visually stable when the user interacts with the form.

No OrbitControls.

No drag-to-rotate controls.

No camera manipulation UI.

No uncontrolled rotation.

No heavy particle systems.

The sculpture is a visual centerpiece, not an interactive game.

### Composition

Position the sculpture inside the visual panel on desktop.

Use directional lighting and soft shadows to reveal form and depth.

Respect the existing brand palette.

Do not let the model obscure interface text or buttons.

### Performance

- Use a lightweight scene.
- Minimize geometry and draw calls.
- Avoid excessive postprocessing.
- Cap device pixel ratio appropriately.
- Lazy-load the 3D scene.
- Render a graceful static fallback when WebGL is unavailable.
- Respect prefers-reduced-motion.
- Avoid unnecessary frame updates.
- Dispose of scene resources correctly.

On mobile, simplify or hide the large scene to prioritize authentication usability.

The 3D implementation must not delay the login form from becoming usable.

---

# 08. MESSAGING INTERFACE REDESIGN

Redesign the messaging interface as a professional real-time communication product.

## 8.1 Desktop Layout

Use a balanced application shell consisting of:

1. Primary navigation where applicable.
2. Conversation sidebar.
3. Active conversation panel.
4. Optional contextual panel only if existing features require it.

Avoid adding an unnecessary third panel.

The messaging experience should prioritize content and communication, not dashboard decoration.

## 8.2 Conversation Sidebar

Include existing supported functionality such as:

- Current user identity.
- Search conversations.
- Recent conversations.
- User avatars or initials.
- Latest message preview.
- Latest message timestamp.
- Unread message counts.
- Selected conversation state.
- Online indicators if already supported.
- New conversation action if currently available.

Use meaningful visual hierarchy and clear active states.

Do not create fake unread counts or presence indicators.

## 8.3 Main Conversation Area

Design a clean conversation header containing appropriate existing details.

The message history should support:

- Clear incoming/outgoing message differentiation.
- Consistent message spacing.
- Readable message bubbles.
- Timestamps.
- Appropriate grouping.
- Existing delivery/read indicators, if supported.
- Existing typing indicators, if supported.
- Existing attachments, if supported.
- Existing message actions, if supported.

Do not invent backend functionality for reactions, message editing, deletion, forwarding, or attachments.

Preserve such features if already present.

## 8.4 Message Composer

Provide:

- Accessible text input.
- Clear send action.
- Enter-to-send behavior consistent with the existing app.
- Shift+Enter multiline support where applicable.
- Visible sending/error states.
- Existing attachment actions, if any.
- Proper keyboard focus behavior.

Do not accidentally submit duplicate messages.

Do not modify the established message delivery contract.

## 8.5 Empty States

Create professional empty states for:

- No selected conversation.
- No matching conversations.
- No messages yet.
- Failed message loading.
- Temporarily unavailable connection.

Avoid generic decorative illustrations and excessive emojis.

Use concise text and relevant actions.

---

# 09. REAL-TIME NOTIFICATION SYSTEM

This is an important new feature.

The application must notify the recipient when a new message arrives through the EXISTING WebSocket mechanism.

Do not introduce another real-time service.

Do not add polling if the existing connection already provides the necessary events.

## 9.1 In-App Toast Notifications

When an authenticated user receives a new message from another user:

- Show a compact, elegant toast.
- Display the sender's name.
- Show a short message preview.
- Display an avatar where available.
- Provide an action to open the conversation.
- Support automatic dismissal.
- Support manual dismissal.
- Apply a subtle entrance/exit animation.

Do not show a new-message toast when the recipient is already actively viewing that conversation and the relevant chat is visible.

Do not display a toast for the current user's own outgoing messages.

Do not replay old-message notifications after reconnection.

Do not produce duplicate toasts from repeated listeners or event processing.

Ensure that navigating to a conversation does not create multiple socket subscriptions.

## 9.2 Browser Notifications

Support optional browser/desktop notifications using the browser Notification API when appropriate.

Requirements:

- Ask permission only through a deliberate user action, preferably in notification settings.
- Do not request notification permission automatically on page load.
- Respect denied or unsupported notification permissions.
- Prefer browser notifications when the page is hidden and permission has been granted.
- Do not show redundant browser and in-app alerts for the same event.
- Open or focus the relevant conversation when supported.
- Do not expose sensitive message content unnecessarily.

Do not introduce Web Push infrastructure or service workers unless true notifications while the application is closed are explicitly required.

## 9.3 Unread Indicators

If supported by current backend data, maintain:

- Conversation unread count.
- Total unread count.
- Visual unread styling.
- Correct unread state when opening a conversation.

Derive counts from existing authoritative state.

Do not permanently alter unread values based only on a local animation.

If the backend does not support durable read/unread state, identify the limitation before implementing a persistence-dependent feature.

## 9.4 Notification Preferences

Where practical, provide a small settings interface for:

- In-app toast notifications.
- Browser notifications.
- Optional notification sound.

Keep sound disabled by default.

Do not introduce a large notification center unless an existing product requirement justifies it.

---

# 10. WEBSOCKET INTEGRATION — STRICT PRESERVATION

Do not refactor the current socket architecture merely for styling.

Inspect:

- Socket connection initialization.
- Authentication handshake.
- Existing event names.
- Message payload shapes.
- Room or conversation subscriptions.
- Reconnection behavior.
- Existing event listeners.
- Message state updates.
- Existing acknowledgment logic.

Maintain the current contracts.

If creating a notification listener, integrate it with the existing message-receive event.

Avoid registering the same listener in multiple components.

Reuse the existing central socket instance or established provider.

Ensure cleanup follows the repository's current connection lifecycle.

Handle stale conversations and duplicate events appropriately.

If the backend already supplies message IDs, use them for duplicate prevention.

Do not invent message payload fields that do not exist.

If the connection fails, expose a clear but unobtrusive connection state.

Do not display false online status.

---

# 11. MOTION DESIGN

Create a refined motion system.

Use a small set of consistent transitions.

Examples:

- Navigation selection: quick color transition.
- Sidebar items: subtle hover feedback.
- Modal opening: gentle scale/fade.
- Toast arrival: controlled slide/fade.
- New message appearance: restrained entrance animation.
- Authentication forms: modest staggered reveal.
- Empty state: simple opacity transition.
- 3D sculpture: slow ambient motion.

Avoid:

- Large bouncy transitions.
- Long loading animations.
- Excessive page-wide movement.
- Repeating entrance animations after every state update.
- Heavy blur animations.
- Parallax inside chat messages.
- Animated gradients across the entire interface.
- Unnecessary animation during typing.

Use Motion for React for component lifecycle animations.

Use GSAP only for elements where timelines genuinely improve the result.

Use CSS transitions for ordinary interactions.

Respect prefers-reduced-motion.

Avoid layout shifts and animation conflicts.

---

# 12. RESPONSIVENESS

The application must work correctly on:

- Large desktop monitors.
- Standard laptops.
- Tablets.
- Mobile phones.

Desktop:

- Persistent sidebar.
- Spacious message panel.
- Proper scroll isolation.
- Responsive message widths.

Tablet:

- Adaptive sidebar width.
- Reduced nonessential decoration.

Mobile:

- Conversation list as a primary screen.
- Active conversation as a focused screen.
- Clear back navigation.
- Comfortable input composer.
- Accessible action buttons.
- Correct handling of mobile browser viewport and keyboard resizing.
- No horizontal overflow.
- No excessive fixed-height assumptions.

Ensure that the message composer remains accessible when the mobile virtual keyboard opens.

Use modern viewport sizing where supported.

---

# 13. ACCESSIBILITY AND USABILITY

Implement practical accessibility without introducing excessive infrastructure.

Requirements:

- Semantic HTML.
- Proper form labels.
- Visible keyboard focus.
- Keyboard-operable controls.
- Accessible dialogs.
- Correct button states.
- Text contrast.
- Reduced-motion support.
- Appropriate announcement of important notifications.
- Consistent error feedback.

Avoid announcing every chat message multiple times to screen readers.

Avoid disruptive focus changes when messages arrive.

Do not implement unnecessarily complicated accessibility utilities when established native elements already solve the problem.

---

# 14. PERFORMANCE AND CODE QUALITY

Prioritize simplicity and production maintainability.

Rules:

- Reuse existing components whenever reasonable.
- Preserve existing state management.
- Avoid unnecessary global stores.
- Avoid duplicated socket connections.
- Avoid excessive useEffect logic.
- Avoid complex wrapper hierarchies.
- Avoid redundant custom hooks.
- Avoid new dependencies for trivial UI behavior.
- Avoid unnecessary API requests.
- Avoid loading the 3D scene on every route.
- Lazy-load expensive visual components.
- Keep chat list scrolling smooth.
- Avoid rerendering the entire application for each incoming message.
- Avoid unneeded abstractions or speculative future-proofing.
- Follow existing project conventions.
- Maintain clear, readable code.

Do not add Redis, queues, new databases, third-party authentication providers, or additional microservices.

Do not introduce arbitrary security frameworks or multiple authentication guards.

Preserve essential authentication, authorization, input validation, and existing security controls.

Do not weaken existing security to simplify implementation.

---

# 15. BACKEND CHANGE POLICY

Backend changes are discouraged unless essential.

Allowed examples:

- Adding a minimal forgot/reset-password endpoint if no recovery mechanism exists.
- Reusing or minimally extending existing email delivery configuration for password recovery.
- Adding a missing notification-related event only if the current message events cannot support the feature.

Backend changes must be:

- Minimal.
- Backward-compatible.
- Clearly explained.
- Focused on the requested feature.
- Non-disruptive to existing users and data.

Do not:

- Rewrite the authentication system.
- Rename existing routes.
- Replace the WebSocket server.
- Introduce a new database schema without necessity.
- Reset users.
- Modify working message delivery behavior.
- Change API response structures without need.

If a backend dependency is missing, report it clearly instead of fabricating a functional frontend.

---

# 16. QUALITY ASSURANCE

After implementing the redesign, verify the following.

## Authentication

- Existing users can log in.
- New user registration works.
- Validation works.
- Session persistence remains correct.
- Protected routes work as before.
- Logout works.
- Password recovery works if its backend prerequisites are available.

## Messaging

- Existing conversations load.
- Existing messages remain visible.
- Users can send messages.
- Recipients receive messages in real time.
- Messages do not appear twice.
- Scrolling works.
- Existing typing, presence, attachment, and read-status features remain functional where supported.

## Notifications

- A new incoming message creates an appropriate toast.
- Own messages do not trigger incoming notifications.
- Active conversation messages do not create redundant toasts.
- Notification click opens the correct conversation.
- Reconnecting does not replay previous alerts.
- Browser permission handling works.
- Notification listeners do not multiply after navigation.

## Interface

- Desktop layout is polished.
- Mobile layout works.
- Authentication form remains usable during 3D loading.
- Dark and light themes work if supported.
- No unwanted horizontal scrolling.
- No major layout shifts.
- Reduced-motion mode is respected.

## Engineering

- No unnecessary backend modifications.
- No breaking route changes.
- No unnecessary dependencies.
- Existing build and lint commands pass, apart from documented pre-existing issues.
- No relevant runtime errors.
- No accidental exposure of environment secrets.

---

# 17. EXECUTION PROCESS

Implement in this order:

PHASE 1 — Inspect the repository and document existing functionality.

PHASE 2 — Establish the product identity, typography, and semantic theme tokens.

PHASE 3 — Redesign the application shell, conversation sidebar, chat panel, and message composer.

PHASE 4 — Redesign authentication screens and create the lightweight 3D sculpture.

PHASE 5 — Integrate incoming-message toasts using existing WebSocket events.

PHASE 6 — Add browser notification preferences and functionality where supported.

PHASE 7 — Implement or connect the password recovery workflow.

PHASE 8 — Polish motion, responsive behavior, empty states, and accessibility.

PHASE 9 — Run available checks and verify existing functionality.

Do not treat these phases as permission to replace otherwise working logic.

Do not remove features that are not explicitly discussed in this specification.

---

# 18. FINAL DELIVERABLE

Deliver the redesigned application within the existing project.

Include a concise final implementation report covering:

1. Frontend screens and components changed.
2. Dependencies added and why they were necessary.
3. Backend files changed, if any.
4. Notification behavior implemented.
5. Password recovery integration status.
6. Existing functionality preserved.
7. Tests or checks performed.
8. Any remaining genuine limitations.

Do not report a feature as working unless it has been implemented and appropriately verified.

Do not add fake API responses, mock authentication, pretend notifications, or placeholder success flows to disguise missing functionality.

## FINAL STANDARD

The final application should feel like a carefully designed, commercially credible communication platform.

It must remain fast, responsive, understandable, and maintainable.

Successful delivery means:

**The same working application, with a substantially better frontend, reliable notifications, refined authentication, and a memorable but restrained 3D experience.**
