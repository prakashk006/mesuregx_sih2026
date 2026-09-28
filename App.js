import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/theme/theme';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AssignmentsScreen from './src/screens/AssignmentsScreen';
import AssignmentDetailScreen from './src/screens/AssignmentDetailScreen';
import FieldInspectionScreen from './src/screens/FieldInspectionScreen';
import SyncQueueScreen from './src/screens/SyncQueueScreen';
import InstrumentLookupScreen from './src/screens/InstrumentLookupScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack for Assignments -> Detail -> Field Verification
function AssignmentsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primaryDark, shadowColor: 'transparent', elevation: 0 },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="AssignmentsList"
        component={AssignmentsScreen}
        options={{ title: 'Field Assignments Queue' }}
      />
      <Stack.Screen
        name="AssignmentDetail"
        component={AssignmentDetailScreen}
        options={{ title: 'Inspection Details' }}
      />
      <Stack.Screen
        name="FieldInspection"
        component={FieldInspectionScreen}
        options={{ title: 'Field Verification & MPE' }}
      />
    </Stack.Navigator>
  );
}

// Main Bottom Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.primaryDark, shadowColor: 'transparent', elevation: 0 },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => {
          let icon = '📱';
          if (route.name === 'Dashboard') icon = '🏠';
          else if (route.name === 'Assignments') icon = '📋';
          else if (route.name === 'SyncQueue') icon = '🔄';
          else if (route.name === 'Lookup') icon = '🔍';
          else if (route.name === 'Settings') icon = '⚙️';
          return <Text style={{ fontSize: 18 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Legal Metrology Field Officer' }}
      />
      <Tab.Screen
        name="Assignments"
        component={AssignmentsStackNavigator}
        options={{ title: 'Queue', headerShown: false }}
      />
      <Tab.Screen
        name="SyncQueue"
        component={SyncQueueScreen}
        options={{ title: 'Sync' }}
      />
      <Tab.Screen
        name="Lookup"
        component={InstrumentLookupScreen}
        options={{ title: 'Lookup' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator handling authentication state
function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing MEASUREGX Terminal...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primaryDark, shadowColor: 'transparent', elevation: 0 },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: '700', fontSize: 16 },
          cardStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="AssignmentDetail"
              component={AssignmentDetailScreen}
              options={{ title: 'Inspection Details' }}
            />
            <Stack.Screen
              name="FieldInspection"
              component={FieldInspectionScreen}
              options={{ title: 'Field Verification & MPE' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },
});
