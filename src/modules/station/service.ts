import type { StationRepository } from "./repository";

export class StationService {
  private repository: StationRepository;

  constructor(repository: StationRepository) {
    this.repository = repository;
  }

  async create(name: string, location: string) {
    if (!name || !location) throw new Error("name and location are required");
    return this.repository.create({ name, location });
  }

  async list() {
    return this.repository.findAll();
  }

  async get(id: number) {
    const station = await this.repository.findById(id);
    if (!station) throw new Error("Station not found");
    return station;
  }

  async update(id: number, data: { name?: string; location?: string }) {
    await this.get(id); // ensure exists
    return this.repository.update(id, data);
  }

  async remove(id: number) {
    await this.get(id); // ensure exists
    return this.repository.delete(id);
  }
}
