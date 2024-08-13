import express, { json } from "express";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/admin.js';
import Contact from './models/contact.js';
import Partner from './models/partners.js';
import Photo from './models/photos.js';
import Service from './models/services.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017/clubDB?authSource=clubDB';
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser les JSON
app.use(json());

// Connectez-vous à MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connexion:'));
db.once('open', () => {
  console.log('Connecté à MongoDB');
});

// Middleware pour parser le JSON
app.use(express.json());

// Point de terminaison pour vérifier la connexion à la base de données
app.get("/api/check-connection", async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1; // 1 signifie que la connexion est ouverte
    res.status(200).json({ connected: isConnected });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification de la connexion à la base de données', error });
  }
});

/* Admin */
//Récupère tous les admins
app.get("/api/admin", async (req, res) => { 
  try {
    const admin = await Admin.findOne(); // Récupérer les informations de l'admin de la base de données
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des informations de l\'admin', error });
  }
});

// Supprime un administrateur grâce à son ID
app.delete('/api/admin/:id', async (req, res) => {
  const adminId = req.params.id; 
  try {
    const result = await Admin.findByIdAndDelete(adminId);
    if (result) {
      res.status(200).json({ message: 'Administrateur supprimé avec succès' });
    } else {
      res.status(404).json({ message: "Administrateur non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'administrateur', error });
  }
});


/* Club Info */
// Récupère les informations du club
app.get("/api/contact", async (req, res) => {
  try {
    const contact = await Contact.findOne(); 
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des informations du club', error });
  }
});

/* Partenaires */
//Récupère la liste de tous les partenaires
app.get("/api/partners", async (req, res) => {
  try {
    const partners = await Partner.find(); 
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des partenaires', error });
  }
});

/* Photos */
// Récupère toutes les photos
app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.find(); 
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des photos', error });
  }
});

/* Services */
// Récupère la liste de tous les services
app.get("/api/services", async (req, res) => {
  try {
    const services = await Service.find(); 
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des services', error });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
