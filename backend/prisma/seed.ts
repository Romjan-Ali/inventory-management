import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in correct order for foreign keys)
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.item.deleteMany();
  await prisma.inventoryAccess.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@inventory.com',
        name: 'Admin User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isAdmin: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'john.doe@company.com',
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@company.com',
        name: 'Jane Smith',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.wilson@company.com',
        name: 'Bob Wilson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      },
    }),
  ]);

  console.log(`👥 Created ${users.length} users`);

  // Create inventories with custom field configurations
  const officeEquipmentInventory = await prisma.inventory.create({
    data: {
      title: 'Company Office Equipment',
      description: 'Tracking all computer equipment and office devices owned by the company. Includes laptops, desktops, monitors, and peripherals.',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
      category: 'Equipment',
      tags: ['computers', 'electronics', 'office'],
      isPublic: false,
      creatorId: users[0].id, // Admin user
      
      // Custom field configurations
      string1Name: 'Device Model',
      string1Description: 'Manufacturer and model name',
      string1Visible: true,
      string1Order: 0,
      
      string2Name: 'Serial Number',
      string2Description: 'Device serial number',
      string2Visible: true,
      string2Order: 1,
      
      string3Name: 'Assigned To',
      string3Description: 'Employee name this device is assigned to',
      string3Visible: true,
      string3Order: 2,
      
      number1Name: 'Purchase Price',
      number1Description: 'Original purchase price in USD',
      number1Visible: true,
      number1Order: 3,
      
      number2Name: 'Purchase Year',
      number2Description: 'Year the device was purchased',
      number2Visible: true,
      number2Order: 4,
      
      boolean1Name: 'Under Warranty',
      boolean1Description: 'Is the device still under manufacturer warranty?',
      boolean1Visible: true,
      boolean1Order: 5,
      
      boolean2Name: 'Needs Maintenance',
      boolean2Description: 'Does the device require maintenance?',
      boolean2Visible: true,
      boolean2Order: 6,
      
      link1Name: 'Purchase Receipt',
      link1Description: 'Link to digital purchase receipt',
      link1Visible: false,
      link1Order: 7,
      
      customIdFormat: [
        { type: 'fixed', value: 'COMP-' },
        { type: 'date', format: 'YYYY' },
        { type: 'fixed', value: '-' },
        { type: 'random32', format: 'hex' },
        { type: 'fixed', value: '-' },
        { type: 'sequence', format: '000' }
      ],
    },
  });

  const companyLibraryInventory = await prisma.inventory.create({
    data: {
      title: 'Company Library Books',
      description: 'Collection of technical books and resources available for employees. Includes programming, design, and business books.',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop',
      category: 'Book',
      tags: ['books', 'library', 'education', 'resources'],
      isPublic: true,
      creatorId: users[1].id, // John Doe
      
      string1Name: 'Book Title',
      string1Description: 'Full title of the book',
      string1Visible: true,
      string1Order: 0,
      
      string2Name: 'Authors',
      string2Description: 'Author names separated by commas',
      string2Visible: true,
      string2Order: 1,
      
      string3Name: 'Publisher',
      string3Description: 'Book publisher',
      string3Visible: false,
      string3Order: 2,
      
      text1Name: 'Description',
      text1Description: 'Brief description or summary',
      text1Visible: true,
      text1Order: 3,
      
      number1Name: 'Publication Year',
      number1Description: 'Year the book was published',
      number1Visible: true,
      number1Order: 4,
      
      number2Name: 'Page Count',
      number2Description: 'Total number of pages',
      number2Visible: false,
      number2Order: 5,
      
      boolean1Name: 'Available',
      boolean1Description: 'Is the book currently available for borrowing?',
      boolean1Visible: true,
      boolean1Order: 6,
      
      link1Name: 'Amazon Link',
      link1Description: 'Link to purchase or learn more',
      link1Visible: false,
      link1Order: 7,
      
      customIdFormat: [
        { type: 'fixed', value: 'BOOK-' },
        { type: 'sequence', format: '00000' }
      ],
    },
  });

  const electronicsPartsInventory = await prisma.inventory.create({
    data: {
      title: 'Electronics Components',
      description: 'Inventory of electronic components and parts for prototyping and repairs. Includes resistors, capacitors, ICs, and connectors.',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
      category: 'Equipment',
      tags: ['electronics', 'components', 'prototyping', 'repairs'],
      isPublic: false,
      creatorId: users[2].id, // Jane Smith
      
      string1Name: 'Component Type',
      string1Description: 'Type of electronic component',
      string1Visible: true,
      string1Order: 0,
      
      string2Name: 'Specifications',
      string2Description: 'Technical specifications (e.g., 10kΩ 1/4W)',
      string2Visible: true,
      string2Order: 1,
      
      string3Name: 'Manufacturer',
      string3Description: 'Component manufacturer',
      string3Visible: false,
      string3Order: 2,
      
      number1Name: 'Quantity',
      number1Description: 'Current stock quantity',
      number1Visible: true,
      number1Order: 3,
      
      number2Name: 'Unit Price',
      number2Description: 'Price per unit in USD',
      number2Visible: true,
      number2Order: 4,
      
      number3Name: 'Reorder Level',
      number3Description: 'Minimum quantity before reordering',
      number3Visible: false,
      number3Order: 5,
      
      link1Name: 'Datasheet',
      link1Description: 'Link to component datasheet',
      link1Visible: true,
      link1Order: 6,
      
      customIdFormat: [
        { type: 'fixed', value: 'PART-' },
        { type: 'fixed', value: 'ELEC-' },
        { type: 'sequence', format: '0000' }
      ],
    },
  });

  console.log(`📦 Created ${3} inventories`);

  // Grant access to inventories
  await prisma.inventoryAccess.createMany({
    data: [
      {
        inventoryId: officeEquipmentInventory.id,
        userId: users[1].id,
        canWrite: true,
      },
      {
        inventoryId: electronicsPartsInventory.id,
        userId: users[2].id,
        canWrite: true,
      },
      {
        inventoryId: officeEquipmentInventory.id,
        userId: users[3].id,
        canWrite: false,
      },
    ],
  });

  console.log('🔐 Created inventory access permissions');

  // Create items for Office Equipment inventory
  const officeEquipmentItems = await Promise.all([
    prisma.item.create({
      data: {
        customId: 'COMP-2023-A1B2C3D4-001',
        inventoryId: officeEquipmentInventory.id,
        creatorId: users[0].id,
        string1Value: 'Dell XPS 15 9520',
        string2Value: 'SN-XPS15-2023-001',
        string3Value: 'John Doe',
        number1Value: 1899.99,
        number2Value: 2023,
        boolean1Value: true,
        boolean2Value: false,
        link1Value: 'https://example.com/receipts/xps15-001.pdf',
      },
    }),
    prisma.item.create({
      data: {
        customId: 'COMP-2022-E5F6G7H8-002',
        inventoryId: officeEquipmentInventory.id,
        creatorId: users[1].id,
        string1Value: 'Apple MacBook Pro 14"',
        string2Value: 'SN-MBP14-2022-045',
        string3Value: 'Jane Smith',
        number1Value: 1999.00,
        number2Value: 2022,
        boolean1Value: false,
        boolean2Value: true,
        link1Value: 'https://example.com/receipts/mbp14-045.pdf',
      },
    }),
    prisma.item.create({
      data: {
        customId: 'COMP-2023-I9J0K1L2-003',
        inventoryId: officeEquipmentInventory.id,
        creatorId: users[0].id,
        string1Value: 'Dell UltraSharp 27" Monitor',
        string2Value: 'SN-U2722DE-2023-127',
        string3Value: 'Bob Wilson',
        number1Value: 429.99,
        number2Value: 2023,
        boolean1Value: true,
        boolean2Value: false,
      },
    }),
  ]);

  // Create items for Company Library inventory
  const libraryItems = await Promise.all([
    prisma.item.create({
      data: {
        customId: 'BOOK-00001',
        inventoryId: companyLibraryInventory.id,
        creatorId: users[1].id,
        string1Value: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        string2Value: 'Robert C. Martin',
        string3Value: 'Prentice Hall',
        text1Value: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. This book is a must-read for any developer, software engineer, project manager, team lead, or systems analyst with an interest in producing better code.',
        number1Value: 2008,
        number2Value: 464,
        boolean1Value: true,
        link1Value: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882',
      },
    }),
    prisma.item.create({
      data: {
        customId: 'BOOK-00002',
        inventoryId: companyLibraryInventory.id,
        creatorId: users[1].id,
        string1Value: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        string2Value: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        string3Value: 'Addison-Wesley Professional',
        text1Value: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.',
        number1Value: 1994,
        number2Value: 395,
        boolean1Value: false,
        link1Value: 'https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612',
      },
    }),
    prisma.item.create({
      data: {
        customId: 'BOOK-00003',
        inventoryId: companyLibraryInventory.id,
        creatorId: users[2].id,
        string1Value: 'The Pragmatic Programmer: Your Journey To Mastery',
        string2Value: 'David Thomas, Andrew Hunt',
        string3Value: 'Addison-Wesley Professional',
        text1Value: 'Written as a series of self-contained sections and filled with practical advice, this book teaches the approaches to programming that lead to success in the real world.',
        number1Value: 2019,
        number2Value: 352,
        boolean1Value: true,
      },
    }),
  ]);

  // Create items for Electronics Components inventory
  const electronicsItems = await Promise.all([
    prisma.item.create({
      data: {
        customId: 'PART-ELEC-0001',
        inventoryId: electronicsPartsInventory.id,
        creatorId: users[2].id,
        string1Value: 'Resistor',
        string2Value: '10kΩ 1/4W 5%',
        string3Value: 'Texas Instruments',
        number1Value: 250,
        number2Value: 0.10,
        number3Value: 50,
        link1Value: 'https://www.ti.com/lit/ds/symlink/tl431.pdf',
      },
    }),
    prisma.item.create({
      data: {
        customId: 'PART-ELEC-0002',
        inventoryId: electronicsPartsInventory.id,
        creatorId: users[2].id,
        string1Value: 'Capacitor',
        string2Value: '100μF 25V Electrolytic',
        string3Value: 'Panasonic',
        number1Value: 120,
        number2Value: 0.25,
        number3Value: 30,
        link1Value: 'https://industrial.panasonic.com/cdbs/www-data/pdf/RDE0000/ABA0000C1214.pdf',
      },
    }),
    prisma.item.create({
      data: {
        customId: 'PART-ELEC-0003',
        inventoryId: electronicsPartsInventory.id,
        creatorId: users[2].id,
        string1Value: 'Microcontroller',
        string2Value: 'ATmega328P-PU',
        string3Value: 'Microchip',
        number1Value: 45,
        number2Value: 3.50,
        number3Value: 10,
        link1Value: 'https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf',
      },
    }),
  ]);

  console.log(`📝 Created ${officeEquipmentItems.length + libraryItems.length + electronicsItems.length} items`);

  // Create some likes
  await prisma.like.createMany({
    data: [
      { itemId: officeEquipmentItems[0].id, userId: users[1].id },
      { itemId: officeEquipmentItems[0].id, userId: users[2].id },
      { itemId: libraryItems[0].id, userId: users[0].id },
      { itemId: libraryItems[0].id, userId: users[2].id },
      { itemId: libraryItems[0].id, userId: users[3].id },
      { itemId: electronicsItems[2].id, userId: users[1].id },
    ],
  });

  console.log('❤️ Created item likes');

  // Create discussion posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        content: 'Just added the new Dell XPS 15 to the inventory. This will be assigned to John for his development work.',
        inventoryId: officeEquipmentInventory.id,
        userId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Thanks for setting up the new laptop! The specs look great for running our development environment.',
        inventoryId: officeEquipmentInventory.id,
        userId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'I noticed the MacBook Pro needs maintenance. The battery life has been decreasing rapidly.',
        inventoryId: officeEquipmentInventory.id,
        userId: users[2].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Just added "Clean Code" to the library. This is an essential read for all our developers!',
        inventoryId: companyLibraryInventory.id,
        userId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'I\'ve borrowed "Clean Code" - will return it in 2 weeks. Looking forward to reading it!',
        inventoryId: companyLibraryInventory.id,
        userId: users[3].id,
      },
    }),
  ]);

  console.log(`💬 Created ${posts.length} discussion posts`);

  console.log('✅ Database seed completed successfully!');
  console.log('');
  console.log('📊 Seed Data Summary:');
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   📝 Items: ${officeEquipmentItems.length + libraryItems.length + electronicsItems.length}`);
  console.log(`   💬 Posts: ${posts.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });