# Design Document: UAM-University GPA Tracker

## Overview

The UAM-University GPA Tracker is a full-stack Next.js application that provides GPA calculation and academic progress tracking for students at UAM-University of Agriculture, Multan. The system consists of three main user-facing components: a public GPA calculator, an authentication system, and a comprehensive student dashboard with visual analytics.

The application implements the university's specific grading system with Quality Points mapped to marks obtained out of different totals (20, 40, 60, 80, 100). The architecture follows Next.js App Router conventions with server components, server actions for data mutations, and client components for interactive features.

## Architecture

### Technology Stack

- **Frontend Framework**: Next.js 14+ (App Router)
- **UI Components**: React with TypeScript
- **Component Library**: shadcn/ui (with Radix UI primitives)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom blue theme
- **Authentication**: Better Auth
- **Database**: NeonDB (PostgreSQL)
- **ORM**: Prisma
- **Charts**: Recharts or Chart.js
- **Form Handling**: React Hook Form with Zod validation

### Application Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (public)/
│   ├── page.tsx (landing page)
│   └── calculator/
│       └── page.tsx (public GPA calculator)
├── dashboard/
│   ├── layout.tsx (protected layout)
│   ├── page.tsx (main dashboard)
│   └── semester/
│       └── [id]/
│           └── page.tsx (semester detail)
├── api/
│   └── auth/
│       └── [...all]/route.ts (Better Auth handler)
└── actions/
    ├── course-actions.ts
    ├── semester-actions.ts
    └── gpa-actions.ts

lib/
├── db.ts (Prisma client)
├── auth.ts (Better Auth config)
├── gpa-calculator.ts (core GPA logic)
└── quality-points.ts (quality point tables)

components/
├── ui/ (shadcn/ui components)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── table.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   └── ... (other shadcn components)
├── landing/ (landing page sections)
├── calculator/ (calculator components)
└── dashboard/ (dashboard components)

prisma/
└── schema.prisma
```

### Data Flow

1. **Public Calculator**: Client-side calculation using imported GPA logic, no database interaction
2. **Authentication**: Better Auth handles session management with database-backed user storage
3. **Dashboard**: Server components fetch data, server actions handle mutations, client components provide interactivity
4. **Real-time Updates**: Optimistic UI updates with server action revalidation

## Components and Interfaces

### Database Schema (Prisma)

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  name      String?
  password  String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  semesters Semester[]
}

model Semester {
  id        String   @id @default(cuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  courses   Course[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model Course {
  id            String   @id @default(cuid())
  name          String
  creditHours   Float
  totalMarks    Int
  obtainedMarks Float
  semesterId    String
  semester      Semester @relation(fields: [semesterId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([semesterId])
}
```

### Core Types (TypeScript)

```typescript
// Quality Point Mapping
type TotalMarksType = 20 | 40 | 60 | 80 | 100;

type QualityPointEntry = {
  marks: number;
  qualityPoint: number;
  grade: "A" | "B" | "C" | "D" | "F";
};

type QualityPointTable = {
  [key in TotalMarksType]: QualityPointEntry[];
};

// Course Data
type CourseInput = {
  name?: string; // Optional for public calculator
  creditHours: number;
  totalMarks: TotalMarksType;
  obtainedMarks: number;
};

type CourseWithQP = CourseInput & {
  qualityPoint: number;
  grade: string;
  percentage: number;
};

// GPA Calculation Result
type GPAResult = {
  gpa: number;
  totalQualityPoints: number;
  totalCreditHours: number;
  courses: CourseWithQP[];
};

// Semester Data
type SemesterData = {
  id: string;
  name: string;
  courses: CourseWithQP[];
  gpa: number;
};

// Dashboard Data
type DashboardData = {
  semesters: SemesterData[];
  cgpa: number;
  totalCreditHours: number;
  totalQualityPoints: number;
};
```

### Quality Point Tables

