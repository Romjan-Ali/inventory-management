import { prisma } from '../lib/prisma';

export async function testRelations() {
  console.log('🧪 Testing database relations...');

  try {
    // Test user relations
    const userWithRelations = await prisma.user.findFirst({
      include: {
        ownedInventories: true,
        accessibleInventories: {
          include: {
            inventory: true,
          },
        },
        createdItems: true,
        posts: true,
        likes: true,
      },
    });

    console.log('✅ User relations work correctly');

    // Test inventory relations
    const inventoryWithRelations = await prisma.inventory.findFirst({
      include: {
        creator: true,
        items: true,
        accesses: {
          include: {
            user: true,
          },
        },
        posts: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log('✅ Inventory relations work correctly');

    // Test item relations
    const itemWithRelations = await prisma.item.findFirst({
      include: {
        inventory: true,
        creator: true,
        likes: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log('✅ Item relations work correctly');

    console.log('🎉 All relations working correctly!');
    
    return {
      user: userWithRelations,
      inventory: inventoryWithRelations,
      item: itemWithRelations,
    };
  } catch (error) {
    console.error('❌ Relation test failed:', error);
    throw error;
  }
}

testRelations()