import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fontSize } from '../theme';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import GoalsScreen from '../screens/auth/GoalsScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ClassesScreen from '../screens/main/ClassesScreen';
import ClassDetailScreen from '../screens/main/ClassDetailScreen';
import TrainersScreen from '../screens/main/TrainersScreen';
import TrainerProfileScreen from '../screens/main/TrainerProfileScreen';
import EquipmentScreen from '../screens/main/EquipmentScreen';
import EquipmentMapScreen from '../screens/main/EquipmentMapScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import ReviewScreen from '../screens/main/ReviewScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Home:      { active: 'home',        inactive: 'home-outline' },
  Classes:   { active: 'calendar',    inactive: 'calendar-outline' },
  Trainers:  { active: 'barbell',     inactive: 'barbell-outline' },
  Equipment: { active: 'fitness',     inactive: 'fitness-outline' },
  Profile:   { active: 'person',      inactive: 'person-outline' },
};

function ThemeToggle() {
  const { theme, toggleTheme, colors: themeColors } = useTheme();
  return (
    <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 12 }}>
      <Ionicons name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={22} color={themeColors.primary} />
    </TouchableOpacity>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive}
            size={24}
            color={focused ? colors.primary : colors.textMuted}
          />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: '600' },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
        headerRight: () => <ThemeToggle />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Ignite' }} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Trainers" component={TrainersScreen} />
      <Tab.Screen name="Equipment" component={EquipmentScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { colors, theme } = useTheme();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      AsyncStorage.getItem('fitness_goal').then(goal => {
        setInitialRoute(goal ? 'Main' : 'Goals');
      });
    } else {
      setInitialRoute(null);
    }
  }, [user]);

  if (loading || (user && !initialRoute)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const navTheme = theme === 'dark'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.card, border: colors.border, text: colors.text } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.card, border: colors.border, text: colors.text } };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute ?? 'Main'}
        screenOptions={{ headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text, headerTitleStyle: { fontWeight: '800' } }}
      >
        {user ? (
          <>
            <Stack.Screen name="Goals" component={GoalsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ClassDetail" component={ClassDetailScreen} options={{ title: 'Class Details' }} />
            <Stack.Screen name="TrainerProfile" component={TrainerProfileScreen} options={{ title: 'Trainer Profile' }} />
            <Stack.Screen name="Review" component={ReviewScreen} options={{ title: 'Leave a Review' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="EquipmentMap" component={EquipmentMapScreen} options={{ title: 'Equipment Map' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