The system maintains five lookup tables (one for each total marks type: 20, 40, 60, 80, 100) that map obtained marks to quality points and letter grades. These tables are implemented as constant objects in `lib/quality-points.ts`.

**Implementation Strategy:**

- Each table is a sorted array of `QualityPointEntry` objects
- Lookup function uses binary search or linear scan to find the appropriate quality point
- For marks below minimum passing (40% of total), quality point is 0.00 and grade is 'F'

**Example structure:**

```typescript
const QUALITY_POINTS_20: QualityPointEntry[] = [
  { marks: 8, qualityPoint: 1.0, grade: "D" },
  { marks: 9, qualityPoint: 1.5, grade: "D" },
  { marks: 10, qualityPoint: 2.0, grade: "C" },
  // ... rest of table
  { marks: 16, qualityPoint: 4.0, grade: "A" },
];
```

### GPA Calculator Module

**Core Functions:**

```typescript
// Get quality point for given marks and total
function getQualityPoint(
  obtainedMarks: number,
  totalMarks: TotalMarksType,
): { qualityPoint: number; grade: string; percentage: number };

// Calculate GPA for a set of courses
function calculateGPA(courses: CourseInput[]): GPAResult;

// Calculate CGPA across multiple semesters
function calculateCGPA(semesters: SemesterData[]): number;

// Validate course input
function validateCourseInput(course: CourseInput): {
  valid: boolean;
  errors: string[];
};
```

**Algorithm for `getQualityPoint`:**

1. Calculate percentage: (obtainedMarks / totalMarks) × 100
2. If percentage < 40%, return { qualityPoint: 0.00, grade: 'F', percentage }
3. Look up quality point table for the given totalMarks
4. Find the entry where obtainedMarks matches or falls within range
5. Return the corresponding quality point, grade, and percentage

**Algorithm for `calculateGPA`:**

1. Validate all course inputs
2. For each course, get quality point using `getQualityPoint`
3. Calculate total quality points: sum of (qualityPoint × creditHours) for each course
4. Calculate total credit hours: sum of creditHours for all courses
5. Calculate GPA: totalQualityPoints ÷ totalCreditHours
6. Return GPAResult with GPA rounded to 2 decimal places

**Algorithm for `calculateCGPA`:**

1. Sum total quality points across all semesters
2. Sum total credit hours across all semesters
3. Calculate CGPA: totalQualityPoints ÷ totalCreditHours
4. Return CGPA rounded to 2 decimal places

### Public GPA Calculator Component

**Location:** `app/(public)/calculator/page.tsx`

**Features:**

- Client-side component with local state management
- Dynamic course list (add/remove courses)
- Real-time GPA calculation as user types
- No authentication required
- No course names needed

**State Management:**

```typescript
type CalculatorCourse = {
  id: string; // local UUID
  creditHours: number;
  totalMarks: TotalMarksType;
  obtainedMarks: number;
};

const [courses, setCourses] = useState<CalculatorCourse[]>([]);
const [result, setResult] = useState<GPAResult | null>(null);
```

**User Flow:**

1. User clicks "Add Course" button
2. Form appears with inputs: credit hours, total marks (dropdown), obtained marks
3. User enters data and clicks "Calculate" or data auto-calculates on change
4. GPA displays with breakdown showing each course's quality point and grade
5. User can add more courses or remove existing ones
6. GPA recalculates automatically

### Authentication System

**Better Auth Configuration:**

- Email/password authentication
- Session-based authentication with cookies
- Protected routes using middleware
- User registration with password hashing
- Login with credential validation

**Protected Route Middleware:**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession(request);

  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

### Dashboard Components

**Main Dashboard (`app/dashboard/page.tsx`):**

- Server component that fetches user's semester data
- Displays overview cards: CGPA, total credit hours, number of semesters
- Lists all semesters with their GPAs
- Includes integrated calculator component
- Shows visual analytics (charts)

**Semester Table Component:**

- Displays courses in tabular format
- Columns: Course Name, Credit Hours, Total Marks, Obtained Marks, Grade, Quality Points
- Inline edit/delete actions
- Add course button
- Semester GPA display

