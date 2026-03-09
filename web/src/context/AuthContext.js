// This file is like an empty box that will hold user login information
// This line allows us to create a shared data container (context) for authentication
import { createContext } from 'react';

// This creates the actual data container that will hold user login information
export const AuthContext = createContext();
