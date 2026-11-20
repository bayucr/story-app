import { useCallback, useEffect, useState } from 'react'
import {
  PROFILE_KEY,
  loadProfile,
  normalizeProfile,
  saveProfile,
  type Profile,
} from '@/utils/profile'

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(loadProfile)

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROFILE_KEY || e.key === null) setProfile(loadProfile())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /** Normalizes and saves the profile. Returns false when it could not be persisted. */
  const updateProfile = useCallback((input: Partial<Profile>): boolean => {
    const next = normalizeProfile(input)
    const ok = saveProfile(next)
    if (ok) setProfile(next)
    return ok
  }, [])

  return { profile, updateProfile }
}
