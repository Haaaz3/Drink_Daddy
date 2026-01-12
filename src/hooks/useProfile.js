import { useState, useEffect, useCallback } from 'react';
import { getProfile, saveProfile } from '../utils/storage';

const DEFAULT_PROFILE = {
  weightLbs: 160,
  sex: 'male',
  age: 30,
  ethnicity: 'NONE',
  sweetSpot: 3,
  isSetup: false,
};

export function useProfile() {
  const [profile, setProfile] = useState(() => {
    const stored = getProfile();
    return stored || DEFAULT_PROFILE;
  });

  useEffect(() => {
    if (profile.isSetup) {
      saveProfile(profile);
    }
  }, [profile]);

  const updateProfile = useCallback((updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const completeSetup = useCallback((profileData) => {
    setProfile({ ...profileData, isSetup: true });
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    saveProfile(DEFAULT_PROFILE);
  }, []);

  return {
    profile,
    updateProfile,
    completeSetup,
    resetProfile,
    isSetup: profile.isSetup,
  };
}
