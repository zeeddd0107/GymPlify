# Components Structure

This directory contains all React components organized by their purpose and responsibility.

## Structure Overview

```
components/
├── hooks/           # Custom hooks for logic and state management
├── ui/             # Reusable UI components (presentation only)
├── forms/          # Form components
├── dashboard/      # Dashboard-specific components
├── modals/         # Modal components
├── tables/         # Table components
├── buttons/        # Button components
├── inputs/         # Input components
├── subscription/   # Subscription-related components
├── utils/          # Utility components
└── index.js        # Main export file
```

## Separation of Concerns

### Hooks (`hooks/`)
Custom hooks that contain business logic, state management, and data operations:

- **`useDashboard.js`** - Dashboard navigation and state management
- **`useAuthForm.js`** - Authentication form logic and validation
- **`useDataTable.js`** - Table operations (sorting, filtering, pagination)
- **`useModal.js`** - Modal state management
- **`useSubscriptions.js`** - Subscriptions page logic and data management
- **`useSubscriptionForm.js`** - Subscription form logic and validation

### UI Components (`ui/`)
Pure presentation components that handle only the visual aspects:

- **`Sidebar.jsx`** - Sidebar navigation UI
- **`Navbar.jsx`** - Top navigation bar UI
- **`FormInput.jsx`** - Reusable form input component
- **`SubscriptionsUI.jsx`** - Subscriptions page UI
- **`SubscriptionsActions.jsx`** - Subscriptions edit and delete modals

### Feature Components
Components that combine hooks and UI components for specific features:

- **`Dashboard.jsx`** - Uses `useDashboard` hook and UI components
- **`LoginForm.jsx`** - Uses `useAuthForm` hook and `FormInput` component
- **`Subscriptions.jsx`** - Uses `useSubscriptions` hook and `SubscriptionsUI` component

## Usage Examples

### Using Hooks
```jsx
import { useDashboard, useAuthForm, useSubscriptions } from "@/components/hooks";

const MyComponent = () => {
  const { open, handleMenuClick } = useDashboard();
  const { formData, handleSubmit } = useAuthForm("login");
  const { subscriptions, loading, handleSaveSubscription } = useSubscriptions();
  
  // Component logic here
};
```

### Using UI Components
```jsx
import { Sidebar, Navbar, FormInput, SubscriptionsUI } from "@/components/ui";

const MyComponent = () => {
  return (
    <div>
      <Sidebar {...sidebarProps} />
      <Navbar {...navbarProps} />
      <FormInput {...inputProps} />
      <SubscriptionsUI {...subscriptionProps} />
    </div>
  );
};
```

## Benefits of This Structure

1. **Separation of Concerns**: Logic is separated from presentation
2. **Reusability**: UI components can be reused across different features
3. **Testability**: Hooks can be tested independently of UI
4. **Maintainability**: Changes to logic don't affect UI and vice versa
5. **Scalability**: Easy to add new features following the same pattern

## Best Practices

1. **Hooks should contain only logic**: No JSX in hooks
2. **UI components should be pure**: No business logic in UI components
3. **Use composition**: Combine hooks and UI components in feature components
4. **Keep components small**: Each component should have a single responsibility
5. **Use meaningful names**: Component and hook names should clearly indicate their purpose 