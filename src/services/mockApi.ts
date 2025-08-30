import { 
  User, 
  Hospital, 
  Donor, 
  Recipient, 
  UpdateRequest, 
  Match, 
  Alert, 
  AlertDelivery,
  BloodGroup,
  UrgencyLevel,
  IndividualProfile,
  DonationRequest
} from '../types';

// Mock data
const mockHospitals: Hospital[] = [
  {
    id: 'h1',
    name: 'City General Hospital',
    address: '123 Main St, City Center',
    phone: '+1-555-0101',
    email: 'contact@citygeneral.com',
    latitude: 40.7128,
    longitude: -74.0060,
    verificationStatus: 'verified',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'h2',
    name: 'Metropolitan Medical Center',
    address: '456 Oak Ave, Downtown',
    phone: '+1-555-0102',
    email: 'info@metromedical.com',
    latitude: 40.7580,
    longitude: -73.9855,
    verificationStatus: 'verified',
    createdAt: '2024-01-20T14:30:00Z'
  }
];

const mockDonors: Donor[] = [
  {
    id: 'd1',
    userId: 'u1',
    hospitalId: 'h1',
    name: 'John Smith',
    age: 35,
    bloodGroup: 'O+',
    medicalHistory: 'No significant medical history, regular blood donor',
    contactNumber: '+1-555-1001',
    address: '789 Pine St',
    latitude: 40.7505,
    longitude: -73.9934,
    isActive: true,
    lastUpdated: '2024-08-20T09:00:00Z',
    verificationStatus: 'verified'
  },
  {
    id: 'd2',
    userId: 'u2',
    hospitalId: 'h1',
    name: 'Sarah Johnson',
    age: 28,
    bloodGroup: 'A+',
    medicalHistory: 'Healthy blood donor, regular contributor',
    contactNumber: '+1-555-1002',
    address: '321 Elm St',
    latitude: 40.7614,
    longitude: -73.9776,
    isActive: true,
    lastUpdated: '2024-08-19T11:30:00Z',
    verificationStatus: 'verified'
  },
  {
    id: 'd3',
    userId: 'u3',
    hospitalId: 'h2',
    name: 'Michael Brown',
    age: 42,
    bloodGroup: 'B-',
    medicalHistory: 'Regular health checkups, available for blood donation',
    contactNumber: '+1-555-1003',
    address: '555 Maple Ave',
    latitude: 40.7282,
    longitude: -74.0776,
    isActive: true,
    lastUpdated: '2024-08-18T16:45:00Z',
    verificationStatus: 'verified'
  }
];

const mockRecipients: Recipient[] = [
  {
    id: 'r1',
    userId: 'u4',
    hospitalId: 'h1',
    name: 'Emily Davis',
    age: 45,
    bloodGroup: 'O+',
    urgencyLevel: 'high',
    medicalHistory: 'Scheduled surgery requiring blood transfusion',
    contactNumber: '+1-555-2001',
    address: '888 Cedar St',
    latitude: 40.7489,
    longitude: -73.9680,
    registrationDate: '2024-07-15T10:00:00Z',
    status: 'waiting'
  },
  {
    id: 'r2',
    userId: 'u5',
    hospitalId: 'h2',
    name: 'Robert Wilson',
    age: 38,
    bloodGroup: 'A+',
    urgencyLevel: 'critical',
    medicalHistory: 'Emergency surgery requiring immediate blood transfusion',
    contactNumber: '+1-555-2002',
    address: '999 Birch Ave',
    latitude: 40.7831,
    longitude: -73.9712,
    registrationDate: '2024-06-20T14:00:00Z',
    status: 'waiting'
  }
];

const mockUsers: User[] = [
  {
    id: 'staff1',
    email: 'staff@citygeneral.com',
    name: 'Dr. Jane Cooper',
    role: 'hospital_staff',
    hospitalId: 'h1',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'u1',
    email: 'john.smith@email.com',
    name: 'John Smith',
    role: 'individual',
    createdAt: '2024-02-01T12:00:00Z'
  },
  {
    id: 'u4',
    email: 'emily.davis@email.com',
    name: 'Emily Davis',
    role: 'individual',
    createdAt: '2024-07-15T10:00:00Z'
  }
];

