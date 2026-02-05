# Requirements Document

## Introduction

The UAM-University GPA Tracker is a Next.js web application designed for students at UAM-University of Agriculture, Multan to track their academic progress through semester-based GPA calculations. The system provides both public GPA calculation tools and authenticated student dashboards with comprehensive course tracking, visual analytics, and personalized academic progress monitoring. The application implements the university's specific grading system with Quality Points based on marks obtained out of different totals (20, 40, 60, 80, 100).

## Glossary

- **System**: The UAM-University GPA Tracker web application
- **Student**: An authenticated user who tracks their academic progress
- **Public_User**: An unauthenticated visitor using the public GPA calculator
- **Course**: An academic course with a name, credit hours, total marks, and obtained marks
- **Semester**: An academic term containing multiple courses
- **Quality_Point**: A numerical value assigned based on marks obtained, used in GPA calculation
- **GPA**: Grade Point Average for a single semester
- **CGPA**: Cumulative Grade Point Average across all semesters
- **Dashboard**: The authenticated user's personalized interface showing academic data
- **Public_Calculator**: A standalone GPA calculation tool accessible without authentication
- **Grade**: A letter grade (A, B, C, D) assigned based on percentage of marks obtained
- **Credit_Hours**: The weight assigned to a course for GPA calculation
- **Total_Marks**: The maximum possible marks for a course (20, 40, 60, 80, or 100)
- **Obtained_Marks**: The actual marks a student received in a course

## Requirements

### Requirement 1: Public GPA Calculator

**User Story:** As a public user, I want to calculate my semester GPA without authentication, so that I can quickly determine my academic performance.

#### Acceptance Criteria

1. THE System SHALL provide a public-facing GPA calculator page accessible without authentication
2. WHEN a Public_User enters course data (obtained marks, total marks, credit hours), THE System SHALL calculate and display the semester GPA
3. THE System SHALL allow Public_Users to add multiple courses to a single calculation session
4. THE System SHALL allow Public_Users to remove courses from the calculation
5. WHEN calculating GPA, THE System SHALL use the formula: GPA = Sum of quality points ÷ Sum of credit hours
6. THE System SHALL display the calculated GPA immediately after course data entry
7. THE Public_Calculator SHALL NOT require course names for calculation

### Requirement 2: Student Authentication

**User Story:** As a student, I want to create an account and log in securely, so that I can access my personalized dashboard and save my academic data.

#### Acceptance Criteria

1. THE System SHALL provide user registration functionality using Better Auth
2. THE System SHALL provide user login functionality using Better Auth
3. WHEN a Student registers, THE System SHALL create a user account with secure credential storage
4. WHEN a Student logs in with valid credentials, THE System SHALL grant access to the authenticated dashboard
5. WHEN a Student logs in with invalid credentials, THE System SHALL deny access and display an error message
6. THE System SHALL maintain user session state across page navigation
7. THE System SHALL provide logout functionality that terminates the user session

### Requirement 3: Course Management

**User Story:** As a student, I want to add, edit, and delete courses for each semester, so that I can maintain accurate records of my academic progress.

#### Acceptance Criteria

1. WHEN a Student adds a course, THE System SHALL store the course name, credit hours, total marks, and obtained marks
2. THE System SHALL associate each course with a specific semester
3. THE System SHALL allow Students to edit course details after creation
4. THE System SHALL allow Students to delete courses from their records
5. WHEN a Student enters obtained marks, THE System SHALL validate that obtained marks do not exceed total marks
6. THE System SHALL validate that total marks are one of the allowed values (20, 40, 60, 80, or 100)
7. THE System SHALL validate that credit hours are positive numbers
8. WHEN course data is modified, THE System SHALL recalculate affected GPA and CGPA values immediately

### Requirement 4: Quality Point Calculation

**User Story:** As a student, I want the system to automatically calculate quality points based on UAM-University's grading system, so that my GPA is accurate according to university standards.

#### Acceptance Criteria

1. WHEN calculating quality points for marks out of 20, THE System SHALL use the university's quality point table for 20-mark courses
2. WHEN calculating quality points for marks out of 40, THE System SHALL use the university's quality point table for 40-mark courses
3. WHEN calculating quality points for marks out of 60, THE System SHALL use the university's quality point table for 60-mark courses
4. WHEN calculating quality points for marks out of 80, THE System SHALL use the university's quality point table for 80-mark courses
5. WHEN calculating quality points for marks out of 100, THE System SHALL use the university's quality point table for 100-mark courses
6. WHEN obtained marks are below the minimum passing threshold (40% of total marks), THE System SHALL assign a quality point of 0.00
7. THE System SHALL assign letter grades (A, B, C, D) based on percentage: D (40-49%), C (50-64%), B (65-79%), A (80-100%)

### Requirement 5: GPA and CGPA Calculation

**User Story:** As a student, I want the system to automatically calculate my semester GPA and cumulative CGPA, so that I can track my overall academic performance.

#### Acceptance Criteria

