import { body } from "express-validator";

export const registerValidator = [
    body("username")
        .isAlphanumeric().withMessage("Username alphanumérique requis")
        .isLength({ min: 3, max: 30 }).withMessage("Username 3-30 caractères"),
    body("email").isEmail().withMessage("Email invalide"),
    body("password").isLength({ min: 8 }).withMessage("Mot de passe min 8 caractères")
];

export const loginValidator = [
    body("email").isEmail().withMessage("Email invalide"),
    body("password").exists().withMessage("Mot de passe requis")
];
