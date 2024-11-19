require('dotenv').config();
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserService {
  // Schema Joi untuk validasi
  static userSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  static updateSchema = Joi.object({
    name: Joi.string().min(3).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
  });

  // Create user
  async createUser(userData) {
    const { error } = UserService.userSchema.validate(userData);
    if (error) throw new Error(`Validation Error: ${error.message}`);

    
    return prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      },
    });
    
  }

  // Get all users
  async getUsers() {
    return prisma.user.findMany();
  }

  // Get user by ID
  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  // Update user
  async updateUser(id, data) {
    const { error } = UserService.updateSchema.validate(data);
    if (error) throw new Error(`Validation Error: ${error.message}`);
  
    // Cek apakah email baru sudah ada di database
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email is already in use by another user.');
      }
    }
  
    return prisma.user.update({
      where: { id },
      data,
    });
  }

 
  // Delete user
  async deleteUser(id) {
    return prisma.user.delete({
      where: { id },
    });
  }
}


module.exports = UserService;
