import db from '../dist/db/models/index.js';
import bcrypt from 'bcrypt';
import { Op } from "sequelize";

const createUser = async (req) => {
    const {
        name,
        email,
        password,
        password_second,
        cellphone
    } = req.body;
    if (password !== password_second) {
        return {
            code: 400,
            message: 'Passwords do not match'
        };
    }
    const user = await db.User.findOne({
        where: {
            email: email
        }
    });
    if (user) {
        return {
            code: 400,
            message: 'User already exists'
        };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: encryptedPassword,
        cellphone,
        status: true
    });
    return {
        code: 200,
        message: 'User created successfully with ID: ' + newUser.id,
    }
};

const getUserById = async (id) => {
    const user = await db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });
    return {
        code: 200,
        message: user
    };
};

const getAllUsers = async () => {
    const users = await db.User.findAll({
        where: {
            status: true,
        },
    });
    return {
        code: 200,
        message: users
    };
};

const updateUser = async (req) => {
    const user = await db.User.findOne({
        where: {
            id: req.params.id,
            status: true,
        }
    });

    if (!user) {
        return {
            code: 404,
            message: 'User not found'
        };
    }

    const payload = {};
    payload.name = req.body.name ?? user.name;
    payload.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;
    payload.cellphone = req.body.cellphone ?? user.cellphone;

    await db.User.update(payload, {
        where: {
            id: req.params.id
        }
    });

    return {
        code: 200,
        message: 'User updated successfully'
    };
};


const deleteUser = async (id) => {
    const user = await db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });

    if (!user) {
        return {
            code: 404,
            message: 'User not found'
        };
    }

    await db.User.update({
        status: false
    }, {
        where: {
            id: id
        }
    });

    return {
        code: 200,
        message: 'User deleted successfully'
    };
};

const findUsers = async (req) => {
    const { active, name, loginBefore, loginAfter } = req.query;

    const userQuery = {};
    const sessionQuery = {};

    active && (userQuery.status = active === "true" ? true : false);
    name && (userQuery.name = { [Op.like]: `%${name}%` });

    loginAfter &&
        (sessionQuery.createdAt = {
            ...sessionQuery.createdAt,
            [Op.gte]: new Date(loginAfter),
        });
    loginBefore &&
        (sessionQuery.createdAt = {
            ...sessionQuery.createdAt,
            [Op.lte]: new Date(loginBefore),
        });

    const includeObj =
        Object.keys(sessionQuery).length > 0
            ? [
                  {
                      model: db.Session,
                      where: sessionQuery,
                      attributes: [],
                  },
              ]
            : [];

    return {
        code: 200,
        message: await db.User.findAll({
            where: userQuery,
            include: includeObj,
        }),
    };
};

const bulkCreateUsers = async (users) => {
    let contador_exito = 0;
    let contador_fallo = 0;

    const results = await Promise.all(users.map(async (user) => {
        try {
            const { name, email, password, cellphone } = user;
            const encryptedPassword = await bcrypt.hash(password, 10);
            await db.User.create({
                name,
                email,
                password: encryptedPassword,
                cellphone,
                status: true
            });
            contador_exito++;
            return { success: true, user };
        } catch (error) {
            contador_fallo++;
            return { success: false, user, error: error.message };
        }
    }));

    return {
        code: 200,
        message: {
            contador_exito,
            contador_fallo,
            results
        }
    };
};

export default {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    findUsers,
    bulkCreateUsers,
};