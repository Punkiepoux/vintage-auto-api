import express, { json } from "express";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcrypt';
import Admin from './models/admin.js';
import Contact from './models/contact.js';
import Partner from './models/partners.js';
import Photo from './models/photos.js';
import Service from './models/services.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017/clubDB?authSource=clubDB';
const app = express();
const PORT = process.env.PORT || 3000;

// Utiliser CORS pour autoriser toutes les requêtes cross-origin
app.use(cors({
  origin: 'http://localhost:4200' // Autoriser uniquement votre application Angular
}));

// Middleware pour parser les JSON
app.use(express.json());

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
// Récupère tous les admins
app.get("/api/admin", async (req, res) => { 
  try {
    const admin = await Admin.find(); // Récupérer les informations de l'admin de la base de données
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des informations de l\'admin', error });
  }
});

// Récupère un administrateur grâce à son username
app.get('/api/admin/:username', async (req, res) => {
  const adminUsername = req.params.username;
  try {
    const admin = await Admin.findOne({username : adminUsername});
    if (admin) {
      res.status(200).json(admin);
    } else {
      res.status(404).json({ message: "Administrateur non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'administrateur', error });
  }
});

// Crée un nouvel administrateur
app.post('/api/admin', async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const existingAdmin = await Admin.findOne({ username });
    const existingEmail = await Admin.findOne({ email });
    if (existingAdmin || existingEmail) {
      return res.status(400).json({ message: "L'administrateur existe déjà" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
    const admin = new Admin(req.body);
    const result = await admin.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'administrateur', error: error.message });
  }
});

// Met à jour les informations de l'administrateur (username/email)
app.patch('/api/admin/update-profile/:username', async (req, res) => {
  const { username } = req.params;
  const { newUsername, newEmail } = req.body; // Supposez que vous ajoutez un champ `image` dans le modèle Admin

  try {
    const updatedFields = {};
    if (newUsername) updatedFields.username = newUsername;
    if (newEmail) updatedFields.email = newEmail;

    const result = await Admin.findOneAndUpdate({ username }, updatedFields, { new: true });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Administrateur non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error });
  }
});

// Change le mot de passe si l'ancien mot de passe est correct
app.patch('/api/admin/change-password/:username', async (req, res) => {
  const { username } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;
    await admin.save();

    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe', error });
  }
});


// Supprime un administrateur grâce à son username
app.delete('/api/admin/:username', async (req, res) => {
  const adminUsername = req.params.username; 
  try {
    const result = await Admin.findOneAndDelete({ username: adminUsername });
    if (result) {
      res.status(200).json({ message: 'Administrateur supprimé avec succès' });
    } else {
      res.status(404).json({ message: "Administrateur non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'administrateur', error });
  }
});

// Vérifie les informations de connexion de l'administrateur
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    res.status(200).json({ message: "Authentification réussie", username });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'authentification', error: error.message });
  }
});


/* Club Info */
// Récupère les informations du club
app.get("/api/contact", async (req, res) => {
  try {
    const contact = await Contact.find(); 
    if (contact.length > 0) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: "Aucune information de contact trouvée" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des informations du club', error });
  }
});

// Crée les informations du club
app.post('/api/contact', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    const result = await contact.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création des informations du club', error });
  }
});

// Met à jour les informations du club
app.patch('/api/contact', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    const result = await Contact.findOneAndUpdate({}, updateData, { new: true });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Informations du club non trouvées" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des informations du club', error });
  }
});


/* Partenaires */
// Récupère la liste de tous les partenaires
app.get("/api/partners", async (req, res) => {
  try {
    const partners = await Partner.find(); 
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des partenaires', error });
  }
});

// Récupère un partenaire grâce à son nom
app.get('/api/partners/:name', async (req, res) => {
  const partnerName = req.params.name;
  try {
    const partner = await Partner.findOne({name : partnerName});
    if (partner) {
      res.status(200).json(partner);
    } else {
      res.status(404).json({ message: "Partenaire non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du partenaire', error });
  }
});

// Crée un nouveau partenaire
app.post('/api/partners', async (req, res) => {
  try {
    const partner = new Partner(req.body);
    const result = await partner.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du partenaire', error });
  }
});

// Met à jour les informations du partenaire
app.patch('/api/partners/:name', async (req, res) => {
  const partnerName = req.params.name;
  try {
    const result = await Partner.findOneAndUpdate({name : partnerName}, req.body, { new: true });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Partenaire non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du partenaire', error });
  }
});

// Supprime un partenaire grâce à son nom
app.delete('/api/partners/:name', async (req, res) => {
  const partnerName = req.params.name; 
  try {
    const result = await Partner.findOneAndDelete({name : partnerName});
    if (result) {
      res.status(200).json({ message: 'Partenaire supprimé avec succès' });
    } else {
      res.status(404).json({ message: "Partenaire non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du partenaire', error });
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

// Récupère une photo grâce à son nom
app.get('/api/photos/:picture', async (req, res) => {
  const photoPicture = req.params.picture;
  try {
    const photo = await Photo.findOne({picture : photoPicture});
    if (photo) {
      res.status(200).json(photo);
    } else {
      res.status(404).json({ message: "Photo non trouvée" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la photo', error });
  }
});

// Crée une nouvelle photo
app.post('/api/photos', async (req, res) => {
  try {
    const photo = new Photo(req.body);
    const result = await photo.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la photo', error });
  }
});

// Supprime une photo grâce à son nom
app.delete('/api/photos/:picture', async (req, res) => {
  const photoPicture = req.params.picture;
  try {
    const result = await Photo.findOneAndDelete({picture : photoPicture});
    if (result) {
      res.status(200).json({ message: 'Photo supprimée avec succès' });
    } else {
      res.status(404).json({ message: "Photo non trouvée" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la photo', error });
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

// Récupère un service grâce à son nom
app.get('/api/services/:name', async (req, res) => {
  const serviceName = req.params.name;
  try {
    const service = await Service.findOne({name : serviceName});
    if (service) {
      res.status(200).json(service);
    } else {
      res.status(404).json({ message: "Service non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du service', error });
  }
});

// Crée un nouveau service
app.post('/api/services', async (req, res) => {
  try {
    const service = new Service(req.body);
    const result = await service.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du service', error });
  }
});

// Met à jour les informations du service
app.patch('/api/services/:name', async (req, res) => {
  const serviceName = req.params.name;
  try {
    const result = await Service.findOneAndUpdate({name : serviceName}, req.body, { new: true });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Service non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du service', error });
  }
});

// Supprime un service grâce à son nom
app.delete('/api/services/:name', async (req, res) => {
  const serviceName = req.params.name; 
  try {
    const result = await Service.findOneAndDelete({name : serviceName});
    if (result) {
      res.status(200).json({ message: 'Service supprimé avec succès' });
    } else {
      res.status(404).json({ message: "Service non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du service', error });
  }
});


// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
