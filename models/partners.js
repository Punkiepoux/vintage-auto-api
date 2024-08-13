import { Schema, Types, model } from "mongoose";

// Définir le schéma du partenaire
const partnerSchema = new Schema({
    name: { type: String, required: true, unique: true},
    lien: { type: String, required: true },
    logo: { type: String, required: true },
    description: { type: String, required: true },
});

// Créer le modèle Partenaire
const Partner = model("Partner", partnerSchema);

export default Partner;