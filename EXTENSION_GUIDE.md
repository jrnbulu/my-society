# API Integration & Extension Guide

This guide provides instructions for extending the MySociety application with new features and integrations.

## Table of Contents

1. [Adding New Services](#adding-new-services)
2. [Creating Custom Hooks](#creating-custom-hooks)
3. [Adding New Screens](#adding-new-screens)
4. [Firestore Data Models](#firestore-data-models)
5. [Authentication Flow](#authentication-flow)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

## Adding New Services

### Example: Complaint Service

Create `src/services/complaintService.ts`:

```typescript
import { firestore } from './firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

export interface Complaint {
  id: string;
  userId: string;
  societyId: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create complaint
export const createComplaint = async (
  userId: string,
  societyId: string,
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high' = 'medium'
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(firestore, 'complaints'), {
      userId,
      societyId,
      title,
      description,
      status: 'open',
      priority,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating complaint:', error);
    throw error;
  }
};

// Get complaints by society
export const getComplaintsBySociety = async (
  societyId: string
): Promise<Complaint[]> => {
  try {
    const q = query(
      collection(firestore, 'complaints'),
      where('societyId', '==', societyId)
    );
    const querySnapshot = await getDocs(q);
    
    const complaints: Complaint[] = [];
    querySnapshot.forEach((doc) => {
      complaints.push({
        id: doc.id,
        ...doc.data(),
      } as Complaint);
    });
    
    return complaints;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
};

// Update complaint status
export const updateComplaintStatus = async (
  complaintId: string,
  status: 'open' | 'in-progress' | 'resolved'
): Promise<void> => {
  try {
    await updateDoc(
      collection(firestore, 'complaints').doc(complaintId),
      {
        status,
        updatedAt: Timestamp.now(),
      }
    );
  } catch (error) {
    console.error('Error updating complaint:', error);
    throw error;
  }
};
```

## Creating Custom Hooks

### Example: useComplaints Hook

Create `src/hooks/useComplaints.ts`:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getComplaintsBySociety, Complaint } from '../services/complaintService';

export const useComplaints = () => {
  const { userProfile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = async () => {
    if (!userProfile?.societyId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getComplaintsBySociety(userProfile.societyId);
      setComplaints(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [userProfile?.societyId]);

  return { complaints, isLoading, error, refetch: fetchComplaints };
};
```

## Adding New Screens

### Example: Complaints Screen

Create `src/screens/ComplaintsScreen.tsx`:

```typescript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components';
import { useComplaints } from '../hooks/useComplaints';
import { createComplaint } from '../services/complaintService';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';

type ComplaintsScreenProps = NativeStackScreenProps<any, 'Complaints'>;

export const ComplaintsScreen: React.FC<ComplaintsScreenProps> = ({
  navigation,
}) => {
  const { complaints, isLoading, refetch } = useComplaints();

  const handleCreateComplaint = () => {
    navigation.navigate('NewComplaint');
  };

  const renderComplaintItem = ({ item }: any) => (
    <View style={styles.complaintCard}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.status}>{item.status.toUpperCase()}</Text>
        <Text style={styles.priority}>{item.priority.toUpperCase()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        title="New Complaint"
        onPress={handleCreateComplaint}
        size="lg"
      />
      
      <FlatList
        data={complaints}
        renderItem={renderComplaintItem}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.LG,
  },
  list: {
    gap: SPACING.MD,
    marginTop: SPACING.LG,
  },
  complaintCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.LG,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    ...TYPOGRAPHY.BODY_LARGE,
    fontWeight: '600',
    marginBottom: SPACING.SM,
  },
  description: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    ...TYPOGRAPHY.LABEL_SMALL,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  priority: {
    ...TYPOGRAPHY.LABEL_SMALL,
    color: COLORS.WARNING,
    fontWeight: '600',
  },
});
```

## Firestore Data Models

### Users Collection
```json
{
  "users": {
    "{uid}": {
      "email": "user@gmail.com",
      "name": "John Doe",
      "phoneNumber": "+91 9876543210",
      "role": "owner",
      "societyId": "society_001",
      "profilePicture": "url_to_image",
      "isActive": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
}
```

### Societies Collection
```json
{
  "societies": {
    "society_001": {
      "name": "Green Park Apartments",
      "address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "secretary": "Jane Doe",
      "secretaryPhone": "+91 9876543210",
      "secretaryEmail": "jane@example.com",
      "president": "John Smith",
      "presidentPhone": "+91 9876543211",
      "presidentEmail": "john@example.com",
      "treasurer": "Bob Wilson",
      "totalUnits": 50,
      "createdAt": "timestamp"
    }
  }
}
```

### Complaints Collection
```json
{
  "complaints": {
    "complaint_001": {
      "userId": "user_uid",
      "societyId": "society_001",
      "title": "Water leakage",
      "description": "Water leaking from ceiling",
      "status": "open",
      "priority": "high",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
}
```

## Authentication Flow

### Adding OAuth Providers

```typescript
// In authService.ts
import { signInWithGoogle, signInWithApple } from 'firebase/auth';

export const signInWithGoogleProvider = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};
```

## Error Handling

### Custom Error Handler

```typescript
// Create src/utils/errorHandler.ts

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error.code) {
    // Firebase error
    return new AppError(
      error.code,
      getFirebaseErrorMessage(error.code)
    );
  }

  return new AppError('UNKNOWN_ERROR', 'An unknown error occurred');
};

const getFirebaseErrorMessage = (code: string): string => {
  const messages: { [key: string]: string } = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Wrong password',
    'auth/weak-password': 'Password is too weak',
    'auth/user-disabled': 'User account is disabled',
  };
  
  return messages[code] || 'An error occurred';
};
```

## Testing

### Unit Tests

```typescript
// Create src/__tests__/helpers.test.ts

import { validateEmail, validatePhoneNumber } from '../utils/helpers';

describe('Validation Helpers', () => {
  test('validateEmail should return true for valid email', () => {
    expect(validateEmail('test@gmail.com')).toBe(true);
  });

  test('validateEmail should return false for invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });

  test('validatePhoneNumber should return true for valid number', () => {
    expect(validatePhoneNumber('+91 9876543210')).toBe(true);
  });
});
```

### Integration Tests

```typescript
// Create src/__tests__/auth.integration.test.ts

import { signOutUser, getCurrentUser } from '../services/authService';
import { auth } from '../services/firebaseConfig';

describe('Authentication Integration', () => {
  test('signOutUser should clear authentication state', async () => {
    await signOutUser();
    expect(getCurrentUser()).toBeNull();
  });
});
```

## Performance Optimization

### Code Splitting

```typescript
// Import screens lazily
const ComplaintsScreen = React.lazy(() =>
  import('./screens/ComplaintsScreen').then(
    (module) => ({ default: module.ComplaintsScreen })
  )
);
```

### Memoization

```typescript
import React from 'react';

interface Props {
  data: ComplaintData;
  onPress: () => void;
}

export const ComplaintCard = React.memo<Props>(
  ({ data, onPress }) => {
    return (
      // Component JSX
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.data.id === nextProps.data.id &&
      prevProps.onPress === nextProps.onPress
    );
  }
);
```

---

For more information, refer to the official documentation:
- [React Native](https://reactnative.dev/docs)
- [Firebase](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/docs)
