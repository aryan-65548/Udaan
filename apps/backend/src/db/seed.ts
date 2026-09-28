import { db, pool } from './index';
import { seedLocations } from './seeds/locations';
import { seedBusinessCategories } from './seeds/business-categories';
import { seedSchemes } from './seeds/schemes';
import { seedQuestionnaireQuestions } from './seeds/questionnaire';
import { seedReportResources } from './seeds/reports';

export async function runAllSeeds() {
  console.log('Seeding initial data...');
  try {
    console.log('1. Seeding locations...');
    await seedLocations(db);
    console.log('2. Seeding business categories...');
    await seedBusinessCategories(db);
    console.log('3. Seeding schemes...');
    await seedSchemes(db);
    console.log('4. Seeding questionnaire questions...');
    await seedQuestionnaireQuestions(db);
    console.log('5. Seeding report templates, support organizations & videos...');
    await seedReportResources(db);
    console.log('All seeds completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

if (require.main === module) {
  runAllSeeds()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Seed script failed:', err);
      await pool.end();
      process.exit(1);
    });
}
