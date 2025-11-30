export const checkOwnership = (Model, idParam = "id") => {
    return async (req, res, next) => {
        try {
            const resource = await Model.findById(req.params[idParam]);
            if (!resource) return res.status(404).json({ message: "Ressource introuvable" });

            const ownerId = resource.authorId?.toString();
            const requesterId = req.user._id?.toString();

            if (ownerId !== requesterId && req.user.role !== "admin") {
                return res.status(403).json({ message: "Permission refusée" });
            }
            req.resource = resource;
            next();
        } catch (err) {
            next(err);
        }
    };
};
