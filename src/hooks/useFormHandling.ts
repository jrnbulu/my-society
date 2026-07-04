/**
 * Custom Hooks
 * 
 * Reusable React hooks for common operations
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for managing form state
 * 
 * @param initialValues - Initial form values
 * @returns Form state and handlers
 */
export const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (name: string, value: any) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error when field is changed
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback((name: string) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const setFieldValue = useCallback((name: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldError,
    setFieldValue,
    resetForm,
  };
};

/**
 * Hook for managing async operations
 * 
 * @param asyncFunction - Async function to call
 * @param immediate - Whether to call immediately
 * @returns State and execute function
 */
export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle'
  );
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};

/**
 * Hook for managing boolean state
 * 
 * @param initialValue - Initial value
 * @returns State and toggle/setter functions
 */
export const useToggle = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return { value, toggle, setTrue, setFalse, setValue };
};

/**
 * Hook for managing previous value
 * 
 * @param value - Current value
 * @returns Previous value
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = React.useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * Hook for managing local storage
 * 
 * @param key - Storage key
 * @param initialValue - Initial value
 * @returns State and setter
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
};

/**
 * Hook for debounced values
 * 
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for mounting check
 * 
 * @returns Boolean indicating if component is mounted
 */
export const useIsMounted = (): boolean => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
};

/**
 * Hook for previous values comparison
 * 
 * @param value - Current value
 * @returns Function to compare with previous value
 */
export const useDidMount = (): boolean => {
  const [didMount, setDidMount] = useState(false);

  useEffect(() => {
    setDidMount(true);
  }, []);

  return didMount;
};

// Re-export React for use in hooks
import React from 'react';
