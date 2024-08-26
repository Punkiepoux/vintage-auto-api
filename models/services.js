import { Schema, model } from "mongoose";

// Définir le schéma du service
const serviceSchema = new Schema({
    name: { type: String, required: true, unique: true},
    description: { type: String, required: true },
    price: { type: String, required: true },
});

// Créer le modèle Service
const Service = model("Service", serviceSchema);

export default Service;