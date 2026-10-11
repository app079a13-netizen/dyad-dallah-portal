# Project Guidance

## Tech Stack
- **React** for the application UI and reusable components.
- **TypeScript** for all application source code.
- **React Router** for client-side routing.
- **Tailwind CSS** for styling, responsive layouts, spacing, and colors.
- **shadcn/ui** for prebuilt UI components such as buttons, forms, dialogs, and menus.
- **Radix UI** for accessible interactive primitives underlying shadcn/ui components.
- **lucide-react** for icons.

## Library Usage Rules
- Use React for UI rendering and local state. Prefer built-in hooks before adding a state-management library.
- Use React Router for navigation and route definitions. Keep all routes in `src/App.tsx`; use router links for internal navigation.
- Use Tailwind utility classes for styling. Avoid introducing another styling framework or CSS-in-JS library.
- Prefer existing shadcn/ui components for common controls and interactions. Import them from `src/components/ui/`; do not edit the prebuilt component files. Create separate wrapper components when customization is needed.
- Use Radix UI directly only when an accessible primitive is needed and an existing shadcn/ui component does not cover the use case.
- Use `lucide-react` for icons rather than installing another icon library.
- Reuse installed dependencies. Add a library only when the requested feature cannot reasonably be implemented with the existing stack; do not assume other libraries or backend services are configured.

## Code Organization and Implementation
- Keep application source code under `src/`.
- Put pages in `src/pages/` and reusable components in `src/components/`.
- The default page is `src/pages/Index.tsx`. Mount new main-page components there so they appear in the app.
- Use small, focused TypeScript components and follow existing project conventions.
- Check existing implementations before making changes, and edit only files relevant to the request.
- Implement complete features without placeholders or TODO stubs. Avoid unrelated refactoring and unnecessary abstractions.
- Preserve accessibility when composing UI components and validate untrusted input at application boundaries.
