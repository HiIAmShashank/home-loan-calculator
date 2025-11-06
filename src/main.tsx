import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './index.css';

// Import route tree
import { routeTree } from './routeTree.gen';

// Create router instance
const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
});

// Register router for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
)