// API simulation functions
export const mockApi = {
  // Authentication
  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Mock login logic
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return user;
  },

  // Donors
  getDonors: async (): Promise<Donor[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDonors;
  },

  getDonorById: async (id: string): Promise<Donor | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDonors.find(d => d.id === id) || null;
  },

  createDonor: async (donor: Omit<Donor, 'id' | 'lastUpdated'>): Promise<Donor> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newDonor: Donor = {
      ...donor,
      id: `d${Date.now()}`,
      lastUpdated: new Date().toISOString()
    };
    mockDonors.push(newDonor);
    return newDonor;
  },

  // Recipients
  getRecipients: async (): Promise<Recipient[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRecipients;
  },

  getRecipientById: async (id: string): Promise<Recipient | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRecipients.find(r => r.id === id) || null;
  },

  createRecipient: async (recipient: Omit<Recipient, 'id' | 'registrationDate'>): Promise<Recipient> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newRecipient: Recipient = {
      ...recipient,
      id: `r${Date.now()}`,
      registrationDate: new Date().toISOString()
    };
    mockRecipients.push(newRecipient);
    return newRecipient;
  },

  // Matching
  findMatches: async (recipientId: string): Promise<Match[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const recipient = mockRecipients.find(r => r.id === recipientId);
    if (!recipient) return [];

    // Mock matching logic - only blood compatibility for blood donation
    const compatibleDonors = mockDonors.filter(donor => {
      const bloodCompatible = isBloodCompatible(donor.bloodGroup, recipient.bloodGroup);
      return bloodCompatible && donor.isActive;
    });

    return compatibleDonors.map((donor, index) => ({
      id: `m${Date.now()}_${index}`,
      donorId: donor.id,
      recipientId: recipient.id,
      matchScore: Math.floor(Math.random() * 40) + 60, // Random score 60-100
      distance: Math.floor(Math.random() * 50) + 5, // Random distance 5-55 km
      compatibility: getCompatibilityReason(donor, recipient),
      reason: `Blood type compatible - ${donor.bloodGroup} can donate to ${recipient.bloodGroup}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    }));
  },

  // Alerts
  sendAlert: async (alert: Omit<Alert, 'id' | 'createdAt' | 'isActive'>): Promise<Alert> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const newAlert: Alert = {
      ...alert,
      id: `a${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Simulate alert delivery to compatible blood donors
    const compatibleDonors = mockDonors.filter(donor => {
      const bloodMatch = alert.targetBloodGroups.includes(donor.bloodGroup);
      return bloodMatch && donor.isActive;
    });

    // Mock delivery creation
    compatibleDonors.forEach(donor => {
      console.log(`Alert delivered to donor ${donor.name} via push notification`);
    });

    return newAlert;
  },

  // Update requests
  getUpdateRequests: async (): Promise<UpdateRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return []; // Mock empty for now
  },

  // Hospitals
  getHospitals: async (): Promise<Hospital[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockHospitals;
  }
};

// Helper functions
function isBloodCompatible(donorBlood: BloodGroup, recipientBlood: BloodGroup): boolean {
  const compatibility: Record<BloodGroup, BloodGroup[]> = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  };
  
  return compatibility[donorBlood]?.includes(recipientBlood) || false;
}

function getCompatibilityReason(donor: Donor, recipient: Recipient): string {
  const reasons = [];
  
  if (donor.bloodGroup === recipient.bloodGroup) {
    reasons.push('Exact blood type match');
  } else if (isBloodCompatible(donor.bloodGroup, recipient.bloodGroup)) {
    reasons.push('Blood type compatible');
  }
  
  return reasons.join(', ') || 'Compatible for blood donation';
}