**Visual Analytics Component:**

- Bar chart: GPA per semester
- Line chart: GPA trend over time
- Uses Recharts library
- Blue color scheme
- Responsive design

**Integrated Calculator Component:**

- Similar to public calculator but can save results as a new semester
- Pre-fills with current semester data for quick recalculation
- "Save to Dashboard" button to persist calculations

### Server Actions

**Course Actions (`app/actions/course-actions.ts`):**

```typescript
"use server";

async function createCourse(
  semesterId: string,
  data: CourseInput,
): Promise<Course>;
async function updateCourse(
  courseId: string,
  data: Partial<CourseInput>,
): Promise<Course>;
async function deleteCourse(courseId: string): Promise<void>;
```

**Semester Actions (`app/actions/semester-actions.ts`):**

```typescript
"use server";

async function createSemester(userId: string, name: string): Promise<Semester>;
async function getSemesterWithCourses(
  semesterId: string,
): Promise<SemesterData>;
async function getAllSemesters(userId: string): Promise<SemesterData[]>;
async function deleteSemester(semesterId: string): Promise<void>;
```

**Implementation Details:**

- All actions validate user authentication
- Actions use Prisma for database operations
- Actions revalidate relevant paths after mutations
- Actions return typed results or throw errors

### Landing Page

**Sections:**

1. **Hero Section**: Headline, subheadline, CTA buttons (Login, Register, Try Calculator)
2. **Features Section**: Cards highlighting key features (GPA tracking, visual analytics, public calculator)
3. **How It Works**: Step-by-step guide with icons
4. **About Section**: Information about UAM-University grading system
5. **Footer**: Links, contact info, copyright

**Design Principles:**

