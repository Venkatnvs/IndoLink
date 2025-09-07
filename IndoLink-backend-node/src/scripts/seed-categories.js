require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/category.model');

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/indolink';
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  const categories = [
    { name: 'Electronics', description: 'Mobiles, laptops, cameras and accessories' },
    { name: 'Computers & Accessories', description: 'Desktops, components, peripherals' },
    { name: 'Mobile Phones & Accessories', description: 'Smartphones, chargers, cases' },
    { name: 'Cameras & Photo', description: 'DSLRs, lenses, tripods' },
    { name: 'TV, Audio & Home Theater', description: 'Televisions, speakers, soundbars' },
    { name: 'Home & Kitchen', description: 'Appliances, cookware, decor' },
    { name: 'Furniture', description: 'Living room, bedroom, office furniture' },
    { name: 'Fashion', description: 'Men, women, kids clothing and accessories' },
    { name: 'Shoes', description: 'Sneakers, formal, sports footwear' },
    { name: 'Jewelry', description: 'Gold, silver, fashion jewelry' },
    { name: 'Beauty & Personal Care', description: 'Skincare, haircare, grooming' },
    { name: 'Health & Household', description: 'Wellness, medical supplies, cleaning' },
    { name: 'Grocery & Gourmet', description: 'Daily essentials, snacks, beverages' },
    { name: 'Sports & Outdoors', description: 'Fitness, cycling, outdoor gear' },
    { name: 'Toys & Games', description: 'Learning toys, board games, action figures' },
    { name: 'Baby', description: 'Diapers, strollers, baby care' },
    { name: 'Pet Supplies', description: 'Food, accessories, grooming for pets' },
    { name: 'Books', description: 'Fiction, non-fiction, textbooks' },
    { name: 'Music', description: 'Instruments, accessories, audio media' },
    { name: 'Video Games', description: 'Consoles, games, accessories' },
    { name: 'Office Products', description: 'Stationery, office electronics, supplies' },
    { name: 'Automotive', description: 'Car/bike accessories, oils, spares' },
    { name: 'Industrial & Scientific', description: 'Lab equipment, tools, measurement' },
    { name: 'Tools & Home Improvement', description: 'Power tools, hardware, lighting' },
    { name: 'Garden & Outdoors', description: 'Plants, tools, outdoor living' },
    { name: 'Luggage', description: 'Suitcases, backpacks, travel accessories' },
    { name: 'Arts & Crafts', description: 'Supplies for art, craft, DIY' },
    { name: 'Software', description: 'Operating systems, productivity, security' },
  ];

  for (const item of categories) {
    const exists = await Category.findOne({ name: item.name });
    if (!exists) {
      await Category.create(item);
      console.log(`Inserted: ${item.name}`);
    } else {
      console.log(`Exists: ${item.name}`);
    }
  }

  const count = await Category.countDocuments();
  console.log(`Total categories: ${count}`);

  await mongoose.disconnect();
}

main()
  .then(() => {
    console.log('Category seeding completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });


