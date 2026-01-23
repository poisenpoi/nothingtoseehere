import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import bcrypt from "bcryptjs";
import { Category, Course } from "@prisma/client";

async function main() {
  // ===== CLEAN DATABASE =====
  await prisma.workshopSubmission.deleteMany();
  await prisma.workshopRegistration.deleteMany();
  await prisma.courseItem.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.module.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.corporationVerification.deleteMany();
  await prisma.user.deleteMany();

  // ===== USERS =====
  const admin = await prisma.user.create({
    data: {
      email: "admin@edutia.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@edutia.com",
      password: await bcrypt.hash("student123", 10),
      role: "EDUCATEE",
    },
  });

  const corp = await prisma.user.create({
    data: {
      email: "corp@techcorp.com",
      password: await bcrypt.hash("corp123", 10),
      role: "CORPORATION",
    },
  });

  // ===== PROFILES =====
  await prisma.profile.createMany({
    data: [
      { userId: admin.id, gender: "MALE", bio: "Platform administrator" },
      {
        userId: student.id,
        gender: "FEMALE",
        pictureUrl: "/avatars/female.svg",
        bio: "Learner interested in technology",
      },
      {
        userId: corp.id,
        companyName: "TechCorp Solutions",
        companyWebsite: "https://techcorp.com",
        bio: "Enterprise technology solutions provider",
      },
    ],
  });

  const corpProfile = await prisma.profile.findFirstOrThrow({
    where: { userId: corp.id },
  });

  await prisma.corporationVerification.create({
    data: {
      profileId: corpProfile.id,
      verifiedAt: new Date(),
    },
  });

  // ===== CATEGORIES =====
  const categories = [
    "Software Development",
    "Data & AI",
    "Design & Creative",
    "IT & Infrastructure",
    "Business & Management",
  ];

  await prisma.category.createMany({
    data: categories.map((name) => ({
      name,
      slug: slugify(name),
    })),
  });

  const categoryList: Category[] = await prisma.category.findMany();
  const categoryMap = Object.fromEntries(
    categoryList.map((c) => [c.slug, c.id]),
  );

  // ===== COURSES =====
  await prisma.course.createMany({
    data: [
      {
        title: "Python for Data Analysis",
        slug: slugify("Python for Data Analysis"),
        description: "Analyze data using Python.",
        categoryId: categoryMap[slugify("Data & AI")],
        level: "BEGINNER",
        duration: 180,
        isPublished: true,
      },
      {
        title: "Machine Learning Fundamentals",
        slug: slugify("Machine Learning Fundamentals"),
        description: "Learn core machine learning concepts and algorithms.",
        categoryId: categoryMap[slugify("Data & AI")],
        level: "INTERMEDIATE",
        duration: 240,
        isPublished: true,
      },
      {
        title: "Deep Learning with TensorFlow",
        slug: slugify("Deep Learning with TensorFlow"),
        description: "Build deep learning models using TensorFlow.",
        categoryId: categoryMap[slugify("Data & AI")],
        level: "ADVANCED",
        duration: 300,
        isPublished: true,
      },
      {
        title: "Web Development with HTML, CSS, and JavaScript",
        slug: slugify("Web Development with HTML CSS and JavaScript"),
        description: "Build responsive websites from scratch.",
        categoryId: categoryMap[slugify("Software Development")],
        level: "BEGINNER",
        duration: 200,
        isPublished: true,
      },
      {
        title: "Backend Development with Node.js",
        slug: slugify("Backend Development with Node.js"),
        description: "Create RESTful APIs using Node.js and Express.",
        categoryId: categoryMap[slugify("Software Development")],
        level: "INTERMEDIATE",
        duration: 220,
        isPublished: true,
      },
      {
        title: "Database Design and SQL",
        slug: slugify("Database Design and SQL"),
        description:
          "Design relational databases and write efficient SQL queries.",
        categoryId: categoryMap[slugify("Software Development")],
        level: "BEGINNER",
        duration: 160,
        isPublished: true,
        avgRating: 5.0,
        reviewCount: 10,
      },
      {
        title: "System Design for Software Engineers",
        slug: slugify("System Design for Software Engineers"),
        description: "Learn scalable system design concepts and patterns.",
        categoryId: categoryMap[slugify("Software Development")],
        level: "ADVANCED",
        duration: 260,
        isPublished: true,
        avgRating: 3.0,
        reviewCount: 8,
      },
      {
        title: "UI/UX Design Basics",
        slug: slugify("UI UX Design Basics"),
        description:
          "Understand the fundamentals of user interface and user experience design.",
        categoryId: categoryMap[slugify("Design & Creative")],
        level: "BEGINNER",
        duration: 140,
        isPublished: true,
      },
      {
        title: "Mobile App Development with Flutter",
        slug: slugify("Mobile App Development with Flutter"),
        description: "Build cross-platform mobile applications using Flutter.",
        categoryId: categoryMap[slugify("Software Development")],
        level: "INTERMEDIATE",
        duration: 230,
        isPublished: true,
      },
      {
        title: "DevOps Fundamentals",
        slug: slugify("DevOps Fundamentals"),
        description:
          "Learn CI/CD, Docker, and basic cloud deployment practices.",
        categoryId: categoryMap[slugify("IT & Infrastructure")],
        level: "BEGINNER",
        duration: 190,
        isPublished: true,
      },
    ],
  });

  const courseList: Course[] = await prisma.course.findMany();
  const courseMap = Object.fromEntries(courseList.map((c) => [c.slug, c.id]));

  // ===== MODULES =====
  const module1 = await prisma.module.create({
    data: {
      title: "Python Basics",
      description:
        "Learn the fundamental concepts of Python programming including variables, data types, control structures, and functions.",
      content: `# Introduction to Python

Python is a versatile and beginner-friendly programming language used in web development, data science, automation, and more.

## What You'll Learn

- Variables and Data Types
- Control Flow (if/else, loops)
- Functions and Scope
- Lists, Tuples, and Dictionaries
- File I/O Operations

## Getting Started

First, let's understand variables in Python:

\`\`\`python
# Variable assignment
name = "Alice"
age = 25
is_student = True

print(f"Hello, {name}! You are {age} years old.")
\`\`\`

## Data Types

Python has several built-in data types:

1. **Numeric Types**: int, float, complex
2. **Text Type**: str
3. **Boolean Type**: bool
4. **Sequence Types**: list, tuple, range
5. **Mapping Type**: dict
6. **Set Types**: set, frozenset

### Example: Working with Lists

\`\`\`python
fruits = ["apple", "banana", "cherry"]
fruits.append("orange")
print(fruits)  # Output: ['apple', 'banana', 'cherry', 'orange']
\`\`\`

## Control Flow

Use conditional statements to make decisions:

\`\`\`python
temperature = 25

if temperature > 30:
    print("It's hot!")
elif temperature > 20:
    print("It's nice!")
else:
    print("It's cold!")
\`\`\`

## Functions

Define reusable code blocks with functions:

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

message = greet("Bob")
print(message)  # Output: Hello, Bob!
\`\`\`

## Practice Exercise

Try creating a function that calculates the area of a rectangle given its width and height.

## Next Steps

Once you're comfortable with these basics, move on to data analysis with Pandas!`,
      duration: 60,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      resources: [
        {
          title: "Python Official Documentation",
          url: "https://docs.python.org/3/",
          type: "documentation",
        },
        {
          title: "Python Cheat Sheet",
          url: "https://www.pythoncheatsheet.org/",
          type: "reference",
        },
        {
          title: "Practice Exercises",
          url: "https://www.hackerrank.com/domains/python",
          type: "exercise",
        },
      ],
    },
  });

  const module2 = await prisma.module.create({
    data: {
      title: "Data Analysis with Pandas",
      description:
        "Master data manipulation and analysis using the Pandas library. Learn to work with DataFrames, clean data, and perform statistical analysis.",
      content: `# Data Analysis with Pandas

Pandas is the most popular Python library for data manipulation and analysis.

## Introduction

Pandas provides powerful data structures like DataFrame and Series that make working with structured data intuitive and efficient.

## Installation

\`\`\`bash
pip install pandas
\`\`\`

## Importing Pandas

\`\`\`python
import pandas as pd
import numpy as np
\`\`\`

## Creating DataFrames

### From Dictionary

\`\`\`python
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'Diana'],
    'Age': [25, 30, 35, 28],
    'City': ['New York', 'London', 'Paris', 'Tokyo']
}

df = pd.DataFrame(data)
print(df)
\`\`\`

### From CSV File

\`\`\`python
df = pd.read_csv('data.csv')
\`\`\`

## Data Exploration

### Basic Information

\`\`\`python
# Display first 5 rows
print(df.head())

# Get dataframe info
print(df.info())

# Statistical summary
print(df.describe())

# Check for missing values
print(df.isnull().sum())
\`\`\`

## Data Selection

### Selecting Columns

\`\`\`python
# Single column
ages = df['Age']

# Multiple columns
subset = df[['Name', 'Age']]
\`\`\`

### Filtering Rows

\`\`\`python
# Filter by condition
young_people = df[df['Age'] < 30]

# Multiple conditions
result = df[(df['Age'] > 25) & (df['City'] == 'New York')]
\`\`\`

## Data Manipulation

### Adding Columns

\`\`\`python
df['Age_Next_Year'] = df['Age'] + 1
\`\`\`

### Sorting

\`\`\`python
df_sorted = df.sort_values('Age', ascending=False)
\`\`\`

### Grouping

\`\`\`python
city_avg_age = df.groupby('City')['Age'].mean()
\`\`\`

## Data Cleaning

### Handling Missing Values

\`\`\`python
# Drop rows with missing values
df_clean = df.dropna()

# Fill missing values
df_filled = df.fillna(0)

# Fill with column mean
df['Age'].fillna(df['Age'].mean(), inplace=True)
\`\`\`

### Removing Duplicates

\`\`\`python
df_unique = df.drop_duplicates()
\`\`\`

## Practical Example

Let's analyze a sales dataset:

\`\`\`python
# Load sales data
sales = pd.read_csv('sales.csv')

# Calculate total sales by product
product_sales = sales.groupby('Product')['Revenue'].sum()

# Find top 5 products
top_products = product_sales.sort_values(ascending=False).head(5)

# Calculate monthly trends
sales['Date'] = pd.to_datetime(sales['Date'])
monthly_sales = sales.groupby(sales['Date'].dt.month)['Revenue'].sum()

print("Top 5 Products:")
print(top_products)
\`\`\`

## Best Practices

1. Always explore your data first with \`head()\`, \`info()\`, and \`describe()\`
2. Handle missing values appropriately for your use case
3. Use vectorized operations instead of loops for better performance
4. Save your cleaned data to avoid repeating preprocessing

## Exercise

Download a sample CSV dataset and perform the following:
1. Load the data
2. Check for missing values
3. Calculate summary statistics
4. Create a new column based on existing ones
5. Group and aggregate the data

## Next Steps

Now that you understand Pandas basics, you're ready for the hands-on workshop where you'll apply these skills to real-world datasets!`,
      duration: 90,
      videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg",
      resources: [
        {
          title: "Pandas Documentation",
          url: "https://pandas.pydata.org/docs/",
          type: "documentation",
        },
        {
          title: "10 Minutes to Pandas",
          url: "https://pandas.pydata.org/docs/user_guide/10min.html",
          type: "tutorial",
        },
        {
          title: "Sample Datasets",
          url: "https://www.kaggle.com/datasets",
          type: "dataset",
        },
        {
          title: "Pandas Cheat Sheet",
          url: "https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf",
          type: "reference",
        },
      ],
    },
  });

  // ===== MODULE PROGRESS =====
  await prisma.moduleProgress.create({
    data: {
      userId: student.id,
      moduleId: module1.id,
      completedAt: new Date(),
    },
  });

  // ===== WORKSHOP =====
  const workshop = await prisma.workshop.create({
    data: {
      title: "Python Hands-on Workshop",
      instructions: "Complete the data analysis task.",
    },
  });

  // ===== WORKSHOP SUBMISSION
  await prisma.workshopSubmission.create({
    data: {
      submissionUrl: "test",
      score: 100,
      submittedAt: new Date(),
      userId: student.id,
      workshopId: workshop.id,
    },
  });

  // ===== COURSE TIMELINE =====
  await prisma.courseItem.createMany({
    data: [
      {
        courseId: courseMap[slugify("Python for Data Analysis")],
        slug: slugify(module1.title),
        position: 1,
        type: "MODULE",
        moduleId: module1.id,
      },
      {
        courseId: courseMap[slugify("Python for Data Analysis")],
        slug: slugify(module2.title),
        position: 2,
        type: "MODULE",
        moduleId: module2.id,
      },
      {
        courseId: courseMap[slugify("Python for Data Analysis")],
        slug: slugify(workshop.title),
        position: 3,
        type: "WORKSHOP",
        workshopId: workshop.id,
      },
    ],
  });

  // ===== WORKSHOP REGISTRATION =====
  await prisma.workshopRegistration.create({
    data: {
      userId: student.id,
      workshopId: workshop.id,
    },
  });

  // ===== ENROLLMENT =====
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: courseMap[slugify("Python for Data Analysis")],
      progressPercent: 100,
      status: "COMPLETED",
    },
  });

  // ===== LEARNING PATH =====
  const ds_path = await prisma.learningPath.create({
    data: {
      title: "Data Science",
      slug: slugify("Data Science"),
      description: "Data science path that provides with ...",
      isPublished: true,
    },
  });

  // ===== PATH TIMELINE =====
  await prisma.learningPathItem.createMany({
    data: [
      {
        position: 1,
        learningPathId: ds_path.id,
        courseId: courseMap[slugify("Python for Data Analysis")],
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
