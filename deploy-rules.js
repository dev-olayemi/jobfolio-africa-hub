import { exec } from 'child_process';

console.log('Deploying Firestore rules...');

exec('firebase deploy --only firestore:rules', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log('Firestore rules deployed successfully!');
});