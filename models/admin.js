import { Schema, Types, model } from "mongoose";

// Définir le schéma de l'administrateur
const adminSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Créer le modèle Admin
const Admin = model("Admin", adminSchema);

export default Admin;