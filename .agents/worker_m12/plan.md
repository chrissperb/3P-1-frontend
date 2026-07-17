# Plan for M12 - Aesthetic Redesign (Borbolêlalá)

## Steps

1. **Global CSS Variables, Gradients, and Keyframes (`index.css`)**
   - Add `:root` variables for colors, Glassmorphism backdrop-filter, border, shadow, and transitions.
   - Modify `body` styles to apply a smooth linear gradient based on butterfly wings, with `min-height: 100vh` and fixed background.
   - Implement `@keyframes float` and `@keyframes pulseGlow`.
   - Update `.login-card` and `.main-nav` styles for Glassmorphism.
   - Update `.login-input` for a subtle glow effect on focus.
   - Update `.login-button` with transition and `pulseGlow` animation on hover.

2. **Login Page (`Login.jsx`)**
   - Wrap the `🦋` emoji in a `<span className="animated-butterfly">🦋</span>` to apply the float animation.
   - Preserve HTML structure (labels, inputs, and button) exactly as is to ensure existing tests pass.

3. **App Shell (`App.jsx`)**
   - Apply the Glassmorphism classes to `.main-nav` via CSS (already done in step 1).
   - Wrap the `🦋` emoji in a `<span className="animated-butterfly">🦋</span>` in the brand `🦋 Borbolêlalá` to apply the float animation.
   - Ensure the text and structure are preserved.

4. **Verification**
   - Run frontend tests: `npm run test` inside `/frontend`.
   - Run backend tests: `npm run test` in the root.
   - Run frontend build: `npm run build` inside `/frontend` to verify that Vite compiles it successfully.

5. **Reporting**
   - Create the handoff report `handoff.md` detailing the visual changes, testing results, and build success.