- Professional blue color scheme (primary: #1e40af, secondary: #3b82f6, accent: #60a5fa)
- Clean, modern typography (Inter or similar sans-serif)
- Ample white space
- Smooth animations and transitions
- Responsive grid layouts
- High-quality imagery or illustrations
- Clear visual hierarchy
- Use shadcn/ui components for consistent, accessible UI
- Use Lucide icons for all iconography (e.g., ChevronRight, User, Calculator, BarChart, etc.)

## Data Models

### User Model

- **id**: Unique identifier (CUID)
- **email**: Unique email address for authentication
- **name**: Optional display name
- **password**: Hashed password
- **semesters**: One-to-many relationship with Semester model
- **createdAt**: Timestamp of account creation
- **updatedAt**: Timestamp of last update

### Semester Model

- **id**: Unique identifier (CUID)
- **name**: Semester name (e.g., "Fall 2023")
- **userId**: Foreign key to User
- **courses**: One-to-many relationship with Course model
- **createdAt**: Timestamp of creation
- **updatedAt**: Timestamp of last update

### Course Model

- **id**: Unique identifier (CUID)
- **name**: Course name
- **creditHours**: Number of credit hours (positive float)
- **totalMarks**: Total possible marks (20, 40, 60, 80, or 100)
- **obtainedMarks**: Marks obtained by student (float, 0 to totalMarks)
- **semesterId**: Foreign key to Semester
- **createdAt**: Timestamp of creation
- **updatedAt**: Timestamp of last update

**Constraints:**

- obtainedMarks must be ≤ totalMarks
- totalMarks must be one of: 20, 40, 60, 80, 100
- creditHours must be > 0
- Cascade delete: deleting a user deletes their semesters and courses
- Cascade delete: deleting a semester deletes its courses

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: GPA Calculation Formula Correctness

_For any_ set of courses with valid credit hours and quality points, calculating the GPA should produce a result equal to the sum of (quality points × credit hours) divided by the sum of credit hours, rounded to 2 decimal places.

**Validates: Requirements 1.2, 5.1**

### Property 2: CGPA Calculation Formula Correctness

_For any_ set of semesters with courses, calculating the CGPA should produce a result equal to the sum of all quality points across all semesters divided by the sum of all credit hours across all semesters, rounded to 2 decimal places.

**Validates: Requirements 5.2**

### Property 3: Quality Point Table Lookup Correctness

_For any_ valid obtained marks and total marks combination (where total marks is 20, 40, 60, 80, or 100), the quality point lookup should return the correct quality point, grade, and percentage according to the university's quality point tables for all five total marks types.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 4: Failing Grade Quality Point Assignment

_For any_ course where the obtained marks are less than 40% of the total marks, the quality point should be 0.00 and the grade should be 'F'.

**Validates: Requirements 4.6**

### Property 5: Letter Grade Assignment by Percentage

_For any_ course with a calculated percentage, the letter grade should be: D for 40-49%, C for 50-64%, B for 65-79%, and A for 80-100%.

**Validates: Requirements 4.7**

### Property 6: Course Addition Persistence

_For any_ authenticated student and valid course data (name, credit hours, total marks, obtained marks, semester ID), adding a course should create a database record that can be retrieved with all fields intact.

**Validates: Requirements 3.1, 9.1**

### Property 7: Course Update Persistence

_For any_ existing course, updating any of its fields (name, credit hours, total marks, obtained marks) should persist the changes to the database and be retrievable with the updated values.

**Validates: Requirements 3.3, 9.2**

### Property 8: Course Deletion Persistence

_For any_ existing course, deleting it should remove the course from the database such that subsequent queries do not return it.

**Validates: Requirements 3.4, 9.3**

### Property 9: Course-Semester Association Integrity

_For any_ course in the system, it should be associated with exactly one semester, and that semester should belong to the authenticated user who created it.

**Validates: Requirements 3.2, 9.4, 12.3**

### Property 10: Obtained Marks Validation

_For any_ course input where obtained marks exceed total marks, the validation should reject the input and return an error.

**Validates: Requirements 3.5**

### Property 11: Total Marks Validation

_For any_ course input where total marks is not one of the allowed values (20, 40, 60, 80, 100), the validation should reject the input and return an error.

**Validates: Requirements 3.6**

### Property 12: Credit Hours Validation

_For any_ course input where credit hours are zero or negative, the validation should reject the input and return an error.

**Validates: Requirements 3.7**

### Property 13: GPA Recalculation on Course Modification

_For any_ semester, when a course is added, modified, or deleted, the semester's GPA should be recalculated and reflect the changes.

**Validates: Requirements 5.3**

### Property 14: CGPA Recalculation on Course Modification

_For any_ student's academic record, when a course in any semester is added, modified, or deleted, the CGPA should be recalculated and reflect the changes.

**Validates: Requirements 5.4**

### Property 15: GPA Precision

_For any_ calculated GPA or CGPA value, the result should be formatted with exactly 2 decimal places.

**Validates: Requirements 5.5**

### Property 16: Public Calculator Course Management

_For any_ public calculator session, adding a course should increase the course list length by 1, and removing a course should decrease the course list length by 1.

**Validates: Requirements 1.3, 1.4**

### Property 17: Public Calculator Optional Course Names

_For any_ set of courses in the public calculator without course names provided, the GPA calculation should complete successfully and return a valid result.

**Validates: Requirements 1.7**

### Property 18: User Data Isolation

_For any_ authenticated student accessing the dashboard, the system should load and display only courses and semesters associated with that student's user ID, not data from other users.

**Validates: Requirements 6.7**

### Property 19: Dashboard Data Completeness

_For any_ course displayed in the dashboard, the rendered output should include all required fields: course name, credit hours, total marks, obtained marks, grade, and quality points.

**Validates: Requirements 6.2**

### Property 20: Semester Chronological Ordering

_For any_ student's dashboard with multiple semesters, the semesters should be displayed in chronological order based on creation date or semester name.

**Validates: Requirements 6.5**

### Property 21: Semester Creation and Naming

_For any_ authenticated student, creating a semester with a name should persist the semester to the database with the specified name and associate it with the student's user ID.

**Validates: Requirements 12.1, 12.2**

### Property 22: Semester Cascade Deletion

_For any_ semester with associated courses, deleting the semester should also delete all courses associated with that semester from the database.

**Validates: Requirements 12.6**

### Property 23: Independent Semester GPA Calculation

_For any_ two different semesters belonging to the same student, the GPA calculated for each semester should be independent and based only on the courses within that specific semester.

**Validates: Requirements 12.5**

### Property 24: User Registration Creates Account

_For any_ valid registration data (email, password), the registration process should create a new user record in the database with a unique user ID and hashed password.

**Validates: Requirements 2.3**

### Property 25: Session Persistence Across Requests

_For any_ authenticated user, the session should remain valid across multiple page navigations until explicitly logged out.

**Validates: Requirements 2.6**

### Property 26: Chart Data Reactivity

_For any_ dashboard with visual charts, when course data changes (add, edit, delete), the chart data should update to reflect the new GPA values.

**Validates: Requirements 7.3**

### Property 27: Validation Error Display

_For any_ form input that fails validation, the system should display a descriptive error message indicating what validation rule was violated.

**Validates: Requirements 11.1**

### Property 28: Database Error Handling

_For any_ database operation that fails (connection error, constraint violation), the system should catch the error and display a user-friendly error message without crashing.

**Validates: Requirements 11.2**

### Property 29: Error Logging

_For any_ error that occurs in the system (validation, database, authentication), the error should be logged to the console with sufficient detail for debugging.

**Validates: Requirements 11.5**

### Property 30: Database Constraint Enforcement

_For any_ attempt to create invalid data (e.g., course without semester, duplicate email), the database constraints should reject the operation and return an error.

**Validates: Requirements 9.6**

### Property 31: Course Grouping by Semester

_For any_ student's dashboard data, courses should be grouped by their associated semester, with each semester containing only its own courses.

**Validates: Requirements 12.4**

## Error Handling

### Validation Errors

**Client-Side Validation:**

- Use Zod schemas for form validation
- Display inline error messages below form fields
- Prevent form submission until all validations pass
- Provide real-time validation feedback as user types

**Server-Side Validation:**

- Validate all inputs in server actions before database operations
- Return structured error objects with field-specific messages
- Use Prisma's built-in validation for database constraints
- Handle edge cases (empty strings, null values, out-of-range numbers)

**Validation Rules:**

- Credit hours: Must be positive number (> 0)
- Total marks: Must be exactly 20, 40, 60, 80, or 100
- Obtained marks: Must be between 0 and total marks (inclusive)
- Course name: Required for dashboard, optional for public calculator
- Semester name: Required, non-empty string
- Email: Valid email format, unique in database
- Password: Minimum 8 characters (configurable in Better Auth)

### Database Errors

**Connection Errors:**

- Catch Prisma connection errors
- Display message: "Unable to connect to database. Please try again."
- Log full error details to console
- Implement retry logic for transient failures

**Constraint Violations:**

- Unique constraint (duplicate email): "This email is already registered"
- Foreign key constraint: "Invalid semester or user reference"
- Not null constraint: "Required field is missing"

**Query Errors:**

- Record not found: Return null and handle gracefully in UI
- Invalid query: Log error and return empty result set
- Timeout: Display message about slow connection

### Authentication Errors

**Login Errors:**

- Invalid credentials: "Invalid email or password"
- Account not found: "No account found with this email"
- Session expired: Redirect to login with message

**Authorization Errors:**

- Unauthorized access: Redirect to login page
- Insufficient permissions: "You don't have permission to access this resource"
- CSRF token mismatch: "Security validation failed. Please try again."

### Application Errors

**Calculation Errors:**

- Division by zero (no credit hours): Return GPA of 0.00
- Invalid quality point lookup: Log error and return 0.00
- NaN or Infinity results: Clamp to 0.00

**UI Errors:**

- Component render errors: Use Error Boundaries to catch and display fallback UI
- Missing data: Display empty states with helpful messages
- Loading failures: Show retry button

**Network Errors:**

- Fetch failures: Display "Network error. Please check your connection."
- Timeout: "Request timed out. Please try again."
- Server errors (500): "Something went wrong. Please try again later."

### Error Recovery

**Optimistic UI Updates:**

- Show immediate feedback for user actions
- Revert changes if server action fails
- Display error message and allow retry

**Graceful Degradation:**

- If charts fail to load, still show tabular data
- If calculator fails, show manual calculation instructions
- If session expires, save form data and restore after re-login

## Testing Strategy

### Unit Testing

**Core Logic Tests:**

- Quality point lookup for all five tables (20, 40, 60, 80, 100)
- GPA calculation with various course combinations
- CGPA calculation across multiple semesters
- Validation functions for all input types
- Grade assignment based on percentage ranges
- Edge cases: empty courses, zero credit hours, failing grades

**Component Tests:**

- Form components with validation
- Calculator component with add/remove courses
- Table components with data display
- Chart components with data updates
- Authentication forms

**Integration Tests:**

- Server actions with database operations
- Authentication flow (register, login, logout)
- Protected route access
- Data persistence and retrieval
- Cascade deletion (semester → courses)

### Property-Based Testing

**Configuration:**

- Use fast-check library for TypeScript/JavaScript
- Minimum 100 iterations per property test
- Each test tagged with: **Feature: mns-university-gpa-tracker, Property {number}: {property_text}**

**Property Test Coverage:**

- All 31 correctness properties listed above
- Generate random course data with valid constraints
- Generate random semester structures
- Test calculation formulas with arbitrary valid inputs
- Test validation with arbitrary invalid inputs
- Test data persistence with random CRUD operations

**Generator Strategies:**

- Course generator: random credit hours (0.5-5.0), random total marks (20|40|60|80|100), random obtained marks (0 to total)
- Semester generator: random name, random number of courses (0-20)
- User generator: random email, random password
- Edge case generators: boundary values, empty collections, maximum values

**Property Test Examples:**

```typescript
// Property 1: GPA Calculation Formula
test("Feature: mns-university-gpa-tracker, Property 1: GPA calculation formula correctness", () => {
  fc.assert(
    fc.property(
      fc.array(courseGenerator(), { minLength: 1, maxLength: 10 }),
      (courses) => {
        const result = calculateGPA(courses);
        const expectedTotalQP = courses.reduce(
          (sum, c) => sum + c.qualityPoint * c.creditHours,
          0,
        );
        const expectedTotalCH = courses.reduce(
          (sum, c) => sum + c.creditHours,
          0,
        );
        const expectedGPA = Number(
          (expectedTotalQP / expectedTotalCH).toFixed(2),
        );
        expect(result.gpa).toBe(expectedGPA);
      },
    ),
    { numRuns: 100 },
  );
});
```

### End-to-End Testing

**User Flows:**

- Public calculator: Add courses, calculate GPA, remove courses
- Registration: Create account, verify email, login
- Dashboard: View semesters, add course, edit course, delete course
- Visual analytics: View charts, verify data updates
- Session management: Login, navigate pages, logout

**Tools:**

- Playwright or Cypress for E2E tests
- Test against local development environment
- Mock database with seed data
- Test responsive layouts on different viewports

### Testing Best Practices

**Balance:**

- Unit tests for specific examples and edge cases
- Property tests for universal correctness across all inputs
- Integration tests for component interactions
- E2E tests for critical user flows

**Coverage Goals:**

- 80%+ code coverage for core logic (GPA calculator, quality point lookup)
- 100% coverage for validation functions
- All 31 correctness properties implemented as property tests
- All critical user flows covered by E2E tests

**Continuous Testing:**

- Run unit and property tests on every commit
- Run integration tests before deployment
- Run E2E tests on staging environment
- Monitor test execution time and optimize slow tests
