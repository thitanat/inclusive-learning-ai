// Shared types for admin dashboard components
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  [key: string]: any;
}

export interface Session {
  _id: string;
  userId: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  subject?: string;
  lessonTopic?: string;
  level?: string;
  configStep?: number;
  createdAt?: string;
  numStudents?: number;
  studyPeriod?: string;
  
  // Nested content object
  content?: {
    finalIndicators?: string;
    interimIndicators?: string;
    keyContent?: string;
    learningArea?: string;
    lessonTopic?: string;
    level?: string;
    standard?: string;
    subject?: string;
  };
  
  // Key competencies object
  keyCompetencies?: {
    [key: string]: string;
  };
  
  // Learning objectives object
  objectives?: {
    [category: string]: string[] | string;
  };
  
  // Enhanced data object
  enhancedData?: {
    [key: string]: any;
  };
  
  // Lesson plan object
  lessonPlan?: {
    [activity: string]: any;
  };
  
  // Search metadata
  searchMetadata?: {
    searchPerformed?: boolean;
    enhancedProcesses?: any[];
    udlStrategies?: any[];
    inclusiveStrategies?: any[];
    studentType?: any[];
  };
  
  // Teaching materials
  teachingMaterials?: {
    [key: string]: string;
  };
  
  [key: string]: any;
}

export interface FinetuneData {
  _id: string;
  userId: string;
  step: number;
  userInfo?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  inputData?: {
    subject?: string;
    lessonTopic?: string;
  };
  feedback?: {
    overallScore?: number;
  };
  timestamp?: string;
  finetuningFormat?: any;
  [key: string]: any;
}
