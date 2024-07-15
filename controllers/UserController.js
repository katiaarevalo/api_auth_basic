import { Router } from 'express';
import UserService from '../services/UserService.js';
import NumberMiddleware from '../middlewares/number.middleware.js';
import UserMiddleware from '../middlewares/user.middleware.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', async (req, res) => {
    try {
        const response = await UserService.createUser(req);
        res.status(response.code).json(response.message);
    } catch (error) {
        console.error("Error in createUser controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get(
    "/getAllUsers",
    [AuthMiddleware.validateToken, UserMiddleware.hasPermissions],
    async (req, res) => {
        try {
            const response = await UserService.getAllUsers();
            res.status(response.code).json(response.message);
        } catch (error) {
            console.error("Error in getAllUsers controller:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.get(
    "/findUsers",
    [AuthMiddleware.validateToken, UserMiddleware.hasPermissions],
    async (req, res) => {
      const response = await UserService.findUsers(req);
      res.status(response.code).json(response.message);
    }
);

router.get(
    '/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        try {
            const response = await UserService.getUserById(req.params.id);
            res.status(response.code).json(response.message);
        } catch (error) {
            console.error("Error in getUserById controller:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.put('/:id', [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async(req, res) => {
        try {
            const response = await UserService.updateUser(req);
            res.status(response.code).json(response.message);
        } catch (error) {
            console.error("Error in updateUser controller:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.delete('/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async (req, res) => {
        try {
            const response = await UserService.deleteUser(req.params.id);
            res.status(response.code).json(response.message);
        } catch (error) {
            console.error("Error in deleteUser controller:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.post('/bulkCreate', [
    AuthMiddleware.validateToken,
    UserMiddleware.hasPermissions
], async (req, res) => {
    try {
        const response = await UserService.bulkCreateUsers(req.body);
        res.status(response.code).json(response.message);
    } catch (error) {
        console.error("Error in bulkCreateUsers controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;