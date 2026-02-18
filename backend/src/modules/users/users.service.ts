import { User, UserRole, UserStatus } from '../../database/models/User';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class UsersService {
  async createUser(data: { name: string; email: string; role: UserRole }) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await User.create({
      ...data,
      isOnboarded: false
    });
    return user;
  }

  async getUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments()
    ]);

    return { users, total, page, pages: Math.ceil(total / limit) };
  }

  async getUserById(id: string) {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateUser(id: string, data: { name?: string; status?: UserStatus }) {
    const user = await User.findByIdAndUpdate(id, data, { new: true });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
}
