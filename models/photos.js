import { Schema, Types, model } from "mongoose";

// Définir le schéma de la photo
const photoSchema = new Schema({
    picture: { type: String, required: true, unique: true},
});

// Créer le modèle Photo
const Photo = model("Photo", photoSchema);

export default Photo;
