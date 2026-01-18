import { User, UserPreferences } from '../domain/entities';
import { IRepository } from './IRepository.base';

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByClerkId(clerkId: string): Promise<User | null>;
  updatePreferences(id: string, preferences: UserPreferences): Promise<User>;
  addAttributes(id: string, attributes: string[]): Promise<User>;
}