1. WHEN calculating semester GPA, THE System SHALL use the formula: GPA = Sum of quality points for semester ÷ Sum of credit hours for semester
2. WHEN calculating CGPA, THE System SHALL use the formula: CGPA = Sum of quality points from all semesters ÷ Sum of credit hours from all semesters
3. THE System SHALL recalculate GPA when any course in a semester is added, modified, or deleted
4. THE System SHALL recalculate CGPA when any course in any semester is added, modified, or deleted
5. THE System SHALL display GPA values rounded to two decimal places
6. WHEN a semester has no courses, THE System SHALL display a GPA of 0.00 for that semester

### Requirement 6: Student Dashboard

**User Story:** As a student, I want a personalized dashboard that displays my academic data in an organized manner, so that I can easily view and analyze my performance.

#### Acceptance Criteria

1. WHEN a Student accesses the dashboard, THE System SHALL display all semesters with their respective courses
2. THE System SHALL display courses in tabular format showing course name, credit hours, total marks, obtained marks, grade, and quality points
3. THE System SHALL display the calculated GPA for each semester
4. THE System SHALL display the overall CGPA across all semesters
5. THE System SHALL organize courses by semester in chronological order
6. THE Dashboard SHALL include an integrated GPA calculator for quick calculations
7. WHEN the Dashboard is accessed, THE System SHALL load only the authenticated student's data

### Requirement 7: Visual Analytics

**User Story:** As a student, I want to see visual representations of my academic performance, so that I can quickly identify trends and patterns in my progress.

#### Acceptance Criteria

1. THE System SHALL display bar charts showing GPA per semester
2. THE System SHALL display line charts showing GPA trends across semesters
3. THE System SHALL update charts automatically when course data changes
4. THE System SHALL use a blue color scheme consistent with the application design
5. WHEN a Student has no course data, THE System SHALL display an empty state message instead of charts

### Requirement 8: Landing Page

**User Story:** As a visitor, I want to see a professional landing page that explains the application's features, so that I can understand its value before signing up.

#### Acceptance Criteria

1. THE System SHALL display a landing page as the default route for unauthenticated users
2. THE Landing_Page SHALL include sections describing key features of the application
3. THE Landing_Page SHALL include call-to-action buttons for registration and login
4. THE Landing_Page SHALL include navigation to the public GPA calculator
5. THE Landing_Page SHALL follow professional design guidelines with a blue color scheme
6. THE Landing_Page SHALL be responsive and display correctly on mobile and desktop devices

### Requirement 9: Data Persistence

**User Story:** As a student, I want my academic data to be saved permanently, so that I can access it across sessions and devices.

#### Acceptance Criteria

1. WHEN a Student adds a course, THE System SHALL persist the course data to NeonDB using Prisma ORM
2. WHEN a Student modifies a course, THE System SHALL update the course data in NeonDB
3. WHEN a Student deletes a course, THE System SHALL remove the course data from NeonDB
4. THE System SHALL associate all course data with the authenticated student's user ID
5. WHEN a Student logs in, THE System SHALL retrieve all their course data from NeonDB
6. THE System SHALL ensure data integrity through database constraints and validation

### Requirement 10: User Interface Design

**User Story:** As a user, I want an attractive and professional interface that follows modern design principles, so that I have a pleasant experience using the application.

#### Acceptance Criteria

1. THE System SHALL use a blue color scheme as the primary design theme
2. THE System SHALL follow web design guidelines from vercel-labs/agent-skills
3. THE System SHALL follow frontend design principles from anthropics/skills
4. THE System SHALL follow Vercel React best practices from vercel-labs/agent-skills
5. THE System SHALL follow UI/UX principles from nextlevelbuilder/ui-ux-pro-max-skill
6. THE System SHALL provide responsive layouts that work on mobile, tablet, and desktop devices
7. THE System SHALL use consistent typography, spacing, and component styling throughout the application
8. THE System SHALL provide clear visual feedback for user interactions (button clicks, form submissions, loading states)
9. THE System SHALL use shadcn/ui component library for all UI components
10. THE System SHALL use Lucide icons for all iconography throughout the application

### Requirement 11: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I can understand and resolve issues.

#### Acceptance Criteria

1. WHEN a validation error occurs, THE System SHALL display a descriptive error message near the relevant input field
2. WHEN a database operation fails, THE System SHALL display a user-friendly error message
3. WHEN authentication fails, THE System SHALL display a clear error message indicating the reason
4. WHEN a network error occurs, THE System SHALL display a message indicating connectivity issues
5. THE System SHALL log errors to the console for debugging purposes
6. THE System SHALL prevent application crashes by handling errors gracefully

### Requirement 12: Semester Management

**User Story:** As a student, I want to organize my courses by semester, so that I can track my progress over time.

#### Acceptance Criteria

1. THE System SHALL allow Students to create new semesters
2. THE System SHALL allow Students to name semesters (e.g., "Fall 2023", "Spring 2024")
3. THE System SHALL associate each course with exactly one semester
4. THE System SHALL allow Students to view courses grouped by semester
5. THE System SHALL calculate and display GPA for each semester independently
6. THE System SHALL allow Students to delete semesters and all associated courses
