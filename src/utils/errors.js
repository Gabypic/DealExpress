export const handleValidationErrors = (req, res, next) => {
    // express-validator errors
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
