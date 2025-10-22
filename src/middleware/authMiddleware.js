const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).send({ success: false, message: 'Unauthorized: No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user ={ id:decoded.id, role: decoded.role };

        next();

    } catch (error) {

        return res.status(401).send({ success: false, message: 'Invalid or token doesnt exist' });
    }

}
