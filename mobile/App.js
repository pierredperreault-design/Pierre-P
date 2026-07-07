import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// API Configuration
const API_URL = 'http://your-api-url.com/api';

// Authentication Context
import { createContext, useContext } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.token) {
        setUser(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Login Screen
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigation.replace('MainApp');
    } else {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <Icon name="church" size={80} color="#2E7D32" />
        <Text style={styles.title}>Pierre-P</Text>
        <Text style={styles.subtitle}>Gestion des Présences</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Connexion</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Check-In Screen
const CheckInScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [memberName, setMemberName] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events/today`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les événements');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedEvent || !memberName.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner un événement et entrer un nom');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/attendance/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          memberName: memberName,
          checkinTime: new Date().toLocaleTimeString(),
        }),
      });

      if (response.ok) {
        Alert.alert('Succès', `${memberName} enregistré(e) pour ${selectedEvent.eventName}`);
        setMemberName('');
      } else {
        Alert.alert('Erreur', 'Impossible d\'enregistrer la présence');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Événements d'aujourd'hui</Text>

        <FlatList
          data={events}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.eventCard,
                selectedEvent?.id === item.id && styles.eventCardSelected,
              ]}
              onPress={() => setSelectedEvent(item)}
            >
              <Icon name="calendar" size={24} color="#2E7D32" />
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{item.eventName}</Text>
                <Text style={styles.eventTime}>{item.startTime} - {item.endTime}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.label}>Nom du membre</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez le nom"
          value={memberName}
          onChangeText={setMemberName}
        />

        <TouchableOpacity
          style={[styles.button, styles.buttonSuccess]}
          onPress={handleCheckIn}
        >
          <Icon name="check-circle" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Enregistrer Présence</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Attendance History Screen
const AttendanceHistoryScreen = ({ navigation }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance/history?limit=50`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      setAttendanceRecords(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return '#4CAF50';
      case 'late':
        return '#FF9800';
      case 'absent':
        return '#F44336';
      case 'excused':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      present: 'Présent',
      late: 'Retard',
      absent: 'Absent',
      excused: 'Excusé',
      virtual: 'Virtuel',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique des Présences</Text>

        <FlatList
          data={attendanceRecords}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.attendanceCard}>
              <View style={styles.attendanceHeader}>
                <Text style={styles.memberName}>{item.memberName}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                </View>
              </View>
              <Text style={styles.eventNameSmall}>{item.eventName}</Text>
              <Text style={styles.dateTime}>{item.eventDate} - {item.checkinTime}</Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

// Members Screen
const MembersScreen = ({ navigation }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/members?status=active`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) =>
    member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membres</Text>

        <TextInput
          style={styles.input}
          placeholder="Rechercher un membre..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          data={filteredMembers}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.memberCard}
              onPress={() =>
                navigation.navigate('MemberDetail', { memberId: item.id })
              }
            >
              <View style={styles.memberAvatar}>
                <Text style={styles.avatarText}>
                  {item.firstName[0]}
                  {item.lastName[0]}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberNameCard}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={styles.memberRole}>{item.email}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#BDBDBD" />
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
};

// Settings Screen
const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: 'Annuler', onPress: () => {} },
        {
          text: 'Déconnecter',
          onPress: () => {
            logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres</Text>

        <View style={styles.settingsCard}>
          <Icon name="account" size={24} color="#2E7D32" />
          <View style={styles.settingsInfo}>
            <Text style={styles.settingsLabel}>Compte</Text>
            <Text style={styles.settingsValue}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Icon name="information" size={24} color="#2E7D32" />
          <View style={styles.settingsInfo}>
            <Text style={styles.settingsLabel}>Application</Text>
            <Text style={styles.settingsValue}>Pierre-P v1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonDanger]}
          onPress={handleLogout}
        >
          <Icon name="logout" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Système de gestion des présences paroissiales</Text>
        <Text style={styles.footerText}>© 2026 Pierre-P</Text>
      </View>
    </ScrollView>
  );
};

// Navigation Setup
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const MainAppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: true,
      headerStyle: {
        backgroundColor: '#2E7D32',
      },
      headerTintColor: '#FFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      tabBarActiveTintColor: '#2E7D32',
      tabBarInactiveTintColor: '#BDBDBD',
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'CheckIn') {
          iconName = focused ? 'check-circle' : 'check-circle-outline';
        } else if (route.name === 'History') {
          iconName = focused ? 'history' : 'history';
        } else if (route.name === 'Members') {
          iconName = focused ? 'account-multiple' : 'account-multiple-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'cog' : 'cog-outline';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="CheckIn"
      component={CheckInScreen}
      options={{
        title: 'Enregistrement',
        tabBarLabel: 'Enregistrement',
      }}
    />
    <Tab.Screen
      name="History"
      component={AttendanceHistoryScreen}
      options={{
        title: 'Historique',
        tabBarLabel: 'Historique',
      }}
    />
    <Tab.Screen
      name="Members"
      component={MembersScreen}
      options={{
        title: 'Membres',
        tabBarLabel: 'Membres',
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        title: 'Paramètres',
        tabBarLabel: 'Paramètres',
      }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#2E7D32',
      },
      headerTintColor: '#FFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="MainApp"
      component={MainAppTabs}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Main App Component
export default function App() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    marginVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: '#2E7D32',
  },
  buttonSuccess: {
    backgroundColor: '#4CAF50',
  },
  buttonDanger: {
    backgroundColor: '#F44336',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginTop: 10,
  },
  eventCard: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventCardSelected: {
    backgroundColor: '#E8F5E9',
    borderLeftColor: '#1B5E20',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 15,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  eventTime: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  eventNameSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  attendanceCard: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dateTime: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  memberCard: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 15,
  },
  memberNameCard: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  memberRole: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsInfo: {
    flex: 1,
    marginLeft: 15,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  settingsValue: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  footer: {
    paddingVertical: 30,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#BDBDBD',
    textAlign: 'center',
  },
});
