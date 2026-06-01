import { createContext, useContext } from 'react'

// PatientLayout provides this context so child pages can register
// a "guard" that intercepts the header back-button click.
export const NavigationGuardContext = createContext({
  registerGuard: () => {},
  clearGuard: () => {},
})

export function useNavigationGuard() {
  return useContext(NavigationGuardContext)
}
