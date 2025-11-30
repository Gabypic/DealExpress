import { body } from "express-validator";

export const dealValidator = [
    body("title").isLength({ min: 5, max: 100 }).withMessage("Title 5-100 caractères"),
    body("description").isLength({ min: 10, max: 500 }).withMessage("Description 10-500 caractères"),
    body("price").isFloat({ min: 0 }).withMessage("Price doit être >= 0"),
    body("category").isIn(["High-Tech", "Maison", "Mode", "Loisirs", "Autre"]).withMessage("Catégorie invalide"),
];
