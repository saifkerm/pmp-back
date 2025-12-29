import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('');

  // Nettoyage de la base (dev seulement)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning database...');
    
    const tables = [
      'notifications',
      'notification_preferences',
      'activities',
      'comments',
      'attachments',
      'subtasks',
      'task_labels',
      'task_assignees',
      'task_watchers',
      'task_dependencies',
      'tasks',
      'columns',
      'boards',
      'labels',
      'project_members',
      'project_invitations',
      'projects',
      'user_profiles',
      'users',
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
    
    console.log('✅ Database cleaned');
    console.log('');
  }

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Créer les utilisateurs
  console.log('👤 Creating users...');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pmp.dev',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'System',
      role: Role.ADMIN,
      profile: {
        create: {
          bio: 'System administrator',
          timezone: 'Europe/Paris',
          language: 'fr',
          theme: 'dark',
        },
      },
      notificationPrefs: {
        create: {},
      },
    },
  });

  const john = await prisma.user.create({
    data: {
      email: 'john.doe@pmp.dev',
      password: passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
      profile: {
        create: {
          bio: 'Full-stack developer passionate about clean code',
          timezone: 'Europe/Paris',
          language: 'en',
          theme: 'light',
        },
      },
      notificationPrefs: {
        create: {},
      },
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: 'jane.smith@pmp.dev',
      password: passwordHash,
      firstName: 'Jane',
      lastName: 'Smith',
      role: Role.USER,
      profile: {
        create: {
          bio: 'Product designer focused on user experience',
          timezone: 'America/New_York',
          language: 'en',
          theme: 'auto',
        },
      },
      notificationPrefs: {
        create: {},
      },
    },
  });

  console.log(`✅ Created ${3} users`);
  console.log('');

  // Créer un projet
  console.log('📊 Creating project...');
  
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      key: 'WEB',
      description: 'Complete redesign of the company website with modern tech stack',
      ownerId: admin.id,
      color: '#3B82F6',
      visibility: 'TEAM',
      members: {
        create: [
          { userId: john.id, role: 'ADMIN' },
          { userId: jane.id, role: 'MEMBER' },
        ],
      },
      labels: {
        create: [
          { name: 'Bug', color: '#EF4444', description: 'Something is broken' },
          { name: 'Feature', color: '#10B981', description: 'New feature request' },
          { name: 'Design', color: '#8B5CF6', description: 'Design related' },
          { name: 'Documentation', color: '#F59E0B', description: 'Documentation improvements' },
          { name: 'Enhancement', color: '#06B6D4', description: 'Improvements to existing features' },
        ],
      },
      boards: {
        create: {
          name: 'Main Board',
          position: 0,
          type: 'KANBAN',
          columns: {
            create: [
              { name: 'Backlog', position: 0, color: '#64748B' },
              { name: 'To Do', position: 1, color: '#3B82F6' },
              { name: 'In Progress', position: 2, color: '#F59E0B' },
              { name: 'Review', position: 3, color: '#8B5CF6' },
              { name: 'Done', position: 4, color: '#10B981' },
            ],
          },
        },
      },
    },
    include: {
      boards: {
        include: {
          columns: true,
        },
      },
      labels: true,
    },
  });

  console.log(`✅ Created project: ${project.name} (${project.key})`);
  console.log('');

  // Créer des tâches
  console.log('✅ Creating tasks...');
  
  const columns = project.boards[0].columns;
  const backlogColumn = columns.find((c) => c.name === 'Backlog')!;
  const todoColumn = columns.find((c) => c.name === 'To Do')!;
  const inProgressColumn = columns.find((c) => c.name === 'In Progress')!;
  const reviewColumn = columns.find((c) => c.name === 'Review')!;
  const doneColumn = columns.find((c) => c.name === 'Done')!;

  const bugLabel = project.labels.find((l) => l.name === 'Bug')!;
  const featureLabel = project.labels.find((l) => l.name === 'Feature')!;
  const designLabel = project.labels.find((l) => l.name === 'Design')!;

  // Task 1 - In Progress
  const task1 = await prisma.task.create({
    data: {
      key: 'WEB-1',
      title: 'Setup project structure',
      description: 'Initialize the project with NestJS microservices architecture and Angular frontend',
      columnId: inProgressColumn.id,
      position: 0,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      points: 5,
      creatorId: admin.id,
      startDate: new Date(),
      estimatedHours: 16,
      assignees: {
        create: {
          userId: john.id,
          assignedBy: admin.id,
        },
      },
      labels: {
        create: {
          labelId: featureLabel.id,
        },
      },
      subtasks: {
        create: [
          { title: 'Setup NX monorepo', position: 0, completed: true, completedAt: new Date(), completedBy: john.id },
          { title: 'Configure microservices', position: 1, completed: true, completedAt: new Date(), completedBy: john.id },
          { title: 'Setup Angular app', position: 2, completed: false },
          { title: 'Configure Docker', position: 3, completed: false },
        ],
      },
    },
  });

  // Task 2 - To Do
  await prisma.task.create({
    data: {
      key: 'WEB-2',
      title: 'Fix responsive navigation',
      description: 'Navigation menu breaks on mobile devices below 768px width',
      columnId: todoColumn.id,
      position: 0,
      priority: 'URGENT',
      status: 'TODO',
      points: 3,
      creatorId: jane.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      estimatedHours: 4,
      assignees: {
        create: {
          userId: jane.id,
          assignedBy: admin.id,
        },
      },
      labels: {
        create: [
          { labelId: bugLabel.id },
          { labelId: designLabel.id },
        ],
      },
    },
  });

  // Task 3 - Review
  await prisma.task.create({
    data: {
      key: 'WEB-3',
      title: 'Implement user authentication',
      description: 'JWT-based authentication with refresh tokens and role-based access control',
      columnId: reviewColumn.id,
      position: 0,
      priority: 'HIGHEST',
      status: 'IN_REVIEW',
      points: 8,
      creatorId: admin.id,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      estimatedHours: 24,
      actualHours: 20,
      assignees: {
        create: {
          userId: john.id,
          assignedBy: admin.id,
        },
      },
      labels: {
        create: {
          labelId: featureLabel.id,
        },
      },
      comments: {
        create: [
          {
            content: 'Great work on the implementation! Just a few minor suggestions on the refresh token flow.',
            authorId: admin.id,
          },
          {
            content: 'Thanks! I\'ll update it now.',
            authorId: john.id,
          },
        ],
      },
    },
  });

  // Task 4 - Done
  await prisma.task.create({
    data: {
      key: 'WEB-4',
      title: 'Design system foundations',
      description: 'Create color palette, typography scale, and spacing system',
      columnId: doneColumn.id,
      position: 0,
      priority: 'HIGH',
      status: 'DONE',
      points: 5,
      creatorId: jane.id,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      estimatedHours: 16,
      actualHours: 14,
      assignees: {
        create: {
          userId: jane.id,
        },
      },
      labels: {
        create: {
          labelId: designLabel.id,
        },
      },
    },
  });

  // Task 5 - Backlog
  await prisma.task.create({
    data: {
      key: 'WEB-5',
      title: 'Add dark mode support',
      description: 'Implement dark mode theme with user preference persistence',
      columnId: backlogColumn.id,
      position: 0,
      priority: 'MEDIUM',
      status: 'TODO',
      points: 3,
      creatorId: jane.id,
      labels: {
        create: {
          labelId: featureLabel.id,
        },
      },
    },
  });

  console.log(`✅ Created ${5} tasks`);
  console.log('');

  // Créer quelques notifications
  console.log('🔔 Creating notifications...');
  
  await prisma.notification.create({
    data: {
      userId: john.id,
      type: 'TASK_ASSIGNED',
      title: 'New task assigned',
      message: `You have been assigned to "${task1.title}"`,
      entityType: 'TASK',
      entityId: task1.id,
      actionUrl: `/projects/${project.id}/tasks/${task1.id}`,
    },
  });

  console.log(`✅ Created notifications`);
  console.log('');

  console.log('═══════════════════════════════════════════════');
  console.log('🎉 Database seeding completed successfully!');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('📧 Test Accounts:');
  console.log('');
  console.log('  Admin:');
  console.log('    Email: admin@pmp.dev');
  console.log('    Password: Password123!');
  console.log('');
  console.log('  John Doe (Developer):');
  console.log('    Email: john.doe@pmp.dev');
  console.log('    Password: Password123!');
  console.log('');
  console.log('  Jane Smith (Designer):');
  console.log('    Email: jane.smith@pmp.dev');
  console.log('    Password: Password123!');
  console.log('');
  console.log('📊 Created Data:');
  console.log(`  - ${3} users`);
  console.log(`  - ${1} project (${project.key})`);
  console.log(`  - ${project.boards[0].columns.length} columns`);
  console.log(`  - ${5} tasks`);
  console.log(`  - ${project.labels.length} labels`);
  console.log('');
  console.log('🚀 You can now start the application with:');
  console.log('   npm run start:dev');
  console.log('');
}

main()
  .catch((e) => {
    console.error('');
    console.error('❌ Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });