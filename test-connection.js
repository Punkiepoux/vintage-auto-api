import mongoose from 'mongoose';

mongoose.connect('mongodb://admin:admin@mongodb_container:27017/clubDB?authSource=clubDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connexion réussie à MongoDB');
  process.exit(0);
})
.catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
  process.exit(1);
});